"""
Contact form endpoint.

Every submission is:
  1. Persisted to the `contact_messages` table (always — so nothing is lost)
  2. Logged to the backend console with full body
  3. Optionally relayed via SMTP to CONTACT_RECIPIENT if SMTP env vars are set:
        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
     For Gmail/Yahoo use an app password (not the account password) and port 587 STARTTLS.

The endpoint is public — no auth required — so logged-out visitors can contact
support. Light rate-limiting / spam mitigation would be a follow-up (a CAPTCHA
or per-IP cooldown).
"""
from __future__ import annotations

import os
import smtplib
import uuid
from email.message import EmailMessage
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from supabase import Client

from backend.database.db import db

router = APIRouter(prefix="/contact", tags=["contact"])

DEFAULT_RECIPIENT = "endrilika18@yahoo.com"


class ContactMessage(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: Optional[str] = Field(default="", max_length=200)
    message: str = Field(min_length=2, max_length=5000)


def _try_send_email(payload: ContactMessage, recipient: str) -> tuple[bool, Optional[str]]:
    host = os.environ.get("SMTP_HOST")
    port_raw = os.environ.get("SMTP_PORT", "587")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    from_addr = os.environ.get("SMTP_FROM") or user
    if not (host and user and password and from_addr):
        return False, "SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM in backend/.env)"

    try:
        port = int(port_raw)
    except (TypeError, ValueError):
        port = 587

    msg = EmailMessage()
    msg["Subject"] = f"[DiversiHire contact] {payload.subject or 'New message'}"
    msg["From"] = from_addr
    msg["To"] = recipient
    msg["Reply-To"] = payload.email
    msg.set_content(
        f"From: {payload.name} <{payload.email}>\n"
        f"Subject: {payload.subject or '(no subject)'}\n\n"
        f"{payload.message}\n"
    )

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(msg)
        return True, None
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"


@router.post("/send")
async def send_contact_message(payload: ContactMessage):
    recipient = os.environ.get("CONTACT_RECIPIENT") or DEFAULT_RECIPIENT
    delivered, error = _try_send_email(payload, recipient)

    print(
        "\n[Contact form]\n"
        f"  to:      {recipient}\n"
        f"  from:    {payload.name} <{payload.email}>\n"
        f"  subject: {payload.subject or '(no subject)'}\n"
        f"  message: {payload.message[:500]}{'…' if len(payload.message) > 500 else ''}\n"
        f"  delivered: {delivered}{f' (error: {error})' if error else ''}\n"
    )

    db_client: Client = db.get_db()
    record = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "subject": payload.subject or "",
        "body": payload.message,
        "recipient": recipient,
        "delivery_status": "sent" if delivered else "pending",
        "delivery_error": error if not delivered else None,
    }
    try:
        db_client.table("contact_messages").insert(record).execute()
    except Exception as exc:
        # We don't want to lose the message if the DB hiccups — surface the error
        # to the caller but it's already in the console log above.
        raise HTTPException(status_code=500, detail=f"Could not save message: {exc}")

    return {
        "status": "received",
        "delivered_via_email": delivered,
        "recipient": recipient,
        "message": (
            "Your message has been received."
            if delivered
            else "Your message has been received. Live email delivery is not yet configured on this server — the team will see it in the message log."
        ),
    }


@router.get("/messages")
async def list_messages():
    """Public-ish listing of saved messages. Intentionally lightweight — used during
    development to verify submissions. In production, gate behind an admin role."""
    db_client: Client = db.get_db()
    res = (
        db_client.table("contact_messages")
        .select("*")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return {"messages": res.data or []}
