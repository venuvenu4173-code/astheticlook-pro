import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDemoAuth: boolean;
  demoLogin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const DEMO_STORAGE_KEY = 'aesthetic_look_admin_session';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('aesthetic_look_admin_email') || null;
  });
  const [isDemoAuth, setIsDemoAuth] = useState<boolean>(() => {
    return localStorage.getItem('aesthetic_look_is_demo') === 'true';
  });

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'admin@aestheticlook.pro');
          setIsDemoAuth(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'admin@aestheticlook.pro');
          setIsDemoAuth(false);
          localStorage.setItem(DEMO_STORAGE_KEY, 'true');
          localStorage.setItem('aesthetic_look_admin_email', session.user.email || '');
        } else if (!isDemoAuth) {
          setIsAuthenticated(false);
          setUserEmail(null);
          localStorage.removeItem(DEMO_STORAGE_KEY);
          localStorage.removeItem('aesthetic_look_admin_email');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isDemoAuth]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setIsAuthenticated(true);
      setUserEmail(data.user.email || email);
      setIsDemoAuth(false);
      localStorage.setItem(DEMO_STORAGE_KEY, 'true');
      localStorage.setItem('aesthetic_look_admin_email', data.user.email || email);
      return { success: true };
    }

    // If Supabase not yet configured, allow admin credentials fallback
    if (email.trim().length > 0 && password.trim().length >= 4) {
      demoLogin();
      return { success: true };
    }

    return { success: false, error: 'Please enter valid credentials (min 4 characters).' };
  };

  const demoLogin = () => {
    setIsAuthenticated(true);
    setUserEmail('admin@aestheticlook.pro');
    setIsDemoAuth(true);
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    localStorage.setItem('aesthetic_look_admin_email', 'admin@aestheticlook.pro');
    localStorage.setItem('aesthetic_look_is_demo', 'true');
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    setIsDemoAuth(false);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem('aesthetic_look_admin_email');
    localStorage.removeItem('aesthetic_look_is_demo');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        login,
        logout,
        isDemoAuth,
        demoLogin,
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
