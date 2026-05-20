import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, ChevronDown, Settings, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header style={{
      height: 56, background: '#fff',
      borderBottom: '1px solid #F0F1F3',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 10,
      flexShrink: 0, zIndex: 50,
    }}>

      {/* ── Hamburger toggle ─────────────────────────────── */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #E8EAED', background: sidebarOpen ? '#F4F5F7' : '#fff',
          cursor: 'pointer', color: '#42526E',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = '#C1C7D0'; }}
        onMouseLeave={e => { e.currentTarget.style.background = sidebarOpen ? '#F4F5F7' : '#fff'; e.currentTarget.style.borderColor = '#E8EAED'; }}
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* ── Brand (visible when sidebar is closed) ────────── */}
      {!sidebarOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: '#0052CC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>TF</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', letterSpacing: '0.2px' }}>
            TaskFlow
          </span>
        </div>
      )}

      {/* ── Spacer ───────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Search ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: '#F8F9FA', border: '1.5px solid #E8EAED',
        borderRadius: 8, padding: '6px 12px',
        width: 200, transition: 'border-color 0.15s, width 0.2s',
      }}
        onFocus={e => e.currentTarget.style.borderColor = '#4C9AFF'}
        onBlur={e => e.currentTarget.style.borderColor = '#E8EAED'}
      >
        <Search size={13} style={{ color: '#97A0AF', flexShrink: 0 }} />
        <input
          placeholder="Search…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: '#172B4D', width: '100%', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* ── Notifications ────────────────────────────────── */}
      <button
        title="Notifications"
        style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #E8EAED', background: '#fff',
          cursor: 'pointer', color: '#42526E', position: 'relative',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
      >
        <Bell size={16} />
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7,
          background: '#FF5630', borderRadius: '50%',
          border: '1.5px solid #fff',
        }} />
      </button>

      {/* ── User dropdown ────────────────────────────────── */}
      <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setDropOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 8px 5px 5px', borderRadius: 8,
            border: '1.5px solid #E8EAED',
            background: dropOpen ? '#F4F5F7' : '#fff',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = '#C1C7D0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = dropOpen ? '#F4F5F7' : '#fff'; e.currentTarget.style.borderColor = '#E8EAED'; }}
        >
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0052CC, #4C9AFF)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name - hidden on small screens */}
          <div style={{ textAlign: 'left' }} className="nav-user-text">
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#172B4D',
              whiteSpace: 'nowrap', maxWidth: 100,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: '#97A0AF' }}>Member</div>
          </div>

          <ChevronDown size={13} style={{
            color: '#97A0AF',
            transform: dropOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }} />
        </button>

        {/* ── Dropdown panel ───────────────────────────── */}
        {dropOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 250, background: '#fff',
            border: '1px solid #E8EAED', borderRadius: 12,
            boxShadow: '0 12px 40px rgba(9,30,66,0.15)',
            zIndex: 200, overflow: 'hidden',
          }}>
            {/* User info */}
            <div style={{ padding: '16px', background: '#FAFBFC', borderBottom: '1px solid #F0F1F3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0052CC, #4C9AFF)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
                }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: '#172B4D',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user?.name || 'Unknown User'}
                  </div>
                  <div style={{
                    fontSize: 11, color: '#97A0AF', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user?.email || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px 0' }}>
              <DropItem icon={<User size={14} />}     label="My Profile" />
              <DropItem icon={<Settings size={14} />}  label="Settings" />
            </div>

            <div style={{ height: 1, background: '#F0F1F3' }} />

            <div style={{ padding: '6px 0 6px' }}>
              <button
                onClick={() => { setDropOpen(false); logout(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', width: '100%',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#FF5630', fontWeight: 700,
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFEBE6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function DropItem({ icon, label }) {
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', width: '100%',
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 13, color: '#42526E', fontWeight: 500,
        textAlign: 'left', transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}
      {label}
    </button>
  );
}
