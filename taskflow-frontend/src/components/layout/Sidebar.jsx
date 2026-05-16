import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/',         label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/projects', label: 'Projects',   Icon: FolderKanban },
  { to: '/tasks',    label: 'Board',      Icon: CheckSquare },
];

export default function Sidebar() {
  return (
    <div className="tf-sidebar">
      {/* Logo */}
      <div className="tf-sidebar-logo">
        <div className="logo-icon">TF</div>
        <span>TaskFlow</span>
      </div>

      <div className="tf-sidebar-section">Main Menu</div>

      <nav style={{ flex: 1, padding: '4px 0' }}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `tf-sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon size={16} className="link-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user strip */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
      }}>
        <div className="tf-topbar-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>U</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>User</div>
          <div style={{ fontSize: 11, color: '#6B84AA', marginTop: 1 }}>Member</div>
        </div>
        <ChevronRight size={14} style={{ color: '#6B84AA' }} />
      </div>
    </div>
  );
}
