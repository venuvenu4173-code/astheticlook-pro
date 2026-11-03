import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, demoLogin, isAuthenticated } = useAdminAuth();
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

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoAccess = () => {
    demoLogin();
    navigate('/admin');
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
          Admin Portal Login
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#8C7E74] font-medium">
          Aesthetic Look Platform Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#E8E2D7] rounded-2xl sm:px-10 space-y-6">
          {/* Supabase backend status banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              isSupabaseConfigured
                ? 'bg-[#F2F8F4] border-[#CDE5D4] text-[#245D33]'
                : 'bg-[#FFF9EE] border-[#F2DEB5] text-[#875817]'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D44]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B87A44]" />
            )}
            <div>
              <p className="font-semibold">
                {isSupabaseConfigured ? 'Supabase Auth Ready' : 'Supabase Credentials Pending'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                {isSupabaseConfigured
                  ? 'Sign in using your configured Supabase admin user credentials.'
                  : 'Add VITE_SUPABASE_URL in .env for production. Use Instant Demo Admin access below to inspect all features now.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Default Credentials Helper */}
          <div className="p-3 bg-[#FBF9F5] border border-[#E8E2D7] rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#7A6E65] font-semibold uppercase tracking-wider text-[10px]">
              <span>Default Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@aestheticlook.pro');
                  setPassword('admin123');
                }}
                className="text-[#B87A44] hover:underline font-bold cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="text-[#3A3530] font-mono text-[11px] space-y-0.5">
              <div>Email: <span className="font-semibold text-[#1A1816]">admin@aestheticlook.pro</span></div>
              <div>Password: <span className="font-semibold text-[#1A1816]">admin123</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aestheticlook.pro"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Option */}
          <div className="pt-2 border-t border-[#F0EAE1]">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#D8D2C6] text-[#1A1816] text-xs font-semibold rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#B87A44]" />
              <span>Instant Admin Demo Access</span>
            </button>
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
