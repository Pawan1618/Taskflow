import React, { useState, createContext, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const SidebarContext = createContext({ open: true, setOpen: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <style>{`
        @media (max-width: 768px) {
          .tf-sidebar-overlay { display: block !important; }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

        {/* ── Mobile overlay backdrop ─────────────────────── */}
        {open && (
          <div
            className="tf-sidebar-overlay"
            onClick={() => setOpen(false)}
            style={{
              display: 'none',
              position: 'fixed', inset: 0,
              background: 'rgba(9,30,66,0.5)',
              zIndex: 99,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────── */}
        <Sidebar open={open} onClose={() => setOpen(false)} />

        {/* ── Main area ───────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          transition: 'margin-left 0.25s ease',
        }}>
          <Navbar onToggleSidebar={() => setOpen(o => !o)} sidebarOpen={open} />
          <main className="tf-page">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
