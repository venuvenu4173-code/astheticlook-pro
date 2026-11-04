import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAdminAuth, AUTHORIZED_OWNER_EMAIL } from './AdminAuthContext';

export const AdminForgotPassword: React.FC = () => {
  const [email, setEmail] = useState(AUTHORIZED_OWNER_EMAIL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { sendPasswordReset } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    const res = await sendPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setMessage(
        `A secure password recovery email has been sent to ${email}. Check your inbox and follow the link to establish your new password.`
      );
    } else {
      setErrorMsg(res.error || 'Failed to dispatch password recovery email.');
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
          Password Recovery
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#8C7E74] font-medium">
          Aesthetic Look Owner Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#E8E2D7] rounded-2xl sm:px-10 space-y-6">
          <div className="flex items-start gap-2.5 p-3.5 bg-[#FAF8F5] border border-[#E8E2D7] rounded-xl text-xs text-[#5A5047]">
            <Shield className="w-4 h-4 text-[#B87A44] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Recovery requests are strictly authorized for the verified platform owner (<strong>{AUTHORIZED_OWNER_EMAIL}</strong>).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {message && (
            <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                  Owner Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending Recovery Link...' : 'Send Recovery Email'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <Link
                to="/admin/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622] transition-colors"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-[#F0EAE1] text-center">
            <Link
              to="/admin/login"
              className="text-xs text-[#8C7E74] hover:text-[#1A1816] inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
