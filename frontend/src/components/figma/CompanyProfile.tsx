"use client";
import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, User, Trash2, Save, AlertTriangle } from 'lucide-react';

interface CompanyProfileProps {
  onBack: () => void;
}

export function CompanyProfile({ onBack }: CompanyProfileProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profile, setProfile] = useState({
    companyName: 'Tech Innovations Inc.',
    email: 'hr@techinnovations.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'www.techinnovations.com',
    industry: 'Technology',
    companySize: '50-200 employees',
    description: 'We are a leading technology company focused on innovative solutions.',
    contactPerson: 'John Smith',
    contactTitle: 'HR Manager'
  });

  const handleSave = () => {
    alert('Profile updated successfully!');
  };

  const handleDeleteRequest = () => {
    alert('Account deletion request submitted. We will contact you within 24 hours to confirm.');
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#088395] hover:text-teal-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Company Profile</h1>
            <p className="text-white/90">Manage your company information and settings</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
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
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
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
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Industry</label>
                  <input
                    type="text"
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Company Size</label>
                  <select
                    value={profile.companySize}
                    onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  >
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>50-200 employees</option>
                    <option>200-500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Contact Person</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.contactPerson}
                      onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Contact Title</label>
                <input
                  type="text"
                  value={profile.contactTitle}
                  onChange={(e) => setProfile({ ...profile, contactTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Company Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-8 py-4 border-b border-red-200">
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Once you delete your account, there is no going back. All your job postings and data will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
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

            <p className="text-foreground/70 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your job postings and company data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
