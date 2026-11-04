import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, KeyRound, HelpCircle } from 'lucide-react';
import { useAdminAuth, AUTHORIZED_OWNER_EMAIL } from './AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState(AUTHORIZED_OWNER_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, sendPasswordReset, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);

      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      // Forgot Password flow
      const res = await sendPasswordReset(email);
      setLoading(false);

      if (res.success) {
        setForgotSuccess(true);
      } else {
        setErrorMsg(res.error || 'Failed to send password recovery email.');
      }
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
          {mode === 'login' ? 'Owner Admin Portal' : 'Reset Admin Password'}
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#8C7E74] font-medium">
          Aesthetic Look Platform Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#E8E2D7] rounded-2xl sm:px-10 space-y-6">
          {/* Owner verification notice */}
          <div className="p-3.5 rounded-xl border text-xs flex items-start gap-2.5 bg-[#FAF8F5] border-[#E8E2D7] text-[#5A5047]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#B87A44]" />
            <div>
              <p className="font-semibold text-[#1A1816]">
                Verified Owner Access Only
              </p>
              <p className="text-[11px] mt-0.5 text-[#7A6E65] leading-tight">
                This portal is strictly authorized for <strong className="text-[#1A1816] font-mono">{AUTHORIZED_OWNER_EMAIL}</strong>. Public registration is disabled.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {forgotSuccess ? (
            <div className="p-5 bg-[#F0F7F2] border border-[#CDE5D4] rounded-2xl text-xs text-[#2E7D44] space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#2E7D44]" />
              <p className="font-bold text-sm text-[#1A1816]">Recovery Email Sent</p>
              <p className="text-[#5A5047] leading-relaxed">
                A secure password reset link has been dispatched to <strong>{email}</strong> via Supabase Auth. Click the link in your email to choose a new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSuccess(false);
                  setPassword('');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1816] text-white rounded-xl text-xs font-semibold hover:bg-[#2C2622] transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                  Owner Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={AUTHORIZED_OWNER_EMAIL}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] text-[#B87A44] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Supabase password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md cursor-pointer"
              >
                <span>
                  {loading
                    ? mode === 'login'
                      ? 'Authenticating...'
                      : 'Sending Email...'
                    : mode === 'login'
                    ? 'Sign In To Dashboard'
                    : 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="w-full text-center text-xs text-[#8C7E74] hover:underline pt-2 block"
                >
                  Cancel and return to sign in
                </button>
              )}
            </form>
          )}

          {/* Setup guidance for owner */}
          <div className="pt-4 border-t border-[#F0EAE1] space-y-2 text-[11px] text-[#8C7E74]">
            <p className="flex items-center gap-1.5 font-semibold text-[#5A5047]">
              <HelpCircle className="w-3.5 h-3.5 text-[#B87A44]" />
              <span>Owner Account Setup:</span>
            </p>
            <p className="leading-tight">
              Create the user <strong className="text-[#1A1816] font-mono">ashokboya4173@gmail.com</strong> in your <strong>Supabase Dashboard &gt; Authentication &gt; Users &gt; Add User</strong> with your secure password.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#8C7E74]">
          <Link to="/" className="hover:underline">
            &larr; Return to public storefront
          </Link>
        </p>
      </div>
    </div>
  );
};
