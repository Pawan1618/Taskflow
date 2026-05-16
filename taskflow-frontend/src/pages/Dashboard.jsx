import React, { useEffect, useState } from 'react';
import { getTasks, getProjects } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CheckSquare, FolderKanban, Users, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const PRIO_COLOR = { HIGH: '#FF5630', MEDIUM: '#0052CC', LOW: '#36B37E' };

function StatCard({ icon: Icon, label, value, color = '#0052CC', sub }) {
  return (
    <div className="tf-stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <span className="tf-stat-label">{label}</span>
      </div>
      <div className="tf-stat-num">{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#97A0AF', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getTasks(), getProjects()])
      .then(([t, p]) => { setTasks(t.data); setProjects(p.data); })
      .catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="tf-loading"><div className="tf-spinner" /></div>;

  const today      = dayjs();
  const todo       = tasks.filter(t => t.status === 'TODO').length;
  const inProg     = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done       = tasks.filter(t => t.status === 'DONE').length;
  const overdue    = tasks.filter(t => t.dueDate && dayjs(t.dueDate).isBefore(today, 'day') && t.status !== 'DONE').length;
  const activeProj = projects.filter(p => p.status === 'ACTIVE').length;
  const pct        = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  // Top 5 recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <>
      <div className="tf-page-header">
        <h1 className="tf-page-title">Dashboard</h1>
        <span style={{ fontSize: 12, color: '#6B778C' }}>{today.format('dddd, MMMM D, YYYY')}</span>
      </div>

      <div className="tf-page-body" style={{ gap: 20 }}>

        {/* Stat cards */}
        <div className="tf-stats-grid">
          <StatCard icon={FolderKanban} label="Active Projects" value={activeProj} color="#0052CC" sub={`${projects.length} total`} />
          <StatCard icon={CheckSquare}  label="Total Tasks"     value={tasks.length} color="#6554C0" sub={`${pct}% complete`} />
          <StatCard icon={Clock}        label="In Progress"     value={inProg}  color="#FF8B00" />
          <StatCard icon={TrendingUp}   label="Completed"       value={done}    color="#00875A" />
          <StatCard icon={AlertCircle}  label="Overdue"         value={overdue} color="#FF5630" sub={overdue > 0 ? 'Needs attention' : 'All on track'} />
        </div>

        {/* Overall progress */}
        {tasks.length > 0 && (
          <div className="tf-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>Overall Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0052CC' }}>{pct}%</span>
            </div>
            <div className="tf-progress-bar" style={{ height: 8 }}>
              <div className="tf-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: '#6B778C' }}>
              <span><span style={{ fontWeight: 600, color: '#42526E' }}>{todo}</span> To Do</span>
              <span><span style={{ fontWeight: 600, color: '#0052CC' }}>{inProg}</span> In Progress</span>
              <span><span style={{ fontWeight: 600, color: '#00875A' }}>{done}</span> Done</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>

          {/* Recent tasks */}
          <div className="tf-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Recent Tasks</span>
              <button className="tf-btn-ghost" style={{ fontSize: 12, color: '#0052CC' }} onClick={() => navigate('/tasks')}>
                View all →
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <div className="tf-empty"><CheckSquare size={24} style={{ opacity: 0.2 }} /><span>No tasks yet</span></div>
            ) : (
              <div>
                {recentTasks.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderBottom: '1px solid #F4F5F7',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="prio-dot" style={{ background: PRIO_COLOR[t.priority], flexShrink: 0 }} />
                    <span style={{
                      flex: 1, fontSize: 13, color: '#172B4D',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{t.title}</span>
                    <span className={`tf-badge ${t.status === 'TODO' ? 'todo' : t.status === 'IN_PROGRESS' ? 'in_progress' : 'done'}`}
                      style={{ fontSize: 10, padding: '1px 6px' }}>
                      {t.status === 'IN_PROGRESS' ? 'In Progress' : t.status === 'TODO' ? 'To Do' : 'Done'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects overview */}
          <div className="tf-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Projects</span>
              <button className="tf-btn-ghost" style={{ fontSize: 12, color: '#0052CC' }} onClick={() => navigate('/projects')}>
                View all →
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="tf-empty"><FolderKanban size={24} style={{ opacity: 0.2 }} /><span>No projects yet</span></div>
            ) : (
              <div>
                {projects.slice(0, 6).map(p => {
                  const projTasks  = tasks.filter(t => t.project?.id === p.id);
                  const projDone   = projTasks.filter(t => t.status === 'DONE').length;
                  const projPct    = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '10px 16px', borderBottom: '1px solid #F4F5F7',
                        cursor: 'pointer', transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      onClick={() => navigate('/projects')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#172B4D' }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: '#97A0AF' }}>{projDone}/{projTasks.length} done</span>
                      </div>
                      <div className="tf-progress-bar">
                        <div className="tf-progress-fill" style={{ width: `${projPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
