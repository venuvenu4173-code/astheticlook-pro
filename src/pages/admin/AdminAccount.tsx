import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  ShieldCheck,
  Send,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAdminAuth, AUTHORIZED_OWNER_EMAIL } from './AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const AdminAccount: React.FC = () => {
  const { userEmail, changePassword, sendPasswordReset, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);

  // Email Reset state
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match. Please re-enter.');
      return;
    }

    setChangeLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setChangeLoading(false);

    if (result.success) {
      setChangeSuccess('Password updated successfully in Supabase Auth!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setChangeSuccess(null), 6000);
    } else {
      setChangeError(result.error || 'Failed to change password.');
    }
  };

  const handleSendRecoveryEmail = async () => {
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    const res = await sendPasswordReset(AUTHORIZED_OWNER_EMAIL);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(`Password recovery email dispatched to ${AUTHORIZED_OWNER_EMAIL}.`);
      setTimeout(() => setResetSuccess(null), 6000);
    } else {
      setResetError(res.error || 'Unable to send recovery email.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Security & Credentials
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Owner Account & Authentication
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Manage owner admin credentials, update passwords, and review database access permissions.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D8D2C6] text-[#8E3B29] rounded-xl text-xs font-semibold hover:bg-[#FAF0ED] transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Console</span>
        </button>
      </div>

      {/* Owner Profile Overview Card */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1816] text-[#FAF8F5] flex items-center justify-center font-serif text-xl font-bold">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                  Store Owner Administrator
                </h3>
                <span className="px-2 py-0.5 bg-[#F2F8F4] text-[#245D33] border border-[#CDE5D4] rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Verified Owner
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#5A5047] font-mono">
                <Mail className="w-3.5 h-3.5 text-[#A69B91]" />
                <span className="font-semibold text-[#1A1816]">{AUTHORIZED_OWNER_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#F0EAE1] text-xs">
          <div>
            <span className="text-[#8C7E74] block uppercase tracking-wider text-[10px] font-semibold">
              Authorized Role
            </span>
            <span className="font-semibold text-[#1A1816] mt-0.5 block">
              Super Admin / Owner
            </span>
          </div>

          <div>
            <span className="text-[#8C7E74] block uppercase tracking-wider text-[10px] font-semibold">
              Auth Provider
            </span>
            <span className="font-semibold text-[#1A1816] mt-0.5 block">
              {isSupabaseConfigured ? 'Supabase Authentication' : 'Local Auth Guard'}
            </span>
          </div>

          <div>
            <span className="text-[#8C7E74] block uppercase tracking-wider text-[10px] font-semibold">
              Database RLS Scope
            </span>
            <span className="font-semibold text-[#245D33] mt-0.5 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Full Write & Manage
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Form (Requires current authenticated session) */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#B87A44]" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                Change Admin Password
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5">
                Requires your active session and current password verification before updating.
              </p>
            </div>
          </div>
        </div>

        {changeError && (
          <div className="p-3.5 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{changeError}</span>
          </div>
        )}

        {changeSuccess && (
          <div className="p-3.5 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{changeSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                New Password (min 8 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={changeLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {changeLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{changeLoading ? 'Verifying & Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Supabase Email Password Recovery Card */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#5A5047]" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                Email Password Recovery
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5">
                Dispatch an official Supabase Auth recovery link directly to your inbox.
              </p>
            </div>
          </div>
        </div>

        {resetError && (
          <div className="p-3.5 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{resetError}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3.5 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{resetSuccess}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#5A5047] leading-relaxed">
            <span>Send a secure magic recovery link to: </span>
            <strong className="font-mono text-[#1A1816]">{AUTHORIZED_OWNER_EMAIL}</strong>
          </div>

          <button
            type="button"
            onClick={handleSendRecoveryEmail}
            disabled={resetLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#D8D2C6] text-[#1A1816] text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5 text-[#B87A44]" />
            <span>{resetLoading ? 'Dispatching Email...' : 'Send Recovery Link'}</span>
          </button>
        </div>
      </div>

      {/* Security Policies Audit Card */}
      <div className="bg-[#FAF8F5] border border-[#E8E2D7] rounded-2xl p-6 text-xs text-[#5A5047] space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#1A1816]">
          <Shield className="w-4 h-4 text-[#B87A44]" />
          <span>Security & Row Level Security (RLS) Enforcement</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed text-[#5A5047]">
          <li>
            <strong>Owner Email Bound:</strong> Only requests from <code className="bg-white px-1 border border-[#D8D2C6] rounded">{AUTHORIZED_OWNER_EMAIL}</code> have write authorization in PostgreSQL.
          </li>
          <li>
            <strong>Server-Side Protection:</strong> Public visitors cannot add, edit, or delete products, categories, or settings even if they access database endpoints directly.
          </li>
          <li>
            <strong>Zero Hardcoded Passwords:</strong> Credentials are verified dynamically against Supabase Auth. No secrets or passwords exist in source files or git history.
          </li>
          <li>
            <strong>No Public Signups:</strong> Self-registration is disabled. New accounts cannot be spawned from the client.
          </li>
        </ul>
      </div>
    </div>
  );
};
