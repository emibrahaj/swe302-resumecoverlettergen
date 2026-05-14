"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CreditCard, Crown, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/src/lib/api";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { useModals } from "@/src/context/ModalContext";
import { useSubscription } from "@/src/context/SubscriptionContext";

interface PlanInfo {
  id: string;
  display: string;
  amount: number;
  currency: string;
  period: string;
}

const PLAN_FALLBACK: Record<string, PlanInfo> = {
  weekly:  { id: "weekly",  display: "Weekly",   amount: 4.99,  currency: "EUR", period: "/week" },
  monthly: { id: "monthly", display: "Monthly",  amount: 11.99, currency: "EUR", period: "/month" },
  "6month": { id: "6month", display: "6 Months", amount: 49.99, currency: "EUR", period: "/6 months" },
};

// ─── Card helpers ────────────────────────────────────────────────────────

type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "jcb" | "diners" | "unionpay" | "unknown";

function detectBrand(number: string): CardBrand {
  const d = number.replace(/\s+/g, "");
  if (!d) return "unknown";
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^(6011|65|64[4-9]|622)/.test(d)) return "discover";
  if (/^35(2[89]|[3-8])/.test(d)) return "jcb";
  if (/^3(0[0-5]|[689])/.test(d)) return "diners";
  if (/^62/.test(d)) return "unionpay";
  return "unknown";
}

const BRAND_NAME: Record<CardBrand, string> = {
  visa:       "Visa",
  mastercard: "Mastercard",
  amex:       "American Express",
  discover:   "Discover",
  jcb:        "JCB",
  diners:     "Diners Club",
  unionpay:   "UnionPay",
  unknown:    "",
};

function BrandLogo({ brand }: { brand: CardBrand }) {
  if (brand === "visa") return <span className="font-extrabold tracking-wider text-[#1A1F71]">VISA</span>;
  if (brand === "mastercard") return (
    <span className="flex items-center -space-x-2">
      <span className="w-5 h-5 rounded-full bg-[#EB001B]" />
      <span className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 mix-blend-multiply" />
    </span>
  );
  if (brand === "amex") return <span className="font-extrabold tracking-wider text-[#2E77BC]">AMEX</span>;
  if (brand === "discover") return <span className="font-extrabold tracking-wider text-[#FF6000]">DISCOVER</span>;
  if (brand === "jcb") return <span className="font-extrabold tracking-wider text-[#0E4C96]">JCB</span>;
  if (brand === "diners") return <span className="font-extrabold tracking-wider text-[#0079BE]">DINERS</span>;
  if (brand === "unionpay") return <span className="font-extrabold tracking-wider text-[#005BAC]">UnionPay</span>;
  return <CreditCard size={18} className="text-gray-400" />;
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function PayPalLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size * 4} height={size} viewBox="0 0 124 33" aria-hidden>
      <path fill="#003087" d="M46.211 6.749h-6.84a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.984-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
      <path fill="#009cde" d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"/>
      <path fill="#003087" d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927.741A.316.316 0 0 1 5.04.543a.323.323 0 0 1 .206-.075h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z"/>
      <path fill="#009cde" d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z"/>
      <path fill="#012169" d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z"/>
      <path fill="#003087" d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z"/>
    </svg>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const search = useSearchParams();
  const subId = search?.get("sub") || "";
  const planId = (search?.get("plan") || "weekly") as keyof typeof PLAN_FALLBACK;
  const { openLogin } = useModals();
  const {
    refresh: refreshSubscription,
    setOptimisticPro,
    isPro,
    planId: activePlanId,
    status: subStatus,
    loading: subLoading,
  } = useSubscription();
  const alreadySubscribed = isPro && subStatus === "active" && activePlanId === planId;

  const [plan, setPlan] = useState<PlanInfo>(PLAN_FALLBACK[planId] || PLAN_FALLBACK.weekly);
  const [tab, setTab] = useState<"card" | "paypal">("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(true);

  // Card form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardZip, setCardZip] = useState("");

  // PayPal form
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const paypalValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail) && paypalPassword.length >= 4;

  const brand = useMemo(() => detectBrand(cardNumber), [cardNumber]);
  const cardDigits = cardNumber.replace(/\s+/g, "");
  const expiryDigits = cardExpiry.replace(/\D/g, "");
  const cardValid =
    cardDigits.length >= 13 &&
    cardDigits.length <= 19 &&
    /^[a-zA-Z][a-zA-Z\s.'-]{1,}$/.test(cardName.trim()) &&
    expiryDigits.length === 4 &&
    cardCvv.length >= 3;

  useEffect(() => {
    api.get<{ plans: PlanInfo[]; dev_mode: boolean }>("/payments/plans", { auth: false })
      .then((r) => {
        setDevMode(!!r.dev_mode);
        const match = r.plans.find((p) => p.id === planId);
        if (match) setPlan(match);
      })
      .catch(() => {});
  }, [planId]);

  const requireAuth = (): boolean => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("access_token")) {
      toast.info("Please sign in to complete payment");
      openLogin();
      return false;
    }
    return true;
  };

  const completePayment = async (method: "card" | "paypal") => {
    if (!requireAuth()) return;
    if (!subId) {
      setError("Missing subscription id. Click 'Get Started' from the Pricing page.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      await api.post(`/payments/confirm-subscription/${subId}`);
      setOptimisticPro(true);
      await refreshSubscription();
      setDone(true);
      toast.success(method === "paypal" ? "Paid via PayPal ✨" : "Paid by card ✨");
      setTimeout(() => router.push("/user/dashboard"), 1500);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Payment failed";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  // Already a Pro subscriber on this plan? Show the success state instead of the form
  // so users who hit /checkout via back-button or stale link don't get prompted to pay twice.
  if (!subLoading && alreadySubscribed && !done) {
    return (
      <>
        <AuthAwareNav currentPage="pricing" />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-50 to-white min-h-screen">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-4">
                <Crown size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">You&apos;re already Pro</h1>
              <p className="text-foreground/70 mb-6">
                You&apos;re already on the <strong>{plan.display}</strong> plan. No need to pay again — head to your dashboard to keep working.
              </p>
              <button
                onClick={() => router.push("/user/dashboard")}
                className="w-full py-3 bg-[#088395] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all"
              >
                Go to dashboard
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="mt-3 text-sm text-foreground/60 hover:text-foreground"
              >
                ← Back to pricing
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AuthAwareNav currentPage="pricing" />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete your subscription</h1>
            <p className="text-foreground/70">You&apos;re one click away from going Pro.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-foreground/60 mb-1">Plan</p>
                <h2 className="text-2xl font-bold">{plan.display}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wider text-foreground/60 mb-1">Total today</p>
                <p className="text-3xl font-bold text-[#088395]">
                  €{plan.amount.toFixed(2)}
                  <span className="text-base font-normal text-foreground/70">{plan.period}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-2 mb-6 text-sm text-foreground/80">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#088395]" /> Unlimited AI-polished resumes</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#088395]" /> 8-dimension Resume Strength score</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#088395]" /> Job matching + market insights</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#088395]" /> Cover letter generator</div>
            </div>

            {devMode && (
              <div className="mb-6 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-900 flex items-start gap-2">
                <Lock size={14} className="flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Dev mode:</strong> the card / PayPal forms below collect details but no real charge happens — payment processor keys aren&apos;t configured yet. Filling in any valid-looking values and submitting will activate your Pro tier locally.
                </p>
              </div>
            )}

            {/* Payment method tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setTab("card")}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                  tab === "card" ? "bg-[#088395] text-white font-semibold" : "bg-white text-foreground/70 hover:bg-gray-50"
                }`}
              >
                <CreditCard size={16} />
                Card
              </button>
              <button
                type="button"
                onClick={() => setTab("paypal")}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors border-l border-gray-200 ${
                  tab === "paypal" ? "bg-[#088395] text-white font-semibold" : "bg-white text-foreground/70 hover:bg-gray-50"
                }`}
              >
                <PayPalLogo size={14} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}

            {done ? (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle2 size={48} className="text-[#088395] mb-2" />
                <p className="text-lg font-semibold">Payment confirmed</p>
                <p className="text-sm text-foreground/70 mt-1">Redirecting you to your dashboard…</p>
              </div>
            ) : tab === "card" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!cardValid) {
                    setError("Please fill in all card fields correctly.");
                    return;
                  }
                  completePayment("card");
                }}
                className="space-y-4"
              >
                {/* Card number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Card number</label>
                    {brand !== "unknown" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <BrandLogo brand={brand} />
                        <span>{BRAND_NAME[brand]}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={23}
                      className={`w-full h-12 px-4 pr-20 rounded-lg border-2 transition-colors focus:outline-none font-mono tracking-wider text-gray-800 ${
                        brand !== "unknown" ? "border-[#088395]" : "border-gray-200 focus:border-[#088395]"
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <BrandLogo brand={brand} />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">We accept Visa, Mastercard, American Express, Discover, JCB, Diners Club and UnionPay.</p>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder name</label>
                  <input
                    type="text"
                    autoComplete="cc-name"
                    placeholder="Name as it appears on your card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#088395] focus:outline-none"
                    required
                  />
                </div>

                {/* Expiry + CVV + ZIP */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#088395] focus:outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#088395] focus:outline-none font-mono tracking-widest"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value.slice(0, 12))}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#088395] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || !cardValid}
                  className={`w-full mt-2 flex items-center justify-center gap-2 py-3 bg-[#088395] text-white rounded-lg font-semibold transition-all hover:shadow-xl ${
                    processing || !cardValid ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      Pay €{plan.amount.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!paypalValid) {
                    setError("Enter your PayPal email and password to continue.");
                    return;
                  }
                  completePayment("paypal");
                }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center pb-2 border-b border-gray-100 mb-2">
                  <PayPalLogo size={22} />
                </div>

                <p className="text-sm text-foreground/70 text-center -mt-2 mb-2">
                  Log in to PayPal to pay <strong className="text-foreground">€{plan.amount.toFixed(2)}</strong>{plan.period}.
                </p>

                {/* Email or phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email or mobile number</label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#003087] focus:outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PayPal password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-[#003087] focus:outline-none font-mono tracking-widest"
                    required
                  />
                </div>

                <div className="text-right">
                  <a
                    href="https://www.paypal.com/authflow/password-recovery/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs text-[#0070BA] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={processing || !paypalValid}
                  className={`w-full flex items-center justify-center gap-2 py-3 bg-[#FFC439] text-[#003087] rounded-lg font-bold hover:shadow-xl transition-all ${
                    processing || !paypalValid ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {processing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <PayPalLogo size={14} />
                  )}
                  {processing ? "Logging in…" : `Pay €${plan.amount.toFixed(2)} with PayPal`}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or</span></div>
                </div>

                <a
                  href="https://www.paypal.com/signup"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block w-full text-center py-3 border-2 border-[#0070BA] text-[#0070BA] rounded-lg font-semibold hover:bg-[#0070BA]/5 transition-colors"
                >
                  Create a PayPal Account
                </a>
              </form>
            )}

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-foreground/50">
              <ShieldCheck size={14} />
              Cancel anytime from your dashboard. No hidden fees.
            </p>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/pricing")}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              ← Back to pricing
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-foreground/60">Loading checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
