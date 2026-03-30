// src/components/layout/TopNavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { signOut } from '../../utils/supabase.js';
import AuthModal from '../auth/AuthModal.jsx';

const NOTIFICATIONS = [
  { id:1, icon:'check_circle', color:'text-primary',   title:'Translation complete',   body:'Your document was translated to Spanish.',  time:'2m ago',  read:false },
  { id:2, icon:'spellcheck',   color:'text-secondary', title:'Grammar check done',     body:'3 issues found in your latest text.',        time:'15m ago', read:false },
  { id:3, icon:'auto_awesome', color:'text-primary',   title:'New language support',   body:'Hindi & Vietnamese added to all engines.',   time:'1h ago',  read:true  },
];

const HELP_ITEMS = [
  { icon:'translate',    title:'Document Translation', desc:'Paste text or upload a file. Choose languages, then click Translate.' },
  { icon:'camera_alt',   title:'Visual Intelligence',  desc:'Upload an image — OCR extracts the text automatically, then translates it.' },
  { icon:'spellcheck',   title:'Grammar Check',        desc:'Type or paste text, click Check Grammar. Accept or ignore each suggestion.' },
  { icon:'keyboard',     title:'Keyboard Shortcuts',   desc:'Ctrl+Enter to translate/check · Ctrl+Shift+C to copy · Ctrl+E to export.' },
  { icon:'cloud_upload', title:'File Upload',          desc:'Drag & drop or click to upload .txt, .docx, .pdf files.' },
  { icon:'dark_mode',    title:'Dark / Light Mode',    desc:'Go to Settings → Appearance to switch themes instantly.' },
];

export default function TopNavBar({ toggleMobileMenu, activePage, setActivePage }) {
  const { user, profile } = useAuth();
  const [scrolled, setScrolled]       = useState(false);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showHelp, setShowHelp]       = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifs, setNotifs]           = useState(NOTIFICATIONS);
  const notifsRef  = useRef(null);
  const helpRef    = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;
  const isGuest     = !user;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const initials    = displayName ? displayName.slice(0, 2).toUpperCase() : '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current  && !notifsRef.current.contains(e.target))  setShowNotifs(false);
      if (helpRef.current    && !helpRef.current.contains(e.target))    setShowHelp(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { label:'Visual',   page:'camera',   icon:'camera_alt' },
    { label:'Document', page:'document', icon:'description' },
    { label:'Grammar',  page:'grammar',  icon:'spellcheck' },
    { label:'Settings', page:'settings', icon:'tune' },
  ];

  return (
    <>
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel shadow-2xl shadow-black/20' : 'bg-surface'}`}>
      <div className="flex justify-between items-center px-6 lg:px-10 h-[68px]">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-xl hover:bg-surface-bright transition-colors mr-1" onClick={toggleMobileMenu}>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-ring ${activePage === item.page ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${activePage === item.page ? 'text-primary' : ''}`}
                style={{ fontSize: '16px', fontVariationSettings: activePage === item.page ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => { setShowNotifs(v => !v); setShowHelp(false); setShowProfile(false); }}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all relative focus-ring">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: showNotifs ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-on-primary-fixed text-[9px] font-black flex items-center justify-center">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 glass-panel rounded-2xl shadow-2xl animate-slide-down overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                  <span className="font-bold text-sm text-on-surface">Notifications</span>
                  <div className="flex gap-3">
                    {unreadCount > 0 && <button onClick={() => setNotifs(n => n.map(x => ({...x, read:true})))} className="text-[10px] font-bold text-primary">Mark all read</button>}
                    <button onClick={() => setNotifs([])} className="text-[10px] font-bold text-on-surface-variant hover:text-error">Clear</button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifs.length === 0
                    ? <div className="flex flex-col items-center gap-2 py-8"><span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '28px' }}>notifications_off</span><p className="text-xs text-on-surface-variant">No notifications</p></div>
                    : notifs.map(n => (
                      <button key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id===n.id ? {...x,read:true} : x))}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface-container transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                        <span className={`material-symbols-outlined ${n.color} mt-0.5 shrink-0`} style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2"><p className="text-xs font-bold text-on-surface truncate">{n.title}</p><span className="text-[9px] text-on-surface-variant shrink-0">{n.time}</span></div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{n.body}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative" ref={helpRef}>
            <button onClick={() => { setShowHelp(v => !v); setShowNotifs(false); setShowProfile(false); }}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all focus-ring">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: showHelp ? "'FILL' 1" : "'FILL' 0" }}>help</span>
            </button>
            {showHelp && (
              <div className="absolute right-0 top-12 w-96 glass-panel rounded-2xl shadow-2xl animate-slide-down overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>help</span>
                    <span className="font-bold text-sm text-on-surface">How to use</span>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="p-1 rounded-lg hover:bg-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
                <div className="p-3 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
                  {HELP_ITEMS.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-all">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>{h.icon}</span>
                      </div>
                      <div><p className="text-xs font-bold text-on-surface">{h.title}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{h.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-outline-variant/30 mx-1 hidden sm:block"></div>

          {/* Profile icon — guest or logged in */}
          {isGuest ? (
            <button onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-bright transition-all focus-ring">
              <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant hidden sm:block">Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setShowProfile(v => !v); setShowNotifs(false); setShowHelp(false); }}
                className="p-1.5 rounded-xl hover:bg-surface-bright transition-all focus-ring" title={displayName}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-outline-variant/30" />
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary-fixed text-xs font-black shadow-md">
                      {initials || <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>person</span>}
                    </div>
                }
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-56 glass-panel rounded-2xl shadow-2xl animate-slide-down overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      {avatarUrl
                        ? <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-outline-variant/30" />
                        : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary-fixed text-xs font-black">{initials}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {[
                      { icon:'tune',    label:'Settings',  action: () => { setActivePage('settings'); setShowProfile(false); } },
                      { icon:'history', label:'History',   action: () => { setActivePage('document'); setShowProfile(false); } },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-outline-variant/15">
                    <button onClick={() => { signOut(); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error/10 transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    {(showHelp || showNotifs || showProfile) && (
      <div className="fixed inset-0 z-40 md:hidden" onClick={() => { setShowHelp(false); setShowNotifs(false); setShowProfile(false); }} />
    )}
    {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
