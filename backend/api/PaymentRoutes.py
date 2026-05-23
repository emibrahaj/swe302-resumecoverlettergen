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
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db

router = APIRouter(prefix="/payments", tags=["payments"])

PLAN_CATALOG = {
    "weekly": {"display": "Weekly", "amount": 3.99, "currency": "EUR", "period": "/week"},
    "monthly": {"display": "Monthly", "amount": 11.99, "currency": "EUR", "period": "/month"},
    "6month": {"display": "6 Months", "amount": 49.99, "currency": "EUR", "period": "/6 months"},
}

# Used to compute the subscription end_date so the frontend can render a live countdown.
_PLAN_DURATIONS = {
    "weekly": timedelta(days=7),
    "monthly": timedelta(days=30),
    "6month": timedelta(days=180),
}


class CreateSubscriptionRequest(BaseModel):
    plan_id: Literal["weekly", "monthly", "6month"]


def _is_dev_mode() -> bool:
    """Dev mode = no real PayPal credentials configured."""
    return not bool(os.environ.get("PAYPAL_CLIENT_ID") and os.environ.get("PAYPAL_CLIENT_SECRET"))


def _frontend_base() -> str:
    return os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")


def _end_date_for(plan_id: str) -> str:
    delta = _PLAN_DURATIONS.get(plan_id, _PLAN_DURATIONS["monthly"])
    return (datetime.now(timezone.utc) + delta).isoformat()


@router.get("/plans")
async def list_plans():
    """Public catalog of available plans for frontend display."""
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
    PayPal mode future: hits PayPal /v1/billing/subscriptions and returns the
    real approval URL.
    """
    user_id = get_user_id(current_user)
    plan = PLAN_CATALOG.get(body.plan_id)

    if not plan:
        raise HTTPException(status_code=400, detail=f"Unknown plan_id: {body.plan_id}")

    # subscriptions.user_id is UNIQUE. Check what the user already has.
    existing = db_client.table("subscriptions").select("*").eq("user_id", user_id).limit(1).execute()
    existing_row = existing.data[0] if existing.data else None

    # If already actively subscribed to this same plan, do not overwrite it.
    if existing_row and existing_row.get("status") == "active" and existing_row.get("plan") == body.plan_id:
        approve_url = f"{_frontend_base()}/checkout?sub={existing_row['id']}&plan={body.plan_id}"
        return {
            "subscription_id": existing_row["id"],
            "approve_url": approve_url,
            "dev_mode": _is_dev_mode(),
            "plan": {"id": body.plan_id, **plan},
            "already_active": True,
        }

    # Otherwise create a new pending subscription, or convert an inactive one
    # into a fresh pending subscription.
    sub_id = existing_row["id"] if existing_row else str(uuid.uuid4())

    if existing_row:
        db_client.table("subscriptions").update({
            "plan": body.plan_id,
            "status": "pending",
            "price": plan["amount"],
        }).eq("id", sub_id).execute()
    else:
        db_client.table("subscriptions").insert({
            "id": sub_id,
            "user_id": user_id,
            "plan": body.plan_id,
            "status": "pending",
            "price": plan["amount"],
        }).execute()

    approve_url = f"{_frontend_base()}/checkout?sub={sub_id}&plan={body.plan_id}"

    return {
        "subscription_id": sub_id,
        "approve_url": approve_url,
        "dev_mode": _is_dev_mode(),
        "plan": {"id": body.plan_id, **plan},
        "already_active": False,
    }


@router.post("/confirm-subscription/{sub_id}")
async def confirm_subscription(
    sub_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Mark a pending subscription as active and flip the user's tier to pro.

    In dev mode this trusts the caller. In real PayPal mode, this would first
    re-fetch the subscription status from PayPal to verify approval.
    """
    user_id = get_user_id(current_user)

    sub = db_client.table("subscriptions").select("*").eq("id", sub_id).single().execute()

    if not sub.data:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not your subscription")

    plan_id = sub.data.get("plan") or "monthly"
    plan = PLAN_CATALOG.get(plan_id, PLAN_CATALOG["monthly"])

    now = datetime.now(timezone.utc).isoformat()
    end_date = _end_date_for(plan_id)

    db_client.table("subscriptions").update({
        "status": "active",
        "start_date": now,
        "end_date": end_date,
    }).eq("id", sub_id).execute()

    db_client.table("user_profiles").update({"tier": "pro"}).eq("id", user_id).execute()

    payment_id = str(uuid.uuid4())

    payment_row = {
        "id": payment_id,
        "subscription_id": sub_id,
        "user_id": user_id,
        "amount": plan["amount"],
        "currency": plan["currency"],
        "provider": "dev-checkout" if _is_dev_mode() else "paypal",
        "status": "completed",
    }

    # Some older Supabase instances may not have the provider column yet.
    # Try with provider first, then retry without it if PostgREST rejects it.
    try:
        db_client.table("payments").insert(payment_row).execute()
    except Exception as ex:
        if "provider" in str(ex).lower():
            payment_row.pop("provider", None)
            db_client.table("payments").insert(payment_row).execute()
        else:
            raise

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
    """Current subscription, tier, plan metadata, and latest payment.

    If an active subscription's end_date has passed, auto-downgrade the user to
    free and mark the subscription as expired before returning.
    """
    user_id = get_user_id(current_user)

    profile_res = db_client.table("user_profiles").select("tier").eq("id", user_id).limit(1).execute()
    tier = (profile_res.data[0].get("tier") if profile_res.data else None) or "free"

    sub_res = (
        db_client.table("subscriptions")
        .select("id, user_id, plan, status, price, start_date, end_date")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    sub_row = sub_res.data[0] if sub_res.data else None

    if sub_row and sub_row.get("status") == "active" and sub_row.get("end_date"):
        try:
            end_dt = datetime.fromisoformat(str(sub_row["end_date"]).replace("Z", "+00:00"))

            if end_dt <= datetime.now(timezone.utc):
                db_client.table("subscriptions").update({
                    "status": "expired",
                }).eq("id", sub_row["id"]).execute()

                db_client.table("user_profiles").update({
                    "tier": "free",
                }).eq("id", user_id).execute()

                sub_row["status"] = "expired"
                tier = "free"

        except (ValueError, TypeError):
            pass

    pay_res = (
        db_client.table("payments")
        .select("amount, currency, created_at")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    latest_payment = pay_res.data[0] if pay_res.data else None

    plan_meta = PLAN_CATALOG.get(sub_row["plan"]) if sub_row else None

    return {
        "tier": tier,
        "subscription": sub_row,
        "plan": plan_meta,
        "plan_meta": plan_meta,
        "latest_payment": latest_payment,
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)

    db_client.table("subscriptions").update({
        "status": "cancelled",
    }).eq("user_id", user_id).execute()

    db_client.table("user_profiles").update({
        "tier": "free",
    }).eq("id", user_id).execute()

    return {"status": "cancelled", "tier": "free"}