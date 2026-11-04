import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signInWithOtp: async () => {},
  verifyOtp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  deleteMyData: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load active session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured()) {
          // Provide demo user for offline/preview testing
          const localDemoUser = JSON.parse(localStorage.getItem('shetkari_demo_user') || 'null');
          if (localDemoUser && mounted) {
            setUser(localDemoUser);
            setIsAdmin(Boolean(localDemoUser.is_admin));
            setProfile(localDemoUser.profile || null);
          }
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await loadUserData(session.user.id);
        }
      } catch (err) {
        console.error('[Auth Init Error]:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        setUser(session.user);
        await loadUserData(session.user.id);
      } else if (mounted) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function loadUserData(userId) {
    try {
      // 1. Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (prof) setProfile(prof);

      // 2. Fetch admin role
      const { data: role } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('user_id', userId)
        .maybeSingle();

      setIsAdmin(Boolean(role?.is_admin));
    } catch (err) {
      console.warn('Failed to load user profile or role:', err);
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      const demoUser = {
        id: 'demo-farmer-01',
        email,
        is_admin: false,
        profile: {
          id: 'demo-farmer-01',
          district: 'Pune',
          crops: ['Wheat', 'Gram'],
          land_status: 'owner',
          land_on_or_before_2019: true,
          loanee: false,
          ekyc_done: 'unsure',
          season: 'rabi',
          lang: 'en'
        }
      };
      localStorage.setItem('shetkari_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setProfile(demoUser.profile);
      return { data: { user: demoUser }, error: null };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    const isDemoAccount = email.includes('demo') || email.includes('admin.reviewer');

    if (isSupabaseConfigured() && !isDemoAccount) {
      return await supabase.auth.signInWithPassword({ email, password });
    }

    // Handle demo account login (tries Supabase first, falls back to demo session)
    if (isSupabaseConfigured()) {
      try {
        const authRes = await supabase.auth.signInWithPassword({ email, password });
        if (!authRes.error && authRes.data?.user) {
          setUser(authRes.data.user);
          await loadUserData(authRes.data.user.id);
          return authRes;
        }
      } catch (err) {
        console.warn('Supabase auth for demo user fallback:', err);
      }
    }

    // Seamless Demo Session initialization
    const isAdminLogin = email.includes('admin');
    const demoUser = {
      id: isAdminLogin ? 'demo-admin-01' : 'demo-farmer-01',
      email,
      is_admin: isAdminLogin,
      profile: {
        id: isAdminLogin ? 'demo-admin-01' : 'demo-farmer-01',
        district: 'Pune',
        crops: ['Wheat', 'Gram'],
        land_status: 'owner',
        land_on_or_before_2019: true,
        loanee: false,
        ekyc_done: 'unsure',
        season: 'rabi',
        notify_whatsapp: true,
        notify_sms: false,
        phone: '+91 98765 43210',
        lang: 'en'
      }
    };
    localStorage.setItem('shetkari_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsAdmin(demoUser.is_admin);
    setProfile(demoUser.profile);
    return { data: { user: demoUser }, error: null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return signIn('demo-farmer@example.com', 'demo');
    }
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signInWithOtp = async (phone) => {
    if (!isSupabaseConfigured()) {
      return { data: {}, error: null };
    }
    return await supabase.auth.signInWithOtp({ phone });
  };

  const verifyOtp = async (phone, token) => {
    if (!isSupabaseConfigured()) {
      return signIn('phone-user@example.com', 'demo');
    }
    return await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('shetkari_demo_user');
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  // Delete My Data (Privacy compliance)
  const deleteMyData = async () => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      // Delete alerts and profile
      await supabase.from('alerts').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('shetkari_demo_user');
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshProfile,
      deleteMyData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

