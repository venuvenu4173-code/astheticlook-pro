import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Globe, Instagram, Mail, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WebsiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState<WebsiteSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

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
            className="flex items-center gap-2 px-8 py-3 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
