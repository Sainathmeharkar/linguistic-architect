// src/components/layout/SideNavBar.jsx
import React from 'react';

const SideNavBar = ({ isOpen, closeMenu, activePage, setActivePage }) => {
  const menuItems = [
    { icon: 'camera_alt', label: 'Visual Intelligence', path: 'camera', badge: null },
    { icon: 'description', label: 'Document Architect', path: 'document', badge: null },
    { icon: 'spellcheck', label: 'Refine Architecture', path: 'grammar', badge: '3' },
    { icon: 'tune', label: 'Settings', path: 'settings', badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 bg-surface-container-low
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-outline-variant/10
      `}>

        {/* Logo area for mobile */}
        <div className="flex items-center gap-3 px-6 py-5 lg:hidden border-b border-outline-variant/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-fixed" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>translate</span>
          </div>
          <span className="text-[16px] font-black tracking-tight font-headline text-on-surface">
            Linguistic<span className="text-primary ml-1">Architect</span>
          </span>
        </div>

        {/* Section Header */}
        <div className="px-6 pt-8 pb-4">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/60">
            Workspaces
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activePage === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { setActivePage(item.path); closeMenu(); }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 text-left rounded-2xl
                  transition-all duration-200 group relative focus-ring
                  ${isActive
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></span>
                )}

                <span
                  className={`material-symbols-outlined transition-all ${
                    isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary/80'
                  }`}
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  {item.icon}
                </span>

                <span className={`font-body text-sm flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>

                {item.badge && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 pb-6 pt-4 space-y-3">
          <div className="h-px bg-outline-variant/15"></div>

          {/* API status pill */}
          <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-surface-container/60">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
            <span className="text-[11px] text-on-surface-variant font-medium flex-1">All APIs online</span>
            <span className="text-[10px] font-bold text-green-400">Live</span>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-on-surface-variant/50 font-body">v1.0.0</span>
            <span className="text-[10px] text-on-surface-variant/50">Free tier</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNavBar;
