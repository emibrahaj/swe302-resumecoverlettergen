"""
Real OAuth 2.0 Authorization Code flow for Google + LinkedIn.

The frontend's "Continue with Google" / "Continue with LinkedIn" buttons send the
user to /auth/oauth/{provider}/start. From there:

  1. Backend generates a CSRF state, persists return_to, redirects to the
     provider's authorization endpoint.
  2. User signs in at Google/LinkedIn with their real account.
  3. Provider redirects back to /auth/oauth/{provider}/callback?code=...&state=...
  4. Backend exchanges the code for an access_token, fetches the user's email
     + name from the provider's userinfo endpoint.
  5. Backend creates-or-signs-in the user via AuthService, issues our own JWT,
     redirects to the frontend's /auth/callback#token=... page.

If the provider's CLIENT_ID + CLIENT_SECRET aren't configured in backend/.env,
the start endpoint falls back to the dev-OAuth simulator so the buttons still
work locally without external credentials.

Required env vars to enable real OAuth (in backend/.env):
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
  BACKEND_BASE_URL   (defaults to http://127.0.0.1:8091)
  FRONTEND_BASE_URL  (defaults to http://localhost:3000)

Authorized redirect URIs you must register at the provider:
  Google:   {BACKEND_BASE_URL}/auth/oauth/google/callback
  LinkedIn: {BACKEND_BASE_URL}/auth/oauth/linkedin/callback
"""
from __future__ import annotations

import os
import secrets
import time
from threading import Lock
from typing import Any, Optional
from urllib.parse import urlencode

import httpx

# How long an OAuth state token is valid for. Generous because real users may
# take a minute or two to authenticate.
STATE_TTL_SECONDS = 600

_state_store: dict[str, dict[str, Any]] = {}
_state_lock = Lock()


def _gc_states() -> None:
    """Prune expired states. Called opportunistically."""
    now = time.time()
    with _state_lock:
        for k in [k for k, v in _state_store.items() if v.get("expires_at", 0) < now]:
            _state_store.pop(k, None)


def _backend_base() -> str:
    return os.environ.get("BACKEND_BASE_URL", "http://127.0.0.1:8091").rstrip("/")


def _frontend_base() -> str:
    return os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")


def _provider_config(provider: str) -> dict[str, Any]:
    p = provider.lower()
    if p == "google":
        return {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
            "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "userinfo_url": "https://openidconnect.googleapis.com/v1/userinfo",
            "scopes": "openid email profile",
        }
    if p == "linkedin":
        return {
            "client_id": os.environ.get("LINKEDIN_CLIENT_ID", ""),
            "client_secret": os.environ.get("LINKEDIN_CLIENT_SECRET", ""),
            "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
            "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
            "userinfo_url": "https://api.linkedin.com/v2/userinfo",  # OpenID Connect endpoint
            "scopes": "openid email profile",
        }
    raise ValueError(f"Unsupported OAuth provider: {provider}")


def is_configured(provider: str) -> bool:
    cfg = _provider_config(provider)
    return bool(cfg["client_id"] and cfg["client_secret"])


def redirect_uri(provider: str) -> str:
    return f"{_backend_base()}/auth/oauth/{provider.lower()}/callback"


def build_authorization_url(provider: str, return_to: str = "/user/dashboard") -> str:
    cfg = _provider_config(provider)
    state = secrets.token_urlsafe(24)
    with _state_lock:
        _state_store[state] = {
            "provider": provider.lower(),
            "return_to": return_to or "/user/dashboard",
            "expires_at": time.time() + STATE_TTL_SECONDS,
        }
    _gc_states()
    params = {
        "client_id": cfg["client_id"],
        "redirect_uri": redirect_uri(provider),
        "response_type": "code",
        "scope": cfg["scopes"],
        "state": state,
        "prompt": "select_account",
    }
    return f"{cfg['auth_url']}?{urlencode(params)}"


def consume_state(state: str) -> Optional[dict[str, Any]]:
    if not state:
        return None
    with _state_lock:
        rec = _state_store.pop(state, None)
    if rec and rec.get("expires_at", 0) >= time.time():
        return rec
    return None


def exchange_code_for_userinfo(provider: str, code: str) -> dict[str, Any]:
    """Trade an OAuth code for the user's email + name. Returns dict with
    at least 'email' and 'name' keys. Raises RuntimeError on any failure."""
    cfg = _provider_config(provider)
    token_payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri(provider),
        "client_id": cfg["client_id"],
        "client_secret": cfg["client_secret"],
    }

    with httpx.Client(timeout=15.0) as client:
        token_res = client.post(
            cfg["token_url"],
            data=token_payload,
            headers={"Accept": "application/json"},
        )
        if token_res.status_code != 200:
            raise RuntimeError(f"{provider} token exchange failed: {token_res.status_code} {token_res.text[:300]}")
        token_json = token_res.json()
        access_token = token_json.get("access_token")
        if not access_token:
            raise RuntimeError(f"{provider} token response missing access_token: {token_json}")

        userinfo_res = client.get(
            cfg["userinfo_url"],
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        )
        if userinfo_res.status_code != 200:
            raise RuntimeError(
                f"{provider} userinfo fetch failed: {userinfo_res.status_code} {userinfo_res.text[:300]}"
            )
        info = userinfo_res.json()

    # Normalize across providers — both Google and LinkedIn OIDC return these.
    email = info.get("email") or info.get("emailAddress") or ""
    name = info.get("name") or " ".join(
        filter(None, [info.get("given_name"), info.get("family_name")])
    ).strip()
    sub = info.get("sub") or info.get("id") or ""
    if not email:
        raise RuntimeError(f"{provider} did not return an email address (info: {list(info.keys())})")
    return {"email": email, "name": name or email.split("@")[0], "sub": sub, "raw": info}
