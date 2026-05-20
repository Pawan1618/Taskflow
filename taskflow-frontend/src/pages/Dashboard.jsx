import React, { useEffect, useState } from 'react';
import { getTasks, getProjects } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CheckSquare, FolderKanban, TrendingUp, AlertCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const PRIO_COLOR  = { HIGH: '#FF5630', MEDIUM: '#FF8B00', LOW: '#36B37E' };
const PRIO_BG     = { HIGH: '#FFEBE6', MEDIUM: '#FFF0E6', LOW: '#E3FCEF' };
const STATUS_STYLE = {
  TODO:        { bg: '#F4F5F7', color: '#42526E', label: 'To Do' },
  IN_PROGRESS: { bg: '#DEEBFF', color: '#0052CC', label: 'In Progress' },
  DONE:        { bg: '#E3FCEF', color: '#006644', label: 'Done' },
};

function StatCard({ icon: Icon, label, value, color, bg, sub, onClick }) {
  const [hov, setHov] = useState(false);
  const cardBg = bg || `${color}0D`; // Soft 5% - 8% opacity tint of the theme color
  const cardBorder = `${color}20`;   // Subtle matching semantic border
  const hoverBorder = `${color}60`;  // Higher contrast border on hover

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: cardBg,
        border: `1px solid ${hov ? hoverBorder : cardBorder}`,
        borderRadius: 12,
        padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hov ? `0 6px 20px ${color}1A` : '0 2px 6px rgba(0,0,0,0.02)',
        transform: hov && onClick ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}>
          <Icon size={20} color={color} />
        </div>
        {onClick && (
          <ArrowRight 
            size={15} 
            color={hov ? color : '#C1C7D0'} 
            style={{ 
              transition: 'all 0.18s ease', 
              transform: hov ? 'translateX(2px)' : 'none' 
            }} 
          />
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, letterSpacing: '-1px', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#42526E' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B778C', fontWeight: 500, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const toast    = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getTasks(), getProjects()])
      .then(([t, p]) => { setTasks(t.data); setProjects(p.data); })
      .catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}>
      <div className="tf-spinner" />
      <span style={{ fontSize: 13, color: '#97A0AF' }}>Loading your workspace…</span>
    </div>
  );

  const today      = dayjs();
  const todo       = tasks.filter(t => t.status === 'TODO').length;
  const inProg     = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done       = tasks.filter(t => t.status === 'DONE').length;
  const overdue    = tasks.filter(t => t.dueDate && dayjs(t.dueDate).isBefore(today, 'day') && t.status !== 'DONE').length;
  const activeProj = projects.filter(p => p.status === 'ACTIVE').length;
  const pct        = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const greeting = today.hour() < 12 ? 'Good morning' : today.hour() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{
        padding: '24px 28px 20px',
        borderBottom: '1px solid #F0F1F3',
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: '#97A0AF', fontWeight: 500, marginBottom: 2 }}>
              {today.format('dddd, MMMM D, YYYY')}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8,
              background: '#0052CC', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0747A6'}
            onMouseLeave={e => e.currentTarget.style.background = '#0052CC'}
          >
            <Plus size={15} /> Create Task
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1, overflow: 'auto' }}>

        {/* ── Stat Cards ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          <StatCard icon={FolderKanban} label="Active Projects" value={activeProj}     color="#0052CC" sub={`${projects.length} total`} onClick={() => navigate('/projects')} />
          <StatCard icon={CheckSquare}  label="Total Tasks"     value={tasks.length}   color="#6554C0" sub={`${pct}% complete`}       onClick={() => navigate('/tasks')} />
          <StatCard icon={Clock}        label="In Progress"     value={inProg}          color="#FF8B00" />
          <StatCard icon={TrendingUp}   label="Completed"       value={done}            color="#00875A" />
          <StatCard icon={AlertCircle}  label="Overdue"         value={overdue}         color="#FF5630" sub={overdue > 0 ? 'Needs attention' : 'All on track'} />
        </div>

        {/* ── Progress Bar ─────────────────────────────────── */}
        {tasks.length > 0 && (
          <div style={{
            background: '#fff', border: '1px solid #E8EAED',
            borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>Overall Progress</span>
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#0052CC',
                background: '#DEEBFF', padding: '2px 10px', borderRadius: 100,
              }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: '#F4F5F7', borderRadius: 100, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                borderRadius: 100, transition: 'width 0.7s ease',
                background: 'linear-gradient(90deg, #0052CC, #4C9AFF)',
              }} />
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6B778C' }}>
              <span><span style={{ fontWeight: 700, color: '#42526E' }}>{todo}</span> To Do</span>
              <span><span style={{ fontWeight: 700, color: '#0052CC' }}>{inProg}</span> In Progress</span>
              <span><span style={{ fontWeight: 700, color: '#00875A' }}>{done}</span> Done</span>
            </div>
          </div>
        )}

        {/* ── 2-col lower ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Recent Tasks */}
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #F0F1F3',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>Recent Tasks</span>
              <button
                onClick={() => navigate('/tasks')}
                style={{
                  fontSize: 12, color: '#0052CC', background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3,
                }}
              >View all <ArrowRight size={12} /></button>
            </div>
            {recentTasks.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#97A0AF', fontSize: 13 }}>
                <CheckSquare size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                <div>No tasks yet</div>
              </div>
            ) : (
              recentTasks.map(t => {
                const ss = STATUS_STYLE[t.status] || STATUS_STYLE.TODO;
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate('/tasks')}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid #F8F9FA', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIO_COLOR[t.priority], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: 100, flexShrink: 0 }}>
                      {ss.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Projects Overview */}
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #F0F1F3',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>Projects</span>
              <button
                onClick={() => navigate('/projects')}
                style={{ fontSize: 12, color: '#0052CC', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
              >View all <ArrowRight size={12} /></button>
            </div>
            {projects.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#97A0AF', fontSize: 13 }}>
                <FolderKanban size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                <div>No projects yet</div>
              </div>
            ) : (
              projects.slice(0, 5).map(p => {
                const pt  = tasks.filter(t => t.project?.id === p.id);
                const pd  = pt.filter(t => t.status === 'DONE').length;
                const pp  = pt.length > 0 ? Math.round((pd / pt.length) * 100) : 0;
                const col = ['#0052CC','#6554C0','#00875A','#FF8B00','#FF5630','#00B8D9'][p.name.charCodeAt(0) % 6];
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('/projects')}
                    style={{ padding: '12px 20px', borderBottom: '1px solid #F8F9FA', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: '#97A0AF', flexShrink: 0 }}>{pd}/{pt.length}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{pp}%</span>
                    </div>
                    <div style={{ height: 5, background: '#F4F5F7', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pp}%`, background: col, borderRadius: 100, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
  );
}
