// src/App.jsx
import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import CameraTranslation from './components/workspaces/CameraTranslation/CameraTranslation';
import DocumentTranslation from './components/workspaces/DocumentTranslation/DocumentTranslation';
import GrammarCorrection from './components/workspaces/GrammarCorrection/GrammarCorrection';
import Settings from './components/workspaces/Settings/Settings';

function App() {
  const [activePage, setActivePage] = useState('camera');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Page titles per route
  const PAGE_TITLES = {
    camera:   'Visual Intelligence — Linguistic Architect',
    document: 'Document Architect — Linguistic Architect',
    grammar:  'Refine Architecture — Linguistic Architect',
    settings: 'Settings — Linguistic Architect',
  };

  // Update browser tab title on page change
  useEffect(() => {
    document.title = PAGE_TITLES[activePage] || 'Linguistic Architect';
  }, [activePage]);

  // Apply theme to <html> and persist whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderPage = () => {
    switch (activePage) {
      case 'document': return <DocumentTranslation />;
      case 'grammar':  return <GrammarCorrection />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} />;
      case 'camera':
      default:         return <CameraTranslation />;
    }
  };

  return (
    <MainLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </MainLayout>
  );
}

export default App;
