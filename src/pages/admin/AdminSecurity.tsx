import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Key, RefreshCw, UserCheck } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { AUTHORIZED_OWNER_EMAIL } from '../../lib/constants';

export const AdminSecurity: React.FC = () => {
  const { userEmail, updatePassword } = useAdminAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Your owner password has been successfully updated in Supabase Auth.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(res.error || 'Failed to update password. Ensure your session is active.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-[#E8E2D7]">
        <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
          Account Governance
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
          Owner Security & Password
        </h1>
        <p className="text-xs text-[#7A6E65] mt-1">
          Manage your verified owner credentials, session security, and database authorization.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1816] text-white flex items-center justify-center font-serif text-base font-bold">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#1A1816]">Verified Owner Account</h3>
                <span className="px-2 py-0.5 bg-[#F0F7F2] text-[#2E7D44] border border-[#CDE5D4] rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Owner
                </span>
              </div>
              <p className="text-xs font-mono text-[#5A5047] mt-0.5">
                {AUTHORIZED_OWNER_EMAIL}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#2E7D44] font-semibold bg-[#F0F7F2] px-3 py-1.5 rounded-xl border border-[#CDE5D4]">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Session Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[#8C7E74] block mb-0.5">Access Role</span>
            <span className="font-semibold text-[#1A1816]">Sole Platform Administrator</span>
          </div>
          <div>
            <span className="text-[#8C7E74] block mb-0.5">Public Registration</span>
            <span className="font-semibold text-[#8E3B29]">Disabled (Zero Public Sign-ups)</span>
          </div>
          <div>
            <span className="text-[#8C7E74] block mb-0.5">Database Enforcement</span>
            <span className="font-semibold text-[#2E7D44]">PostgreSQL RLS Protected</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#B87A44]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1816]">
              Change Owner Password
            </h3>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Updating Password...' : 'Update Password in Supabase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
