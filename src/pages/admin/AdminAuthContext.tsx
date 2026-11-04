import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AUTHORIZED_OWNER_EMAIL = 'ashokboya4173@gmail.com';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  ownerEmail: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (arg1: string, arg2?: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const STORAGE_SESSION_KEY = 'aesthetic_look_owner_session';
const STORAGE_EMAIL_KEY = 'aesthetic_look_owner_email';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_EMAIL_KEY) || null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const active = localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
      const email = localStorage.getItem(STORAGE_EMAIL_KEY);
      if (active && email?.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
        setIsAuthenticated(true);
        setUserEmail(email);
      } else if (!active) {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('aesthetic_auth_sync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aesthetic_auth_sync', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Verify current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = (session.user.email || '').toLowerCase();
          if (email === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
            setIsAuthenticated(true);
            setUserEmail(session.user.email || AUTHORIZED_OWNER_EMAIL);
            localStorage.setItem(STORAGE_SESSION_KEY, 'true');
            localStorage.setItem(STORAGE_EMAIL_KEY, session.user.email || AUTHORIZED_OWNER_EMAIL);
          } else {
            // Unauthorized account signed in - purge immediately
            supabase?.auth.signOut();
            setIsAuthenticated(false);
            setUserEmail(null);
            localStorage.removeItem(STORAGE_SESSION_KEY);
            localStorage.removeItem(STORAGE_EMAIL_KEY);
          }
        } else {
          const localOwner = (localStorage.getItem(STORAGE_EMAIL_KEY) || '').toLowerCase();
          const localActive = localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
          if (localActive && localOwner === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
            setIsAuthenticated(true);
            setUserEmail(AUTHORIZED_OWNER_EMAIL);
          } else {
            setIsAuthenticated(false);
            setUserEmail(null);
          }
        }
      });

      // 2. Listen for auth changes (login, logout, token refresh, recovery)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = (session.user.email || '').toLowerCase();
          if (email === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
            setIsAuthenticated(true);
            setUserEmail(session.user.email || AUTHORIZED_OWNER_EMAIL);
            localStorage.setItem(STORAGE_SESSION_KEY, 'true');
            localStorage.setItem(STORAGE_EMAIL_KEY, session.user.email || AUTHORIZED_OWNER_EMAIL);
          } else {
            supabase?.auth.signOut();
            setIsAuthenticated(false);
            setUserEmail(null);
            localStorage.removeItem(STORAGE_SESSION_KEY);
            localStorage.removeItem(STORAGE_EMAIL_KEY);
          }
        } else if (_event === 'SIGNED_OUT') {
          const localOwner = (localStorage.getItem(STORAGE_EMAIL_KEY) || '').toLowerCase();
          const localActive = localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
          if (!localActive || localOwner !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
            setIsAuthenticated(false);
            setUserEmail(null);
            localStorage.removeItem(STORAGE_SESSION_KEY);
            localStorage.removeItem(STORAGE_EMAIL_KEY);
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Strict Owner Authorization Check
    if (trimmedEmail !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Unauthorized: Only the verified owner (${AUTHORIZED_OWNER_EMAIL}) is permitted access.`,
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in your application environment. Please check your Supabase Project URL and Public Key.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || data.user.email?.toLowerCase() !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Unauthorized: Only the verified owner (${AUTHORIZED_OWNER_EMAIL}) is permitted access.`,
        };
      }

      setIsAuthenticated(true);
      setUserEmail(data.user.email || AUTHORIZED_OWNER_EMAIL);
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');
      localStorage.setItem(STORAGE_EMAIL_KEY, data.user.email || AUTHORIZED_OWNER_EMAIL);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_EMAIL_KEY);
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Password reset is restricted to the verified website owner (${AUTHORIZED_OWNER_EMAIL}).`,
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send recovery email.' };
    }
  };

  const changePassword = async (arg1: string, arg2?: string): Promise<{ success: boolean; error?: string }> => {
    const targetPassword = arg2 !== undefined ? arg2 : arg1;

    if (!isAuthenticated || !userEmail) {
      return {
        success: false,
        error: 'Current authenticated session is required before changing password. Please sign in.',
      };
    }

    if (targetPassword.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long.',
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase client unavailable.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: targetPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change password.' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        ownerEmail: AUTHORIZED_OWNER_EMAIL,
        login,
        logout,
        sendPasswordReset,
        changePassword,
        updatePassword: changePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
