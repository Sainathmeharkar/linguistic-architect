// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://liwqjfqpywfyfdzpsxpi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpd3FqZnFweXdmeWZkenBzeHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDIyODEsImV4cCI6MjA5MDQxODI4MX0.V1WXGIV0hMIrgnGcFkFXXi_mSgTQxm6AiN7aUI0turM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function signUp(email, password, displayName) {
  return supabase.auth.signUp({
    email, password,
    options: { data: { full_name: displayName } },
  });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signInWithGithub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export async function loadSettings(userId) {
  const { data } = await supabase.from('user_settings').select('*').eq('id', userId).single();
  return data;
}

export async function saveSettings(userId, settings) {
  return supabase.from('user_settings').upsert({ id: userId, ...settings, updated_at: new Date().toISOString() });
}

// ── Translation history ───────────────────────────────────────────────────────
export async function loadTranslationHistory(userId) {
  const { data } = await supabase.from('translation_history')
    .select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(50);
  return data || [];
}

export async function saveTranslation(userId, item) {
  return supabase.from('translation_history').insert({
    user_id: userId,
    source_text: item.source,
    translated_text: item.translated,
    source_language: item.sourceLanguage,
    target_language: item.targetLanguage,
  });
}

export async function clearTranslationHistory(userId) {
  return supabase.from('translation_history').delete().eq('user_id', userId);
}

// ── Favorites ─────────────────────────────────────────────────────────────────
export async function loadFavorites(userId) {
  const { data } = await supabase.from('favorites')
    .select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addFavorite(userId, item) {
  return supabase.from('favorites').insert({
    user_id: userId,
    source_text: item.source,
    translated_text: item.translated,
    source_language: item.sourceLanguage,
    target_language: item.targetLanguage,
    type: item.type || 'translation',
  });
}

export async function removeFavorite(userId, sourceText) {
  return supabase.from('favorites').delete()
    .eq('user_id', userId).eq('source_text', sourceText);
}

// ── Grammar history ───────────────────────────────────────────────────────────
export async function saveGrammarCheck(userId, item) {
  return supabase.from('grammar_history').insert({
    user_id: userId,
    original_text: item.originalText,
    refined_text: item.refinedText,
    corrections_count: item.correctionsCount,
    tone: item.tone,
  });
}

export async function loadGrammarHistory(userId) {
  const { data } = await supabase.from('grammar_history')
    .select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(20);
  return data || [];
}
