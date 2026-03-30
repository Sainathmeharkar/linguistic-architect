// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, saveSettings } from '../utils/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else { setProfile(null); setSettings(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(u) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    setProfile(prof);
    const { data: sett } = await supabase.from('user_settings').select('*').eq('id', u.id).single();
    setSettings(sett);
    setLoading(false);
  }

  async function updateSettings(newSettings) {
    if (!user) return;
    setSettings(prev => ({ ...prev, ...newSettings }));
    await saveSettings(user.id, newSettings);
  }

  return (
    <AuthContext.Provider value={{ user, profile, settings, loading, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
