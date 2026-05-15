"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2, Mail, Globe, User, Trash2, Save,
  AlertTriangle, Camera, Loader2, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { api, apiFetch, ApiError } from "@/src/lib/api";
import { clearAuthTokens } from "@/src/hooks/useAuth";

interface CompanyProfileProps {
  onBack: () => void;
}

interface ProfileData {
  company_name: string;
  company_website: string;
  logo_url: string;
  email: string;
  description: string;
  company_address: string;
}

const EMPTY_PROFILE: ProfileData = {
  company_name: "",
  company_website: "",
  logo_url: "",
  email: "",
  description: "",
  company_address: "",
};

export function CompanyProfile({ onBack }: CompanyProfileProps) {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  // Local editable copy — only committed to state on save
  const [draft, setDraft] = useState<ProfileData>(EMPTY_PROFILE);

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load profile on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ProfileData>("/company/profile");
        setProfile(data);
        setDraft(data);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to load profile";
        toast.error(msg);
      } finally {
        setIsFetching(false);
      }
    })();
  }, []);

  // ── Logo upload ────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await apiFetch<{ url: string }>("/upload/company-logo", {
        method: "POST",
        body: formData,
      });

      setDraft((d) => ({ ...d, logo_url: result.url }));
      toast.success("Logo uploaded — click Save to apply.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Logo upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Save profile ───────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Only send the fields the backend PATCH accepts
      const payload: Partial<ProfileData> = {
        company_name: draft.company_name,
        company_website: draft.company_website,
        logo_url: draft.logo_url,
        email: draft.email,
        description: draft.description,
      };

      await api.patch("/company/profile", payload);
      setProfile(draft);
      toast.success("Profile saved successfully!");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save profile";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/company/deactivate-account");
      toast.success("Account deleted.");
      clearAuthTokens();
      // Small delay so the toast is visible before redirect
      setTimeout(() => (window.location.href = "/"), 1200);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete account";
      toast.error(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#088395]" size={36} />
      </div>
    );
  }

  const logoSrc = draft.logo_url || null;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(profile);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#088395] hover:text-teal-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Company Profile</h1>
            <p className="text-white/90">Manage your company information and settings</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
                  {logoSrc ? (
                    <img src={logoSrc} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-gray-400" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <Loader2 size={28} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#088395] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors">
                  <Camera size={20} className="text-white" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Company Name</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={draft.company_name}
                    onChange={(e) => setDraft({ ...draft, company_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Website</label>
                <div className="relative">
                  <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={draft.company_website}
                    onChange={(e) => setDraft({ ...draft, company_website: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={draft.company_address}
                    onChange={(e) => setDraft({ ...draft, company_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Company Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
              />
            </div>

            {/* Save */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-8 py-4 border-b border-red-200">
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-8 flex items-start justify-between gap-6">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. All your job postings and data will be permanently removed.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Delete Account?</h2>
            </div>
            <p className="text-foreground/70 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your job postings and company data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isDeleting ? "Deleting…" : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
