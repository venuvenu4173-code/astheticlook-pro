import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Globe, Instagram, Mail, ShieldCheck, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAdminAuth, AUTHORIZED_OWNER_EMAIL } from './AdminAuthContext';
import { WebsiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { userEmail, changePassword, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState<WebsiteSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (field: keyof WebsiteSettings, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!isAuthenticated) {
      setPasswordError('Authenticated session required. Please sign in again.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-[#E8E2D7]">
        <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
          Platform Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
          Website Settings
        </h1>
        <p className="text-xs text-[#7A6E65] mt-1">
          Control editorial copy, announcement banners, Instagram profile links, and legal disclosures.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Website settings saved successfully across database and storefront!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Lockup Section */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                required
                value={form.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm font-semibold text-[#1A1816] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                required
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Brand Logo Asset Path
              </label>
              <input
                type="text"
                required
                value={form.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Instagram & Social */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            Social Media Integrations
          </h3>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
              Instagram Profile URL
            </label>
            <div className="relative">
              <Instagram className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={form.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8C7E74] mt-1">
              Active profile: <strong>@asthetic_look.pro</strong> (linked in header, hero, and footer)
            </p>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h3 className="font-serif text-lg font-bold text-[#1A1816]">
              Storefront Announcement Bar
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.announcementEnabled}
                onChange={(e) => handleChange('announcementEnabled', e.target.checked)}
                className="w-4 h-4 rounded text-[#1A1816] border-[#D8D2C6] focus:ring-0"
              />
              <span className="text-xs font-semibold text-[#1A1816]">Enable Bar</span>
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
              Banner Message
            </label>
            <input
              type="text"
              value={form.announcementText}
              onChange={(e) => handleChange('announcementText', e.target.value)}
              placeholder="e.g. Curated Autumn/Winter Luxury Edit · Complimentary Styling Guide Available"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer & Affiliate Disclosure */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            Legal Transparency & Footer Description
          </h3>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
              Footer Editorial Description
            </label>
            <textarea
              rows={3}
              value={form.footerDescription}
              onChange={(e) => handleChange('footerDescription', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
              Affiliate Transparency Disclosure Text (FTC / Legal Notice)
            </label>
            <textarea
              rows={4}
              value={form.affiliateDisclosure}
              onChange={(e) => handleChange('affiliateDisclosure', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Owner Account Security & Change Password */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0EAE1] gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1A1816] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#B87A44]" />
              <span>Owner Account & Security</span>
            </h3>
            <p className="text-xs text-[#7A6E65] mt-0.5">
              Manage your Supabase Auth credentials and password for the verified owner administrator.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-[#D8D2C6] rounded-full text-[11px] font-semibold text-[#1A1816]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D44]" />
            <span>Session Authenticated</span>
          </div>
        </div>

        {/* Current Owner Details */}
        <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D7] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C7E74] block">
              Authorized Owner Email
            </span>
            <span className="font-mono text-sm font-bold text-[#1A1816]">
              {AUTHORIZED_OWNER_EMAIL}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C7E74] block">
              Access Role
            </span>
            <span className="font-semibold text-[#B87A44]">
              Website Owner Administrator
            </span>
          </div>
        </div>

        {/* Feedback notices */}
        {passwordSuccess && (
          <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password updated successfully in Supabase Auth! Your new password is now active.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                New Password (Min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-[#8C7E74]">
              Requires current authenticated session. Updates user credentials directly in Supabase.
            </p>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
