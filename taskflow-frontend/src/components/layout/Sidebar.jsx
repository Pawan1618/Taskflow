import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/',         label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects',  Icon: FolderKanban,    end: false },
  { to: '/tasks',    label: 'Board',     Icon: CheckSquare,     end: false },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <style>{`
        .tf-sidebar-shell {
          width: 240px;
          min-width: 240px;
          background: #0C2040;
          color: #B8D0EB;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.25s ease, width 0.25s ease;
          z-index: 100;
          flex-shrink: 0;
        }
        .tf-sidebar-shell.closed {
          transform: translateX(-100%);
          width: 0;
          min-width: 0;
        }
        .tf-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          margin: 2px 8px;
          border-radius: 6px;
          color: #8BAFD4;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
          letter-spacing: 0.1px;
        }
        .tf-nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
        .tf-nav-link.active {
          background: rgba(0,82,204,0.25);
          color: #4C9AFF;
          font-weight: 600;
        }
        .tf-nav-link.active svg {
          color: #4C9AFF;
        }
        .tf-sidebar-close-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .tf-sidebar-shell {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            transform: ${open ? 'translateX(0)' : 'translateX(-100%)'};
            width: 240px !important;
            min-width: 240px !important;
          }
          .tf-sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>

      <div className={`tf-sidebar-shell${open ? '' : ' closed'}`}>
        {/* ── Logo bar ───────────────────────────────────── */}
        <div style={{
          height: 56,
          display: 'flex', alignItems: 'center',
          padding: '0 16px 0 20px',
          background: '#091529',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          gap: 10,
        }}>
          <div style={{
            width: 30, height: 30,
            background: '#0052CC', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', color: '#fff',
            flexShrink: 0,
          }}>
            TF
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.3px', flex: 1 }}>
            TaskFlow
          </span>
          {/* Close button — visible on mobile */}
          <button
            className="tf-sidebar-close-btn"
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer',
              color: '#8BAFD4',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav section label ──────────────────────────── */}
        <div style={{
          padding: '18px 20px 8px',
          fontSize: '10px', fontWeight: '700',
          color: '#3D5A7A', textTransform: 'uppercase', letterSpacing: '1.2px',
        }}>
          Main Menu
        </div>

        {/* ── Nav links ──────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '4px 0' }}>
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `tf-nav-link${isActive ? ' active' : ''}`}
              onClick={() => {
                // Auto-close on mobile after navigation
                if (window.innerWidth <= 768) onClose();
              }}
            >
              <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── User footer ────────────────────────────────── */}
        <div style={{
          padding: '12px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052CC, #4C9AFF)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#E6F0FF',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{
                fontSize: 10, color: '#4A6A8A', marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.email || ''}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#4A6A8A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,86,48,0.15)'; e.currentTarget.style.color = '#FF5630'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4A6A8A'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
