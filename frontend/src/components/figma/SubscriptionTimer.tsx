"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { useSubscription } from "@/src/context/SubscriptionContext";

interface Remaining {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function diff(endIso: string): Remaining {
  const end = Date.parse(endIso);
  const now = Date.now();
  const ms = Math.max(0, end - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  return { expired: ms <= 0, days, hours, minutes, seconds, totalMs: ms };
}

function formatShort(r: Remaining): string {
  if (r.expired) return "Expired";
  if (r.days >= 1) return `${r.days}d ${r.hours}h left`;
  if (r.hours >= 1) return `${r.hours}h ${r.minutes}m left`;
  if (r.minutes >= 1) return `${r.minutes}m ${r.seconds}s left`;
  return `${r.seconds}s left`;
}

/**
 * Live countdown badge for the user's Pro subscription. Renders nothing when the
 * user is not Pro or when no end_date is available (legacy active subs created
 * before end_date persistence was added). Re-ticks every second when under an
 * hour remains; otherwise once per minute to keep render churn low.
 */
export function SubscriptionTimer({ compact = false }: { compact?: boolean }) {
  const { isPro, endDate, refresh } = useSubscription();
  const [, setTick] = useState(0);

  const remaining = useMemo<Remaining | null>(() => {
    if (!isPro || !endDate) return null;
    return diff(endDate);
  }, [isPro, endDate]);

  useEffect(() => {
    if (!isPro || !endDate) return;
    const ms = diff(endDate).totalMs;
    if (ms <= 0) {
      // Already expired — ask the context to refresh so the server can downgrade
      // tier and the UI flips back to free.
      refresh();
      return;
    }
    const intervalMs = ms < 3_600_000 ? 1_000 : 60_000;
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [isPro, endDate, refresh]);

  if (!remaining) return null;
  if (remaining.expired) {
    // Trigger a refresh so the badge flips off — render a temporary "Expired"
    // hint until the context catches up.
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200"
        title="Your Pro subscription has ended"
      >
        <Clock size={12} /> Expired
      </span>
    );
  }

  const urgent = remaining.totalMs < 86_400_000; // last 24h
  const tone = urgent
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-cyan-50 text-cyan-800 border-cyan-200";

  const label = formatShort(remaining);
  const tooltipDate = new Date(endDate!).toLocaleString();

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${tone}`}
        title={`Pro ends ${tooltipDate}`}
      >
        <Clock size={10} /> {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${tone} whitespace-nowrap`}
      title={`Pro subscription ends ${tooltipDate}`}
    >
      <Clock size={12} /> {label}
    </span>
  );
}
