import { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp, signOut, getSession, getProfile, updateProfile as updateProfileAPI } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@shop.com';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSession(s);
      if (s.user.email !== ADMIN_EMAIL) {
        getProfile(s.user.id).then((p) => { if (p) setProfile(p); });
      }
    }
  }, []);

  const login = async (password) => {
    const data = await signIn({ email: ADMIN_EMAIL, password });
    const s = getSession();
    if (s) setSession(s);
    return data;
  };

  const customerLogin = async (email, password) => {
    const data = await signIn({ email, password });
    const s = getSession();
    if (s) {
      setSession(s);
      if (s.user.email !== ADMIN_EMAIL) {
        const p = await getProfile(s.user.id);
        if (p) setProfile(p);
      }
    }
    return data;
  };

  const customerRegister = async (email, password, fullName) => {
    const data = await signUp({ email, password, full_name: fullName });
    const s = getSession();
    if (s) {
      setSession(s);
      if (s.user.email !== ADMIN_EMAIL) {
        const p = await getProfile(s.user.id);
        if (p) setProfile(p);
      }
    }
    return data;
  };

  const logout = () => {
    signOut();
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!session) return;
    await updateProfileAPI(session.user.id, updates);
    setProfile((p) => ({ ...p, ...updates }));
  };

  const refreshProfile = () => {
    if (session && session.user.email !== ADMIN_EMAIL) {
      getProfile(session.user.id).then((p) => { if (p) setProfile(p); });
    }
  };

  const isAdmin = !!(session && session.user?.email === ADMIN_EMAIL);
  const isCustomer = !!(session && session.user?.email !== ADMIN_EMAIL);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading: false,
        isAdmin,
        isCustomer,
        login,
        customerLogin,
        customerRegister,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
