import os
import secrets
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AuthSchema import UserRegister, UserLogin, ResetPasswordSchema, ForgotPasswordRequest
from backend.services.AuthService import AuthService
from backend.services.ResumeService import ResumeService
from backend.services import OAuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def sign_up(user_data: UserRegister, db_client: Client = Depends(db.get_db), pending_resume_id: str = None):
    resume_service = ResumeService(db_client)
    try:
        auth_service = AuthService(db_client)
        res = auth_service.register(user_data)
        if pending_resume_id:
            resume_service.claim_resume(pending_resume_id, res.user.id)
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": res.user,
            "access_token": getattr(getattr(res, "session", None), "access_token", None),
            "refresh_token": getattr(getattr(res, "session", None), "refresh_token", None),
            "token_type": "bearer",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def log_in(credentials: UserLogin, db_client: Client = Depends(db.get_db), pending_resume_id: str = None):
    try:
        auth_service = AuthService(db_client)
        res = auth_service.login(credentials)
        if pending_resume_id:
            try:
                ResumeService(db_client).claim_resume(pending_resume_id, str(res.user.id))
            except Exception:
                pass
        return {
            "status": "success",
            "message": "User logged in successfully",
            "token_type": "bearer",
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": res.user,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db_client: Client = Depends(db.get_db)):
    try:
        db_client.auth.reset_password_for_email(
            data.email,
            options={"redirectTo": "http://localhost:3000/reset-password"}
        )
    except Exception as e:
        print(str(e))
    return {"message": "If an account exists for this email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordSchema, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    try:
        db_client.auth.update_user({"password": data.new_password})
        return {"message": "Password reset successfully.", "user_id": get_user_id(current_user)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ───────────────────────────────────────────────────────────────────────────
# OAuth (Google + LinkedIn)
#
# Dev mode (default while no GOOGLE_CLIENT_ID/LINKEDIN_CLIENT_ID is set):
#   The frontend "Continue with Google/LinkedIn" buttons call /auth/oauth-dev
#   which creates or signs in a stable per-browser demo account so the flow
#   works end-to-end without external OAuth credentials.
#
# Real mode (future swap-in):
#   Fill in GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / LINKEDIN_CLIENT_ID /
#   LINKEDIN_CLIENT_SECRET in backend/.env, then replace the body of this
#   endpoint with a real OAuth code exchange (or use a library like Authlib).
# ───────────────────────────────────────────────────────────────────────────

OAuthProvider = Literal["google", "linkedin"]

DEMO_EMAIL_DOMAINS = {
    "google":   "google-demo.diversihire-oauth.example.com",
    "linkedin": "linkedin-demo.diversihire-oauth.example.com",
}

DEMO_DISPLAY_NAMES = {
    "google":   "Google Demo User",
    "linkedin": "LinkedIn Demo User",
}


class OAuthDevRequest(BaseModel):
    provider: OAuthProvider
    demo_id: Optional[str] = Field(default=None, max_length=64)
    full_name: Optional[str] = Field(default=None, max_length=120)


def _oauth_dev_enabled() -> bool:
    """Disable the dev endpoint once real OAuth credentials are configured."""
    if os.environ.get("ENABLE_OAUTH_DEV", "true").strip().lower() in {"0", "false", "no", "off"}:
        return False
    if os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("LINKEDIN_CLIENT_ID"):
        return False
    return True


@router.post("/oauth-dev")
async def oauth_dev_signin(
    payload: OAuthDevRequest,
    db_client: Client = Depends(db.get_db),
):
    """Dev-only social-login simulator. Creates or signs in a stable demo account
    so the Google / LinkedIn buttons in AuthModal work end-to-end without real
    OAuth credentials. Returns the same shape as /auth/login."""
    if not _oauth_dev_enabled():
        raise HTTPException(
            status_code=404,
            detail="OAuth dev endpoint is disabled because real OAuth credentials are configured.",
        )

    provider = payload.provider
    demo_id = (payload.demo_id or "").strip() or secrets.token_hex(6)
    email_local = f"user-{demo_id}"
    email = f"{email_local}@{DEMO_EMAIL_DOMAINS[provider]}"
    full_name = payload.full_name or DEMO_DISPLAY_NAMES[provider]
    # Deterministic password so existing demo accounts can sign back in.
    demo_password = f"oauth-dev-{provider}-{demo_id}-{secrets.token_hex(8)}"
    stable_password = f"oauth-dev-{provider}-{demo_id}"

    auth_service = AuthService(db_client)

    # Try to sign in first (existing demo account).
    try:
        login = auth_service.login(UserLogin(email=email, password=stable_password))
        if login and getattr(login, "user", None):
            return {
                "status": "success",
                "message": f"Signed in via {provider}",
                "token_type": "bearer",
                "access_token": getattr(getattr(login, "session", None), "access_token", None),
                "refresh_token": getattr(getattr(login, "session", None), "refresh_token", None),
                "user": login.user,
                "provider": provider,
            }
    except Exception:
        pass  # No existing account — fall through to register

    # Register fresh demo account.
    try:
        reg = auth_service.register(UserRegister(
            email=email,
            password=stable_password,
            full_name=full_name,
            role="user",
        ))
        return {
            "status": "success",
            "message": f"Signed up via {provider}",
            "token_type": "bearer",
            "access_token": getattr(getattr(reg, "session", None), "access_token", None),
            "refresh_token": getattr(getattr(reg, "session", None), "refresh_token", None),
            "user": reg.user,
            "provider": provider,
            "demo_id": demo_id,  # echo back so frontend can persist it
        }
    except Exception as exc:
        # Final fallback: try the login again in case of race / partial register
        try:
            login = auth_service.login(UserLogin(email=email, password=stable_password))
            return {
                "status": "success",
                "message": f"Signed in via {provider}",
                "token_type": "bearer",
                "access_token": getattr(getattr(login, "session", None), "access_token", None),
                "refresh_token": getattr(getattr(login, "session", None), "refresh_token", None),
                "user": login.user,
                "provider": provider,
            }
        except Exception:
            raise HTTPException(status_code=500, detail=f"{provider} dev-signin failed: {exc}") from exc


# ───────────────────────────────────────────────────────────────────────────
# Real OAuth — authorization-code flow
# ───────────────────────────────────────────────────────────────────────────

def _frontend_callback_url(token: str, refresh: str, return_to: str) -> str:
    base = os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
    # Send tokens in the URL fragment so they don't appear in server logs / referer.
    safe_return = return_to or "/user/dashboard"
    return f"{base}/auth/callback?return_to={safe_return}#access_token={token}&refresh_token={refresh}"


@router.get("/oauth/{provider}/start")
async def oauth_start(
    provider: Literal["google", "linkedin"],
    return_to: str = Query(default="/user/dashboard"),
):
    """Begin the real OAuth flow. If the provider's CLIENT_ID + CLIENT_SECRET
    aren't configured yet, fall back to the dev-OAuth simulator so the flow
    still works locally."""
    if not OAuthService.is_configured(provider):
        # Dev fallback: do the same thing /auth/oauth-dev does, but as a redirect.
        # We sign in (or sign up) a per-provider demo account and bounce back to
        # the frontend with tokens in the URL fragment.
        demo_id_seed = secrets.token_hex(6)
        stable_password = f"oauth-dev-{provider}-{demo_id_seed}"
        email = f"user-{demo_id_seed}@{DEMO_EMAIL_DOMAINS[provider]}"
        full_name = DEMO_DISPLAY_NAMES[provider]
        auth_service = AuthService(db.get_db())
        try:
            reg = auth_service.register(UserRegister(
                email=email, password=stable_password, full_name=full_name, role="user",
            ))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"OAuth dev fallback failed: {exc}") from exc
        access = getattr(getattr(reg, "session", None), "access_token", "") or ""
        refresh = getattr(getattr(reg, "session", None), "refresh_token", "") or ""
        return RedirectResponse(_frontend_callback_url(access, refresh, return_to), status_code=302)

    # Real OAuth: redirect the user's browser to Google/LinkedIn's auth page.
    auth_url = OAuthService.build_authorization_url(provider, return_to=return_to)
    return RedirectResponse(auth_url, status_code=302)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: Literal["google", "linkedin"],
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db_client: Client = Depends(db.get_db),
):
    """Provider redirects the user here after they approve. We exchange the
    code, fetch their profile, create-or-sign-in our local user, then bounce
    them to the frontend with our own JWT in the URL fragment."""
    if error:
        frontend = os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
        return RedirectResponse(
            f"{frontend}/auth/callback?oauth_error={error}&oauth_message={error_description or ''}",
            status_code=302,
        )
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state from OAuth callback")

    rec = OAuthService.consume_state(state)
    if not rec or rec.get("provider") != provider.lower():
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")
    return_to = rec.get("return_to") or "/user/dashboard"

    try:
        info = OAuthService.exchange_code_for_userinfo(provider, code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OAuth exchange failed: {exc}") from exc

    email = info["email"].strip().lower()
    # Per-(provider,email) deterministic password so a returning user signs back into
    # the same account without us storing the OAuth token.
    derived_password = f"oauth:{provider}:{info.get('sub') or email}:{os.environ.get('LOCAL_JWT_SECRET','salt')}"

    auth_service = AuthService(db_client)
    try:
        login = auth_service.login(UserLogin(email=email, password=derived_password))
    except Exception:
        login = None

    if not login or not getattr(login, "session", None):
        try:
            reg = auth_service.register(UserRegister(
                email=email,
                password=derived_password,
                full_name=info.get("name") or email.split("@")[0],
                role="user",
            ))
            login = reg
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"OAuth sign-up failed: {exc}") from exc

    access = getattr(getattr(login, "session", None), "access_token", "") or ""
    refresh = getattr(getattr(login, "session", None), "refresh_token", "") or ""
    if not access:
        raise HTTPException(status_code=500, detail="OAuth sign-in did not produce a token")
    return RedirectResponse(_frontend_callback_url(access, refresh, return_to), status_code=302)


@router.get("/oauth/{provider}/status")
async def oauth_status(provider: Literal["google", "linkedin"]):
    """Whether real OAuth is configured for this provider. Frontend uses this
    to (optionally) decide whether to show a 'dev mode' badge."""
    return {
        "provider": provider,
        "real_oauth_enabled": OAuthService.is_configured(provider),
        "redirect_uri": OAuthService.redirect_uri(provider),
    }

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh_token(data: RefreshRequest, db_client: Client = Depends(db.get_db)):
    try:
        res = db_client.auth.refresh_session(data.refresh_token)
        if not res or not res.session:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "token_type": "bearer",
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
