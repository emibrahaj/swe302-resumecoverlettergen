"""
Local replacement for supabase-py's `client.auth`.

Issues JWTs signed with a local HS256 secret. Stores user records in `auth_users`
with bcrypt-hashed passwords. Mirrors the surface of supabase-py:

    auth.sign_up({"email", "password", "options": {"data": {...}}})
        -> AuthResponse with .user and .session
    auth.sign_in_with_password({"email", "password"})
        -> AuthResponse with .user and .session
    auth.get_user(token)
        -> UserResponse with .user
    auth.sign_out()
    auth.reset_password_for_email(email, options=...)  # local: log to console
    auth.update_user({"password": ...})
    auth.admin.delete_user(user_id)

The shapes returned support both attribute access (`res.user.id`) and dict
serialization (FastAPI's jsonable_encoder handles dataclasses).
"""
from __future__ import annotations

import json
import os
import secrets
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional

import bcrypt
import jwt as pyjwt

try:
    from supabase_auth.errors import AuthApiError as _AuthApiError
except ImportError:  # pragma: no cover - supabase-py is in the venv, so this fallback should not trigger
    class _AuthApiError(Exception):
        def __init__(self, message: str, status: int = 400, code: str = "unknown"):
            super().__init__(message)
            self.status = status
            self.code = code

from .local_engine import PROJECT_ROOT, get_conn, write_lock


# ---------- Config ----------

JWT_ALGO = "HS256"
ACCESS_TTL_SEC = 60 * 60          # 1h
REFRESH_TTL_SEC = 60 * 60 * 24 * 30  # 30d


def _jwt_secret() -> str:
    """Return the HS256 secret. Auto-generate on first use and persist."""
    cached = os.environ.get("LOCAL_JWT_SECRET")
    if cached:
        return cached
    secret_path = PROJECT_ROOT / "data" / ".jwt_secret"
    secret_path.parent.mkdir(parents=True, exist_ok=True)
    if secret_path.exists():
        return secret_path.read_text(encoding="utf-8").strip()
    new = secrets.token_urlsafe(48)
    secret_path.write_text(new, encoding="utf-8")
    return new


def _now() -> int:
    return int(time.time())


# ---------- Response shapes ----------

@dataclass
class AuthUser:
    id: str
    email: str
    user_metadata: dict[str, Any] = field(default_factory=dict)
    aud: str = "authenticated"
    role: str = "authenticated"
    email_confirmed_at: Optional[str] = None
    created_at: Optional[str] = None

    def model_dump(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Session:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TTL_SEC
    expires_at: int = 0
    user: Optional[AuthUser] = None

    def model_dump(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class AuthResponse:
    user: Optional[AuthUser] = None
    session: Optional[Session] = None


@dataclass
class UserResponse:
    user: Optional[AuthUser] = None


# ---------- Errors ----------

class LocalAuthError(_AuthApiError):
    """Raised on auth failures. Inherits from AuthApiError so auth_handler.py's
    `except AuthApiError` clause catches it correctly."""

    def __init__(self, message: str, status: int = 400, code: str = "local_auth_error"):
        try:
            super().__init__(message, status, code)
        except TypeError:
            # Older supabase-auth signatures: AuthApiError(message)
            super().__init__(message)
        self.status = status
        self.code = code


# ---------- Token helpers ----------

def _issue_tokens(user_id: str, email: str) -> Session:
    secret = _jwt_secret()
    iat = _now()
    access_payload = {
        "sub": user_id,
        "email": email,
        "iat": iat,
        "exp": iat + ACCESS_TTL_SEC,
        "type": "access",
    }
    refresh_payload = {
        "sub": user_id,
        "email": email,
        "iat": iat,
        "exp": iat + REFRESH_TTL_SEC,
        "type": "refresh",
    }
    access = pyjwt.encode(access_payload, secret, algorithm=JWT_ALGO)
    refresh = pyjwt.encode(refresh_payload, secret, algorithm=JWT_ALGO)
    return Session(
        access_token=access,
        refresh_token=refresh,
        expires_in=ACCESS_TTL_SEC,
        expires_at=iat + ACCESS_TTL_SEC,
    )


def _decode_token(token: str) -> dict[str, Any]:
    return pyjwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGO])


def _row_to_auth_user(row: dict[str, Any]) -> AuthUser:
    meta = row.get("raw_user_meta_data")
    if isinstance(meta, str):
        try:
            meta = json.loads(meta)
        except (ValueError, TypeError):
            meta = {}
    elif not isinstance(meta, dict):
        meta = {}
    return AuthUser(
        id=row["id"],
        email=row["email"],
        user_metadata=meta,
        email_confirmed_at=row.get("email_confirmed_at"),
        created_at=row.get("created_at"),
    )


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ---------- Auth surface ----------

class _AdminAuth:
    def delete_user(self, user_id: str) -> None:
        with write_lock():
            get_conn().execute("DELETE FROM auth_users WHERE id = ?", (user_id,))


class LocalAuth:
    """Drop-in replacement for `supabase.Client.auth`."""

    def __init__(self) -> None:
        self.admin = _AdminAuth()
        self._current_user_id: Optional[str] = None  # tracked best-effort

    # ----- sign up -----
    def sign_up(self, credentials: dict[str, Any]) -> AuthResponse:
        email = (credentials.get("email") or "").strip().lower()
        password = credentials.get("password")
        if not email or not password:
            raise LocalAuthError("Email and password are required.")
        options = credentials.get("options") or {}
        user_metadata = options.get("data") or {}

        with write_lock():
            conn = get_conn()
            existing = conn.execute(
                "SELECT id FROM auth_users WHERE email = ?", (email,)
            ).fetchone()
            if existing:
                raise LocalAuthError("An account with this email already exists.")

            user_id = str(uuid.uuid4())
            now_iso = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
            conn.execute(
                """
                INSERT INTO auth_users
                    (id, email, password_hash, raw_user_meta_data, email_confirmed_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    email,
                    _hash_password(password),
                    json.dumps(user_metadata or {}),
                    now_iso,
                    now_iso,
                ),
            )

        self._current_user_id = user_id
        user = AuthUser(
            id=user_id,
            email=email,
            user_metadata=user_metadata,
            email_confirmed_at=now_iso,
            created_at=now_iso,
        )
        session = _issue_tokens(user_id, email)
        session.user = user
        return AuthResponse(user=user, session=session)

    # ----- sign in -----
    def sign_in_with_password(self, credentials: dict[str, Any]) -> AuthResponse:
        email = (credentials.get("email") or "").strip().lower()
        password = credentials.get("password")
        if not email or not password:
            raise LocalAuthError("Email and password are required.")

        row = get_conn().execute(
            "SELECT id, email, password_hash, raw_user_meta_data, email_confirmed_at, created_at "
            "FROM auth_users WHERE email = ?",
            (email,),
        ).fetchone()
        if not row:
            raise LocalAuthError("Invalid login credentials.")
        if not _verify_password(password, row["password_hash"]):
            raise LocalAuthError("Invalid login credentials.")

        user = _row_to_auth_user(dict(row))
        session = _issue_tokens(user.id, user.email)
        session.user = user
        self._current_user_id = user.id
        return AuthResponse(user=user, session=session)

    # ----- get user from token -----
    def get_user(self, token: str) -> UserResponse:
        if not token:
            raise LocalAuthError("Missing token.")
        try:
            payload = _decode_token(token)
        except pyjwt.ExpiredSignatureError as exc:
            raise LocalAuthError("Session expired", status=401, code="session_expired") from exc
        except pyjwt.InvalidTokenError as exc:
            raise LocalAuthError(f"Invalid token: {exc}", status=401, code="invalid_token") from exc

        user_id = payload.get("sub")
        if not user_id:
            raise LocalAuthError("Token missing subject.")

        row = get_conn().execute(
            "SELECT id, email, raw_user_meta_data, email_confirmed_at, created_at "
            "FROM auth_users WHERE id = ?",
            (user_id,),
        ).fetchone()
        if not row:
            raise LocalAuthError("User no longer exists.")
        return UserResponse(user=_row_to_auth_user(dict(row)))

    # ----- update password (used by /auth/reset-password) -----
    def update_user(self, attributes: dict[str, Any]) -> AuthResponse:
        if not self._current_user_id:
            raise LocalAuthError("No current user. Call sign_in first or provide a token-bound update.")
        new_password = attributes.get("password")
        new_email = attributes.get("email")
        with write_lock():
            conn = get_conn()
            if new_password:
                conn.execute(
                    "UPDATE auth_users SET password_hash = ? WHERE id = ?",
                    (_hash_password(new_password), self._current_user_id),
                )
            if new_email:
                conn.execute(
                    "UPDATE auth_users SET email = ? WHERE id = ?",
                    (new_email.strip().lower(), self._current_user_id),
                )
            row = conn.execute(
                "SELECT id, email, raw_user_meta_data, email_confirmed_at, created_at "
                "FROM auth_users WHERE id = ?",
                (self._current_user_id,),
            ).fetchone()
        return AuthResponse(user=_row_to_auth_user(dict(row)) if row else None)

    # ----- sign out (no server-side state to clear; clients drop tokens) -----
    def sign_out(self) -> dict[str, Any]:
        self._current_user_id = None
        return {"status": "ok"}

    # ----- password reset (no-op in local mode) -----
    def reset_password_for_email(self, email: str, options: dict[str, Any] | None = None) -> None:
        target = (options or {}).get("redirectTo") or (options or {}).get("redirect_to") or ""
        print(f"[LocalAuth] reset-password request for {email!r}. Redirect target: {target!r}. (No email sent in local mode.)")
