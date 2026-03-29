// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import TopNavBar from './TopNavBar';
import SideNavBar from './SideNavBar';

const MainLayout = ({ children, activePage, setActivePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface relative overflow-hidden">

      {/* Ambient background orbs — use CSS vars so they work in light mode */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--color-tertiary) 0%, transparent 70%)' }} />
      </div>

      <TopNavBar
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex flex-1 relative z-10 overflow-hidden">
        <SideNavBar
          isOpen={isMobileMenuOpen}
          closeMenu={() => setIsMobileMenuOpen(false)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 lg:p-7 max-w-6xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
