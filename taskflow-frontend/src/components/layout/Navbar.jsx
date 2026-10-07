import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, ChevronDown, Settings, User, Menu, X, CheckSquare, FolderKanban, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import { getTasks, getProjects } from '../../services/api';

const PRIO_DOT = {
  HIGH: '#FF5630',
  MEDIUM: '#FF8B00',
  LOW: '#36B37E',
};

const STATUS_PILL = {
  TODO: { bg: '#F4F5F7', color: '#42526E', label: 'To Do' },
  IN_PROGRESS: { bg: '#DEEBFF', color: '#0052CC', label: 'In Progress' },
  DONE: { bg: '#E3FCEF', color: '#006644', label: 'Done' },
};

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const dropRef = useRef(null);
  const searchRef = useRef(null);

  // Load search pool when search is opened
  const loadSearchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([getTasks(), getProjects()]);
      setAllTasks(tRes.data || []);
      setAllProjects(pRes.data || []);
    } catch {
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Live filter matching
  const q = searchQuery.trim().toLowerCase();
  const matchedTasks = q
    ? allTasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.project?.name?.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedProjects = q
    ? allProjects.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const handleSelectTask = (task) => {
    setSearchOpen(false);
    navigate('/tasks', {
      state: {
        projectId: task.project?.id ? String(task.project.id) : 'all',
        taskId: task.id,
      },
    });
  };

  const handleSelectProject = (project) => {
    setSearchOpen(false);
    navigate('/tasks', {
      state: { projectId: String(project.id) },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchOpen(false);
      navigate('/tasks');
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

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
          <img src="/logo.svg" alt="TaskFlow Logo" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', letterSpacing: '0.2px' }}>
            TaskFlow
          </span>
        </div>
      )}

      {/* ── Spacer ───────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Search Bar with Live Results Popover ───────── */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: searchOpen ? '#fff' : '#F8F9FA',
          border: `1.5px solid ${searchOpen ? '#0052CC' : '#E8EAED'}`,
          borderRadius: 8, padding: '6px 12px',
          width: searchOpen || searchQuery ? 290 : 210,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: searchOpen ? '0 0 0 3px rgba(0,82,204,0.15)' : 'none',
        }}>
          <Search size={14} style={{ color: searchOpen ? '#0052CC' : '#97A0AF', flexShrink: 0 }} />
          <input
            placeholder="Search tasks, projects… (Enter)"
            value={searchQuery}
            onFocus={() => {
              setSearchOpen(true);
              loadSearchData();
            }}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (!searchOpen) setSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#172B4D', width: '100%', fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              style={{
                border: 'none', background: 'transparent', padding: 2,
                cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#97A0AF',
              }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Results Dropdown ────────────────────────────── */}
        {searchOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            width: 360, background: '#fff',
            border: '1px solid #E8EAED', borderRadius: 12,
            boxShadow: '0 12px 36px rgba(9,30,66,0.16)',
            zIndex: 250, overflow: 'hidden',
            maxHeight: 460, display: 'flex', flexDirection: 'column',
          }}>
            {/* Header info */}
            <div style={{
              padding: '10px 14px', background: '#FAFBFC', borderBottom: '1px solid #F0F1F3',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>
              <span>{q ? `Results for "${searchQuery}"` : 'Quick Jump'}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#97A0AF' }}>ESC to close</span>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 360, padding: '6px 0' }}>
              {/* Tasks Section */}
              {matchedTasks.length > 0 && (
                <div>
                  <div style={{
                    padding: '6px 14px 4px', fontSize: 11, fontWeight: 700,
                    color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.3px',
                  }}>
                    Tasks ({matchedTasks.length})
                  </div>
                  {matchedTasks.map(t => {
                    const sp = STATUS_PILL[t.status] || STATUS_PILL.TODO;
                    const pDot = PRIO_DOT[t.priority] || '#97A0AF';
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTask(t)}
                        style={{
                          padding: '8px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <CheckSquare size={15} color="#0052CC" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: '#172B4D',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {t.title}
                          </div>
                          <div style={{
                            fontSize: 11, color: '#6B778C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
                          }}>
                            <span>{t.project?.name || 'No project'}</span>
                            <span>•</span>
                            <span style={{
                              display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: pDot,
                            }} />
                            <span style={{ textTransform: 'capitalize' }}>{t.priority?.toLowerCase()}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          background: sp.bg, color: sp.color, flexShrink: 0,
                        }}>
                          {sp.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Projects Section */}
              {matchedProjects.length > 0 && (
                <div style={{ marginTop: matchedTasks.length > 0 ? 8 : 0 }}>
                  <div style={{
                    padding: '6px 14px 4px', fontSize: 11, fontWeight: 700,
                    color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.3px',
                    borderTop: matchedTasks.length > 0 ? '1px solid #F0F1F3' : 'none',
                    paddingTop: matchedTasks.length > 0 ? 8 : 6,
                  }}>
                    Projects ({matchedProjects.length})
                  </div>
                  {matchedProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      style={{
                        padding: '8px 14px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FolderKanban size={15} color="#6554C0" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: '#172B4D',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {p.name}
                        </div>
                        {p.description && (
                          <div style={{
                            fontSize: 11, color: '#6B778C',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1,
                          }}>
                            {p.description}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={13} color="#C1C7D0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when searching */}
              {q && matchedTasks.length === 0 && matchedProjects.length === 0 && (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: '#6B778C' }}>
                  <Search size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>No results found</div>
                  <div style={{ fontSize: 12, color: '#97A0AF', marginTop: 2 }}>
                    No tasks or projects matching "{searchQuery}"
                  </div>
                </div>
              )}

              {/* Hint state when input is empty */}
              {!q && (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#97A0AF' }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    Type to search tasks, descriptions, and projects…
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Enter key action */}
            {q && (
              <div
                onClick={() => {
                  setSearchOpen(false);
                  navigate('/tasks');
                }}
                style={{
                  padding: '9px 14px', background: '#F8F9FA', borderTop: '1px solid #F0F1F3',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0052CC',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DEEBFF'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8F9FA'}
              >
                <span>View all matching tasks on Board</span>
                <CornerDownLeft size={13} />
              </div>
            )}
          </div>
        )}
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
