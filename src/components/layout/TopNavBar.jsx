// src/components/layout/TopNavBar.jsx
import React, { useState, useEffect, useRef } from 'react';

const NOTIFICATIONS = [
  { id: 1, icon: 'check_circle',  color: 'text-primary',   title: 'Translation complete',      body: 'Your document was translated to Spanish.',  time: '2m ago',  read: false },
  { id: 2, icon: 'spellcheck',    color: 'text-secondary', title: 'Grammar check done',         body: '3 issues found in your latest text.',       time: '15m ago', read: false },
  { id: 3, icon: 'cloud_upload',  color: 'text-tertiary',  title: 'File uploaded',              body: 'legal_contract.pdf is ready to translate.', time: '1h ago',  read: true  },
  { id: 4, icon: 'auto_awesome',  color: 'text-primary',   title: 'New language support',       body: 'Hindi & Vietnamese added to all engines.',  time: '2h ago',  read: true  },
];

const HELP_ITEMS = [
  { icon: 'translate',    title: 'Document Translation', desc: 'Paste text or upload a file. Choose source and target language, then click Translate.' },
  { icon: 'camera_alt',   title: 'Visual Intelligence',  desc: 'Upload an image — OCR extracts the text automatically, then translates it for you.' },
  { icon: 'spellcheck',   title: 'Grammar Check',        desc: 'Type or paste text, click Check Grammar. Accept or ignore each suggestion individually.' },
  { icon: 'keyboard',     title: 'Keyboard Shortcuts',   desc: 'Ctrl+Enter to translate/check · Ctrl+Shift+C to copy · Ctrl+E to export · Ctrl+S to save.' },
  { icon: 'cloud_upload', title: 'File Upload',          desc: 'Drag & drop or click to upload .txt, .docx, .pdf files. Content loads into the editor.' },
  { icon: 'dark_mode',    title: 'Dark / Light Mode',    desc: 'Go to Settings → Appearance to switch between dark and light themes instantly.' },
];

export default function TopNavBar({ toggleMobileMenu, activePage, setActivePage }) {
  const [scrolled, setScrolled]           = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [showHelp, setShowHelp]           = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const [notifs, setNotifs]               = useState(NOTIFICATIONS);
  const notifsRef  = useRef(null);
  const helpRef    = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current  && !notifsRef.current.contains(e.target))  setShowNotifs(false);
      if (helpRef.current    && !helpRef.current.contains(e.target))    setShowHelp(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function markAllRead() { setNotifs(n => n.map(x => ({ ...x, read: true }))); }
  function markRead(id)  { setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)); }
  function clearAll()    { setNotifs([]); }

  const navItems = [
    { label: 'Visual',    page: 'camera',   icon: 'camera_alt' },
    { label: 'Document',  page: 'document', icon: 'description' },
    { label: 'Grammar',   page: 'grammar',  icon: 'spellcheck' },
    { label: 'Settings',  page: 'settings', icon: 'tune' },
  ];


  return (
    <>
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel shadow-2xl shadow-black/20' : 'bg-surface'}`}>
      <div className="flex justify-between items-center px-6 lg:px-10 h-[68px]">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-xl hover:bg-surface-bright transition-colors mr-1" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>menu</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary-fixed" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>translate</span>
            </div>
            <span className="text-[17px] font-black text-on-surface tracking-tight font-headline hidden sm:block">
              Linguistic<span className="gradient-text-primary ml-1">Architect</span>
            </span>
          </div>
        </div>

        {/* Nav pill */}
        <nav className="hidden md:flex items-center bg-surface-container rounded-2xl p-1 gap-0.5">
          {navItems.map(item => (
            <button key={item.page} onClick={() => setActivePage(item.page)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-ring ${
                activePage === item.page ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined transition-colors ${activePage === item.page ? 'text-primary' : ''}`}
                style={{ fontSize: '16px', fontVariationSettings: activePage === item.page ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {/* ── Notifications ── */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => { setShowNotifs(v => !v); setShowHelp(false); setShowProfile(false); }}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all relative focus-ring" aria-label="Notifications">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: showNotifs ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-on-primary-fixed text-[9px] font-black flex items-center justify-center">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 glass-panel rounded-2xl shadow-2xl shadow-black/30 animate-slide-down overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                  <span className="font-headline font-bold text-sm text-on-surface">Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:opacity-70 transition-opacity">Mark all read</button>
                    )}
                    <button onClick={clearAll} className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors">Clear</button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {notifs.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>notifications_off</span>
                      <p className="text-xs text-on-surface-variant">No notifications</p>
                    </div>
                  ) : notifs.map(n => (
                    <button key={n.id} onClick={() => markRead(n.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface-container transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                      <span className={`material-symbols-outlined ${n.color} mt-0.5 shrink-0`} style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-on-surface truncate">{n.title}</p>
                          <span className="text-[9px] text-on-surface-variant shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* ── Help ── */}
          <div className="relative" ref={helpRef}>
            <button onClick={() => { setShowHelp(v => !v); setShowNotifs(false); setShowProfile(false); }}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all focus-ring" aria-label="Help">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: showHelp ? "'FILL' 1" : "'FILL' 0" }}>help</span>
            </button>

            {showHelp && (
              <div className="absolute right-0 top-12 w-96 glass-panel rounded-2xl shadow-2xl shadow-black/30 animate-slide-down overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>help</span>
                    <span className="font-headline font-bold text-sm text-on-surface">How to use Linguistic Architect</span>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
                <div className="p-3 max-h-96 overflow-y-auto custom-scrollbar space-y-1.5">
                  {HELP_ITEMS.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-all">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>{h.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{h.title}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-outline-variant/15 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>info</span>
                  <span className="text-[10px] text-on-surface-variant">Linguistic Architect v1.0 · All APIs are free tier</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-outline-variant/30 mx-1 hidden sm:block"></div>

          {/* ── Guest Profile ── */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setShowProfile(v => !v); setShowNotifs(false); setShowHelp(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-bright transition-all focus-ring group">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <span className="text-sm font-semibold text-on-surface-variant hidden sm:block">Guest</span>
              <span className="material-symbols-outlined text-on-surface-variant hidden sm:block" style={{ fontSize: '16px' }}>expand_more</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-56 glass-panel rounded-2xl shadow-2xl shadow-black/30 animate-slide-down overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Guest User</p>
                      <p className="text-[10px] text-on-surface-variant">Not signed in</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  {[
                    { icon: 'tune',          label: 'Settings',         action: () => { setActivePage('settings'); setShowProfile(false); } },
                    { icon: 'history',       label: 'Translation History', action: () => { setActivePage('document'); setShowProfile(false); } },
                    { icon: 'delete_sweep',  label: 'Clear All Data',   action: () => { if (confirm('Clear all local data?')) { localStorage.clear(); window.location.reload(); } } },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-outline-variant/15">
                  <p className="text-[10px] text-on-surface-variant text-center">Data stored locally in your browser</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Help/Notif backdrop on mobile */}
    {(showHelp || showNotifs || showProfile) && (
      <div className="fixed inset-0 z-40 md:hidden" onClick={() => { setShowHelp(false); setShowNotifs(false); setShowProfile(false); }} />
    )}
    </>
  );
}
