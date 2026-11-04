import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AUTHORIZED_OWNER_EMAIL } from './AdminAuthContext';

export const AdminResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecoverySession = async () => {
      setVerifyingSession(true);
      if (!isSupabaseConfigured || !supabase) {
        setErrorMsg('Supabase is not configured. Please check your project credentials.');
        setVerifyingSession(false);
        return;
      }

      // Supabase automatically parses #access_token in URL hash on redirect
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setHasValidSession(false);
        setErrorMsg('Recovery link expired or invalid. Please request a new password reset email.');
      } else {
        const email = session.user?.email?.toLowerCase();
        if (email !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
          setHasValidSession(false);
          setErrorMsg(`Unauthorized: This recovery link is not for the verified owner (${AUTHORIZED_OWNER_EMAIL}).`);
          await supabase.auth.signOut();
        } else {
          setHasValidSession(true);
        }
      }
      setVerifyingSession(false);
    };

    checkRecoverySession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!supabase) {
      setErrorMsg('Supabase client unavailable.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img
            src="/assets/aistudio/image_37848e19.png"
            alt="Aesthetic Look Logo"
            className="w-12 h-12 rounded-full object-cover border border-[#D8D2C6] mx-auto shadow-sm"
          />
        </Link>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1A1816]">
          Set New Password
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#8C7E74] font-medium">
          Owner Security Portal · {AUTHORIZED_OWNER_EMAIL}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#E8E2D7] rounded-2xl sm:px-10 space-y-6">
          {verifyingSession ? (
            <div className="text-center py-6 text-xs text-[#7A6E65]">
              Verifying secure recovery token...
            </div>
          ) : success ? (
            <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#2E7D44]" />
              <p className="font-bold text-sm">Password Updated Successfully!</p>
              <p>Redirecting to your Admin Dashboard...</p>
            </div>
          ) : !hasValidSession ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Invalid or Expired Link</p>
                  <p className="mt-0.5">{errorMsg || 'Please request a new reset link.'}</p>
                </div>
              </div>
              <Link
                to="/admin/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs font-semibold rounded-xl"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Save & Sign In'}</span>
                </button>
              </form>
            </>
          )}

          <div className="pt-2 border-t border-[#F0EAE1] text-center">
            <Link to="/admin/login" className="text-xs text-[#8C7E74] hover:underline">
              &larr; Back to Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
