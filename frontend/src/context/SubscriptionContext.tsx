"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { api, ApiError } from "@/src/lib/api";

export type Plan = "free" | "pro";

interface SubscriptionState {
  tier: Plan;
  planId: string | null;            // 'weekly' | 'monthly' | '6month' | null
  status: string | null;            // 'active' | 'pending' | 'cancelled' | 'expired' | null
  endDate: string | null;           // ISO timestamp when Pro access ends, or null
  loading: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  isPro: boolean;
  refresh: () => Promise<void>;
  /** Optimistic local override — used immediately after a successful checkout
   *  to flip the UI to Pro without waiting for refresh(). The next refresh()
   *  will replace this with the authoritative server value. */
  setOptimisticPro: (isPro: boolean) => void;
}

const DEFAULT_STATE: SubscriptionState = {
  tier: "free",
  planId: null,
  status: null,
  endDate: null,
  loading: false,
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  ...DEFAULT_STATE,
  isPro: false,
  refresh: async () => {},
  setOptimisticPro: () => {},
});

function readFromStorage(): SubscriptionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("subscription_state");
    if (!raw) {
      // Backward-compat: older code stored a simple "plan" string.
      const legacy = window.localStorage.getItem("plan");
      if (legacy === "pro") return { ...DEFAULT_STATE, tier: "pro" };
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<SubscriptionState>;
    return {
      tier: parsed.tier === "pro" ? "pro" : "free",
      planId: parsed.planId ?? null,
      status: parsed.status ?? null,
      endDate: parsed.endDate ?? null,
      loading: false,
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: SubscriptionState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("subscription_state", JSON.stringify(state));
    // Keep the legacy "plan" key in sync for any code still reading it.
    window.localStorage.setItem("plan", state.tier);
  } catch {
    /* localStorage may be disabled — ignore */
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // First render MUST match the server (which has no localStorage) to avoid
  // Next.js hydration mismatches. We hydrate from storage in useEffect below.
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);
  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      const next = { ...DEFAULT_STATE };
      setState(next);
      saveToStorage(next);
      return;
    }
    if (inflight.current) return inflight.current;
    setState((s) => ({ ...s, loading: true }));
    const p = (async () => {
      try {
        const res = await api.get<{
          tier: "free" | "pro";
          subscription: { plan?: string; status?: string; end_date?: string | null } | null;
        }>("/payments/me/subscription");
        const next: SubscriptionState = {
          tier: res.tier === "pro" ? "pro" : "free",
          planId: res.subscription?.plan ?? null,
          status: res.subscription?.status ?? null,
          endDate: res.subscription?.end_date ?? null,
          loading: false,
        };
        setState(next);
        saveToStorage(next);
      } catch (e) {
        // 401 etc — fall back to free
        if (e instanceof ApiError && e.status === 401) {
          const next = { ...DEFAULT_STATE };
          setState(next);
          saveToStorage(next);
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = p;
    return p;
  }, []);

  const setOptimisticPro = useCallback((isPro: boolean) => {
    setState((s) => {
      const next: SubscriptionState = { ...s, tier: isPro ? "pro" : "free" };
      saveToStorage(next);
      return next;
    });
  }, []);

  // After hydration: (1) seed from localStorage if available so the badge doesn't flash,
  // (2) refresh from backend, (3) listen for cross-tab login/logout.
  useEffect(() => {
    const cached = readFromStorage();
    if (cached) setState(cached);
    refresh();
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        isPro: state.tier === "pro",
        refresh,
        setOptimisticPro,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
