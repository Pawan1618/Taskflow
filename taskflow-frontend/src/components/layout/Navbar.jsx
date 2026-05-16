import React from 'react';
import { Bell, Search, HelpCircle } from 'lucide-react';

export default function Navbar({ title = 'TaskFlow' }) {
  return (
    <header className="tf-topbar">
      <span className="tf-topbar-title">{title}</span>

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#F4F5F7', border: '1px solid #DFE1E6',
        borderRadius: 4, padding: '5px 10px', width: 200,
      }}>
        <Search size={13} style={{ color: '#97A0AF' }} />
        <input
          placeholder="Search…"
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: '#172B4D', width: '100%',
          }}
        />
      </div>

      <button className="tf-btn-ghost" title="Help">
        <HelpCircle size={16} />
      </button>
      <button className="tf-btn-ghost" title="Notifications">
        <Bell size={16} />
      </button>
      <div className="tf-topbar-avatar" title="Profile">U</div>
    </header>
  );
}
