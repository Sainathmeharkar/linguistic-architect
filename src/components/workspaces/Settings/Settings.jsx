// src/components/workspaces/Settings/Settings.jsx
import React, { useState } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import Button from '../../shared/Button';
import GlassPanel from '../../shared/GlassPanel';
import Icon from '../../shared/Icon';

const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus-ring ${checked ? 'bg-primary' : 'bg-surface-variant'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-on-surface shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5 bg-on-primary-fixed' : 'translate-x-0'}`}></span>
  </button>
);

// Settings receives theme + setTheme from App so the change is immediate app-wide
const Settings = ({ theme: propTheme, setTheme: propSetTheme }) => {
  const [autoSave, setAutoSave] = useLocalStorage('autoSave', true);
  const [notifications, setNotifications] = useLocalStorage('notifications', true);
  const [cacheEnabled, setCacheEnabled] = useLocalStorage('cacheEnabled', true);
  const [defaultSourceLang, setDefaultSourceLang] = useLocalStorage('defaultSourceLang', 'English');
  const [defaultTargetLang, setDefaultTargetLang] = useLocalStorage('defaultTargetLang', 'Spanish');
  const [translationEngine, setTranslationEngine] = useLocalStorage('translationEngine', 'LibreTranslate');

  // Use prop theme if available, fall back to localStorage
  const theme = propTheme || localStorage.getItem('theme') || 'dark';

  const handleThemeChange = (newTheme) => {
    if (propSetTheme) {
      propSetTheme(newTheme); // triggers App's useEffect which updates <html>
    } else {
      const root = document.documentElement;
      if (newTheme === 'dark') { root.classList.add('dark'); root.setAttribute('data-theme', 'dark'); }
      else { root.classList.remove('dark'); root.setAttribute('data-theme', 'light'); }
      localStorage.setItem('theme', newTheme);
    }
  };

  const LANGS = ['English','Spanish','French','German','Japanese','Chinese','Arabic','Portuguese','Korean'];

  const shortcuts = [
    { shortcut: 'Ctrl + Enter',   action: 'Translate / Check Grammar' },
    { shortcut: 'Ctrl + Shift + C', action: 'Copy Result' },
    { shortcut: 'Ctrl + S',       action: 'Save to History' },
    { shortcut: 'Ctrl + E',       action: 'Export Result' },
  ];


  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center border border-outline-variant/15">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>tune</span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-none">
            Settings <span className="text-on-surface-variant font-normal text-2xl">& Preferences</span>
          </h1>
        </div>
        <p className="text-on-surface-variant text-base max-w-2xl pl-1">
          Customize your Linguistic Architect experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appearance */}
        <GlassPanel variant="default" className="rounded-2xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-base flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>palette</span>
            Appearance
          </h2>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'dark',  icon: 'dark_mode',  label: 'Dark' },
                { value: 'light', icon: 'light_mode', label: 'Light' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border ${
                    theme === t.value
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-container border-outline-variant/10 text-on-surface-variant hover:bg-surface-bright'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: theme === t.value ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Translation */}
        <GlassPanel variant="default" className="rounded-2xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-base flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>translate</span>
            Translation
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Default Source</label>
              <select value={defaultSourceLang} onChange={e => setDefaultSourceLang(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 text-on-surface text-sm focus:outline-none focus:border-primary/40">
                {LANGS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Default Target</label>
              <select value={defaultTargetLang} onChange={e => setDefaultTargetLang(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 text-on-surface text-sm focus:outline-none focus:border-primary/40">
                {LANGS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Engine</label>
              <select value={translationEngine} onChange={e => setTranslationEngine(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 text-on-surface text-sm focus:outline-none focus:border-primary/40">
                <option>LibreTranslate</option>
                <option>DeepL</option>
                <option>Google Translate</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* Behavior */}
        <GlassPanel variant="default" className="rounded-2xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-base flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>settings_suggest</span>
            Behavior
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Auto-save', desc: 'Save changes automatically', value: autoSave, onChange: () => setAutoSave(!autoSave) },
              { label: 'Notifications', desc: 'Show translation alerts', value: notifications, onChange: () => setNotifications(!notifications) },
              { label: 'Cache results', desc: 'Speed up repeated translations', value: cacheEnabled, onChange: () => setCacheEnabled(!cacheEnabled) },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-all">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
                <Toggle checked={item.value} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>


      {/* Keyboard Shortcuts */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-base flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>keyboard</span>
          Keyboard Shortcuts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-outline-variant/20 transition-all">
              <span className="text-sm text-on-surface-variant">{s.action}</span>
              <kbd className="px-3 py-1.5 bg-surface-bright text-on-surface text-xs font-mono rounded-lg border border-outline-variant/20 shadow-sm">{s.shortcut}</kbd>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <GlassPanel variant="elevated" className="rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="material-symbols-outlined text-on-primary-fixed" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>translate</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Linguistic Architect</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Version 1.0.0 · Built with React + Vite + Tailwind CSS</p>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                A modern translation and grammar platform designed for precision communication across languages.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outlined" size="sm" onClick={() => window.open('https://languagetool.org/http-api/', '_blank')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>help_outline</span>
              API Docs
            </Button>
            <Button variant="outlined" size="sm" onClick={() => window.open('mailto:support@linguistic-architect.app', '_blank')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
              Contact
            </Button>
          </div>
        </div>

        {/* API status */}
        <div className="mt-5 pt-5 border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Google Translate',       status: 'Free · unofficial · 5k chars', ok: true },
            { name: 'LanguageTool (Grammar)', status: 'Free · no key needed',         ok: true },
            { name: 'OCR.space (OCR)',        status: 'Free · 25k req/month',         ok: true },
            { name: 'Cache',                  status: cacheEnabled ? 'Active' : 'Disabled', ok: cacheEnabled },
          ].map(api => (
            <div key={api.name} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container">
              <span className={`w-2 h-2 rounded-full ${api.ok ? 'bg-green-400' : 'bg-outline'}`}></span>
              <div>
                <p className="text-xs font-bold text-on-surface">{api.name}</p>
                <p className="text-[10px] text-on-surface-variant">{api.status}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};

export default Settings;
