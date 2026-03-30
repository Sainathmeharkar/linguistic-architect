// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './components/layout/MainLayout';
import CameraTranslation from './components/workspaces/CameraTranslation/CameraTranslation';
import DocumentTranslation from './components/workspaces/DocumentTranslation/DocumentTranslation';
import GrammarCorrection from './components/workspaces/GrammarCorrection/GrammarCorrection';
import Settings from './components/workspaces/Settings/Settings';

const PAGE_TITLES = {
  camera:   'Visual Intelligence — Linguistic Architect',
  document: 'Document Architect — Linguistic Architect',
  grammar:  'Refine Architecture — Linguistic Architect',
  settings: 'Settings — Linguistic Architect',
};

export default function App() {
  const { settings, loading } = useAuth();
  const [activePage, setActivePage] = useState('camera');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme from cloud settings when user logs in, else localStorage
  useEffect(() => {
    const t = settings?.theme || localStorage.getItem('theme') || 'dark';
    setTheme(t);
    applyTheme(t);
  }, [settings]);

  useEffect(() => {
    document.title = PAGE_TITLES[activePage] || 'Linguistic Architect';
  }, [activePage]);

  function applyTheme(t) {
    const root = document.documentElement;
    if (t === 'dark') { root.classList.add('dark'); root.setAttribute('data-theme', 'dark'); }
    else { root.classList.remove('dark'); root.setAttribute('data-theme', 'light'); }
    localStorage.setItem('theme', t);
  }

  function handleSetTheme(t) { setTheme(t); applyTheme(t); }

  // Brief loading spinner while checking existing session
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-on-primary-fixed animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
        </div>
        <p className="text-on-surface-variant text-sm">Loading...</p>
      </div>
    </div>
  );

  // Everyone gets access — guest or logged in
  const renderPage = () => {
    switch (activePage) {
      case 'document': return <DocumentTranslation />;
      case 'grammar':  return <GrammarCorrection />;
      case 'settings': return <Settings theme={theme} setTheme={handleSetTheme} setActivePage={setActivePage} />;
      default:         return <CameraTranslation />;
    }
  };

  return (
    <MainLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </MainLayout>
  );
}
