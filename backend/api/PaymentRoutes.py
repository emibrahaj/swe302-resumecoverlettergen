"""
Payment routes — dev-mode subscription flow.

This is the same shape the real PayPal flow will use later (M10):
    POST /payments/create-subscription   -> returns {approve_url, sub_id}
    POST /payments/confirm-subscription/{sub_id} -> activates subscription, flips tier
    GET  /payments/me/subscription       -> current tier + plan
    POST /payments/cancel                -> cancel subscription

In dev mode (USE_LOCAL_DB=true, no PAYPAL_CLIENT_ID), confirm-subscription just
flips the tier locally. When real PayPal sandbox keys are added later, the only
change is the implementation of create-subscription and confirm-subscription —
the frontend contract stays the same.
"""
from __future__ import annotations

import os
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db

router = APIRouter(prefix="/payments", tags=["payments"])

PLAN_CATALOG = {
    "weekly":  {"display": "Weekly",   "amount": 4.99,  "currency": "EUR", "period": "/week"},
    "monthly": {"display": "Monthly",  "amount": 11.99, "currency": "EUR", "period": "/month"},
    "6month":  {"display": "6 Months", "amount": 49.99, "currency": "EUR", "period": "/6 months"},
}


class CreateSubscriptionRequest(BaseModel):
    plan_id: Literal["weekly", "monthly", "6month"]


def _is_dev_mode() -> bool:
    """Dev mode = no real PayPal credentials configured."""
    return not bool(os.environ.get("PAYPAL_CLIENT_ID") and os.environ.get("PAYPAL_CLIENT_SECRET"))


def _frontend_base() -> str:
    return os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")


@router.get("/plans")
async def list_plans():
    """Public catalog of available plans (for frontend display)."""
    return {"plans": [{"id": k, **v} for k, v in PLAN_CATALOG.items()], "dev_mode": _is_dev_mode()}


@router.post("/create-subscription")
async def create_subscription(
    body: CreateSubscriptionRequest,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Start a subscription. Returns an approval URL the frontend should navigate to.

    Dev mode: creates a pending subscription row, returns a URL pointing at our
    own /checkout?sub=<id> page where the user 'completes' payment.
    PayPal mode (future): hits PayPal /v1/billing/subscriptions and returns the
    real approval URL.
    """
    user_id = get_user_id(current_user)
    plan = PLAN_CATALOG.get(body.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail=f"Unknown plan_id: {body.plan_id}")

    sub_id = str(uuid.uuid4())
    sub_payload = {
        "id": sub_id,
        "user_id": user_id,
        "plan": body.plan_id,
        "status": "pending",
        "price": plan["amount"],
    }

    # subscriptions.user_id is UNIQUE — use upsert so re-subscribing works.
    existing = db_client.table("subscriptions").select("id").eq("user_id", user_id).limit(1).execute()
    if existing.data:
        sub_id = existing.data[0]["id"]
        sub_payload["id"] = sub_id
        db_client.table("subscriptions").update({
            "plan": body.plan_id,
            "status": "pending",
            "price": plan["amount"],
        }).eq("id", sub_id).execute()
    else:
        db_client.table("subscriptions").insert(sub_payload).execute()

    approve_url = f"{_frontend_base()}/checkout?sub={sub_id}&plan={body.plan_id}"
    return {
        "subscription_id": sub_id,
        "approve_url": approve_url,
        "dev_mode": _is_dev_mode(),
        "plan": {"id": body.plan_id, **plan},
    }


@router.post("/confirm-subscription/{sub_id}")
async def confirm_subscription(
    sub_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Mark a pending subscription as active and flip the user's tier to 'pro'.

    In dev mode this trusts the caller (the user just clicked 'Complete Payment'
    on our own checkout page). In real PayPal mode, this would first re-fetch
    the subscription status from PayPal to verify the user actually approved.
    """
    user_id = get_user_id(current_user)

    sub = db_client.table("subscriptions").select("*").eq("id", sub_id).single().execute()
    if not sub.data:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not your subscription")

    db_client.table("subscriptions").update({"status": "active"}).eq("id", sub_id).execute()
    db_client.table("user_profiles").update({"tier": "pro"}).eq("id", user_id).execute()

    payment_id = str(uuid.uuid4())
    plan = PLAN_CATALOG.get(sub.data.get("plan") or "weekly", PLAN_CATALOG["weekly"])
    db_client.table("payments").insert({
        "id": payment_id,
        "subscription_id": sub_id,
        "user_id": user_id,
        "amount": plan["amount"],
        "currency": plan["currency"],
        "provider": "dev-checkout" if _is_dev_mode() else "paypal",
        "status": "completed",
    }).execute()

    return {
        "status": "active",
        "tier": "pro",
        "subscription_id": sub_id,
        "payment_id": payment_id,
    }


@router.get("/me/subscription")
async def my_subscription(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Current subscription + tier for the authenticated user."""
    user_id = get_user_id(current_user)
    sub = db_client.table("subscriptions").select("*").eq("user_id", user_id).limit(1).execute()
    profile = db_client.table("user_profiles").select("tier").eq("id", user_id).limit(1).execute()
    tier = (profile.data[0].get("tier") if profile.data else None) or "free"

    sub_row = sub.data[0] if sub.data else None
    return {
        "tier": tier,
        "subscription": sub_row,
        "plan": PLAN_CATALOG.get(sub_row["plan"]) if sub_row else None,
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    db_client.table("subscriptions").update({"status": "cancelled"}).eq("user_id", user_id).execute()
    db_client.table("user_profiles").update({"tier": "free"}).eq("id", user_id).execute()
    return {"status": "cancelled", "tier": "free"}
