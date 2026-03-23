import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  const fetchProfile = async (userObj) => {
    try {
      if (!userObj?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userObj.id)
        .single();

      let effectiveProfile = (!error && data) ? { ...data } : null;

      if (userObj.email === 'tatinihar@gmail.com') {
        effectiveProfile = effectiveProfile || { id: userObj.id, email: userObj.email, credits: 99999 };
        effectiveProfile.is_admin = true;
      }

      if (effectiveProfile) {
        setProfile(effectiveProfile);
        console.log('Current User Admin Role:', effectiveProfile.is_admin);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Force Timeout: Fail-safe override that strips loading after 3 seconds exactly
    const failSafeTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession error:", error);
          setInitError(error.message);
        }

        setCurrentUser(session?.user ?? null);
        if (session?.user?.id) {
          await fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Critical Auth Initialization Error:", err);
        setInitError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setCurrentUser(session?.user ?? null);
        if (session?.user?.id) {
          await fetchProfile(session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(failSafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    profile,
    loading,

    updateCredits: async (newCreditAmount) => {
      if (!currentUser?.id) return false;

      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCreditAmount })
        .eq('id', currentUser.id);

      if (!error) {
        setProfile(prev => ({ ...prev, credits: newCreditAmount }));
        return true;
      }
      return false;
    },

    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    register: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    verifyOtp: async (email, token) => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      return data;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-[#050505] font-mono crt-flicker flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="scanlines"></div>
        <div style={{ color: '#00ff41', padding: '20px' }}>
          <h1 className="text-xl md:text-2xl text-red-500 font-bold mb-4">SYSTEM_ERROR</h1>
          <p className="border border-red-500 bg-red-500/10 p-4">{initError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] font-mono crt-flicker flex items-center justify-center text-xl md:text-3xl tracking-[0.2em] relative overflow-hidden">
        <div className="scanlines"></div>
        <div style={{ color: '#00ff41', padding: '20px' }} className="animate-pulse font-bold">
          [ INITIALIZING_SYSTEM... ]
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
