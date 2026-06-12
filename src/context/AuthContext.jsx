import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@shop.com';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && session.user.email !== ADMIN_EMAIL) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && session.user.email !== ADMIN_EMAIL) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data || null);
  };

  // Admin login — uses hardcoded email
  const login = async (password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (error) throw error;
    return data;
  };

  // Customer login
  const customerLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Customer register
  const customerRegister = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName });
      setProfile({ id: data.user.id, full_name: fullName, phone: null, preferred_car: null });
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!session) return;
    await supabase.from('profiles').upsert({ id: session.user.id, ...updates });
    setProfile((p) => ({ ...p, ...updates }));
  };

  const refreshProfile = () => {
    if (session && session.user.email !== ADMIN_EMAIL) fetchProfile(session.user.id);
  };

  // Derive role booleans
  const isAdmin    = !!(session && session.user.email === ADMIN_EMAIL);
  const isCustomer = !!(session && session.user.email !== ADMIN_EMAIL);

  return (
    <AuthContext.Provider value={{
      session, profile, loading,
      isAdmin, isCustomer,
      login, customerLogin, customerRegister, logout, updateProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
