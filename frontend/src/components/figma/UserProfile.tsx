"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  MapPin,
  Save,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/src/lib/api";
import { useAuth } from "@/src/hooks/useAuth";

interface UserProfileData {
  id?: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  tier?: string | null;
  location?: string | null;
}

interface SubscriptionInfo {
  subscription: {
    id: string;
    plan: string;
    status: string;
    price: number | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
  plan_meta: { display: string; amount: number; currency: string; period: string } | null;
  latest_payment: { amount: number; currency: string; created_at: string } | null;
}

interface UserProfileProps {
  onBack: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({});
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    let cancelled = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true);
    (async () => {
      try {
        const [data, subData] = await Promise.all([
          api.get<UserProfileData>("/user/profile"),
          api.get<SubscriptionInfo>("/payments/me/subscription").catch(() => null),
        ]);
        if (!cancelled) {
          setProfile(data);
          if (data.avatar_url) setProfilePhoto(data.avatar_url);
          setSubscription(subData);
        }
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Could not load profile";
        if (!cancelled) toast.error(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, router]);

  const field = (key: keyof UserProfileData): string =>
    (profile[key] as string | null | undefined) ?? "";

  const set =
    (key: keyof UserProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((p) => ({ ...p, [key]: e.target.value }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      setProfile((p) => ({ ...p, avatar_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<UserProfileData> = {};
      if (profile.full_name !== undefined) payload.full_name = profile.full_name;
      if (profile.location !== undefined) payload.location = profile.location;
      if (profile.avatar_url !== undefined) payload.avatar_url = profile.avatar_url;

      const updated = await api.put<UserProfileData>("/user/profile", payload);
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await api.post("/payments/cancel", {});
      setProfile((p) => ({ ...p, tier: "free" }));
      setSubscription((s) => s ? { ...s, tier: "free", subscription: s.subscription ? { ...s.subscription, status: "cancelled" } : null } : null);
      toast.success("Subscription cancelled. You'll retain Pro access until your renewal date.");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to cancel subscription";
      toast.error(msg);
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  const handleDeleteRequest = () => {
    toast.info("Account deletion request submitted. We will contact you within 24 hours.");
    setShowDeleteModal(false);
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#088395]">
          <Loader2 size={36} className="animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* back */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#088395] hover:text-teal-700 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
            <p className="text-white/80 text-sm">Manage your account information</p>
          </div>

          <div className="p-8 space-y-6">

            {/* avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-gray-200 overflow-hidden flex items-center justify-center">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={44} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-9 h-9 bg-[#088395] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors shadow-md">
                  <Camera size={16} className="text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {/* tier badge */}
              {profile.tier && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    profile.tier === "pro"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {profile.tier} plan
                </span>
              )}
            </div>

            {/* fields */}
            <div className="space-y-4">

              {/* full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={field("full_name")}
                    onChange={set("full_name")}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#088395] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* email – read-only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={field("email")}
                    readOnly
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Managed by your login provider</p>
              </div>

              {/* location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={field("location")}
                    onChange={set("location")}
                    placeholder="City, Country"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#088395] focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Used for location-based job recommendations</p>
              </div>

            </div>

            {/* save */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#088395] text-white rounded-lg text-sm font-semibold hover:bg-teal-700 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* pro plan info */}
        {profile.tier === "pro" && subscription && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-8 py-4">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-white" />
                <h2 className="text-base font-bold text-white">Pro Plan</h2>
                {subscription.plan_meta && (
                  <span className="ml-2 text-white/80 text-sm font-normal">
                    ({subscription.plan_meta.display})
                  </span>
                )}
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Price</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {subscription.latest_payment
                        ? `${subscription.latest_payment.currency} ${subscription.latest_payment.amount.toFixed(2)}${subscription.plan_meta?.period ?? ""}`
                        : subscription.plan_meta
                        ? `${subscription.plan_meta.currency} ${subscription.plan_meta.amount.toFixed(2)}${subscription.plan_meta.period}`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Paid On</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {formatDate(subscription.latest_payment?.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Renews On</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {formatDate(subscription.subscription?.end_date)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Your Pro subscription renews automatically. Cancel anytime before the renewal date.
                </p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-2 border-orange-400 text-orange-500 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors ml-6"
                >
                  <XCircle size={15} />
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* danger zone */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-8 py-4 border-b border-red-200">
            <h2 className="text-base font-bold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-8 flex items-start justify-between gap-6">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                All your resumes, cover letters, and personal data will be permanently removed. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

      </div>

      {/* cancel subscription modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle size={22} className="text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Cancel Pro Plan?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              You&apos;ll keep Pro access until{" "}
              <span className="font-semibold">{formatDate(subscription?.subscription?.end_date)}</span>. After that your
              account reverts to the free plan and unused credits are forfeited.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Keep Pro
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {cancelling ? <Loader2 size={15} className="animate-spin" /> : null}
                {cancelling ? "Cancelling…" : "Yes, Cancel Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold">Delete Account?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure? This cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}