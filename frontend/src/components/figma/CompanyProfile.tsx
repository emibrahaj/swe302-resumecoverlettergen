
"use client";

import { useEffect, useState } from "react";
import { Building2, Mail, MapPin, Globe, Trash2, Save, AlertTriangle, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/src/lib/api";
import { clearAuthTokens } from "@/src/hooks/useAuth";
//TODO crud works except for updating address, fix later
interface CompanyProfileData {
  id: string;
  company_id?: string | null;
  company_name: string;
  company_website?: string | null;
  logo_url?: string | null;
  email: string;
  description?: string | null;
  company_address?: string | null;
}

interface CompanyProfileProps {
  onBack: () => void;
}

const emptyProfile: CompanyProfileData = {
  id: "",
  company_name: "",
  email: "",
  company_website: "",
  logo_url: "",
  company_address: "",
  description: "",
};

function cleanProfile(data: CompanyProfileData): CompanyProfileData {
  return {
    id: data.id ?? "",
    company_id: data.company_id ?? null,
    company_name: data.company_name ?? "",
    email: data.email ?? "",
    company_website: data.company_website ?? "",
    logo_url: data.logo_url ?? "",
    company_address: data.company_address ?? "",
    description: data.description ?? "",
  };
}

export function CompanyProfile({ onBack }: CompanyProfileProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profile, setProfile] = useState<CompanyProfileData>(emptyProfile);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.get<CompanyProfileData>("/company/profile");
        setProfile(cleanProfile(data));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load company profile");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile.company_name.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!profile.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.patch<CompanyProfileData>("/company/profile", {
        company_name: profile.company_name.trim(),
        email: profile.email.trim(),
        company_website: profile.company_website?.trim() || null,
        logo_url: profile.logo_url?.trim() || null,
        company_address: profile.company_address?.trim() || null,
        description: profile.description?.trim() || null,
      });
      setProfile(cleanProfile(updated));
      toast.success("Company profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update company profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/company/profile");
      clearAuthTokens();
      toast.success("Company account deleted");
      window.location.href = "/company/login";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button onClick={onBack} className="text-[#088395] hover:text-teal-700 transition-colors">
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Company logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={32} />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Company Profile</h1>
                <p className="text-white/90">Manage company data saved in Supabase.</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Company Name" icon={<Building2 size={18} />} value={profile.company_name} onChange={(v) => setProfile({ ...profile, company_name: v })} />
              <Field label="Email" icon={<Mail size={18} />} type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
              <Field label="Website" icon={<Globe size={18} />} type="url" value={profile.company_website ?? ""} onChange={(v) => setProfile({ ...profile, company_website: v })} />
              <Field label="Address / Location" icon={<MapPin size={18} />} value={profile.company_address ?? ""} onChange={(v) => setProfile({ ...profile, company_address: v })} />
            </div>

            <Field label="Logo URL" icon={<ImageIcon size={18} />} value={profile.logo_url ?? ""} onChange={(v) => setProfile({ ...profile, logo_url: v })} />

            <div>
              <label className="block text-sm font-semibold mb-2">Company Description</label>
              <textarea
                value={profile.description ?? ""}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                placeholder="Describe the company, mission, hiring focus, or culture."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all disabled:opacity-60">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-8 py-4 border-b border-red-200">
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-8 flex items-start justify-between gap-6">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-600">Deletes company profile, job postings, invitations, and related match records.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Delete Account?</h2>
            </div>
            <p className="text-foreground/70 mb-6">This cannot be undone. Your company profile and postings will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", icon }: { label: string; value: string; onChange: (value: string) => void; type?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${icon ? "pl-10" : "pl-4"} w-full pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent`}
        />
      </div>
    </div>
  );
}
