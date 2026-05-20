import React, { useEffect, useState } from 'react';
import { getTasks, getProjects, deleteTask } from '../services/api';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import GanttView   from '../components/GanttView';
import TaskModal   from '../components/TaskModal';
import { Plus, Columns, GanttChart, Trash2, LayoutGrid } from 'lucide-react';
import { getUsers } from '../services/api';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const PRIO_FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const PRIO_DOT = { HIGH: '#FF5630', MEDIUM: '#FF8B00', LOW: '#36B37E' };

export default function Tasks() {
  const toast    = useToast();
  const location = useLocation();
  const { searchQuery } = useSearch();

  const [tasks,      setTasks]      = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('kanban');
  const [selProject, setSelProject] = useState(location.state?.projectId || 'all');
  const [filterPrio, setFilterPrio] = useState('ALL');
  const [modal,      setModal]      = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    try {
      const [tRes, pRes, uRes] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      setUsers(uRes.data);
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visibleTasks = tasks.filter(t => {
    if (selProject !== 'all' && String(t.project?.id) !== selProject) return false;
    if (filterPrio  !== 'ALL' && t.priority !== filterPrio)            return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchProject = t.project?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProject) return false;
    }
    return true;
  });

  const handleDeleteConfirm = async () => {
    if (!confirmDel) return;
    try {
      await deleteTask(confirmDel.id);
      toast('Task deleted', 'success');
      setConfirmDel(null);
      load();
    } catch {
      toast('Failed to delete task', 'error');
    }
  };

  const total  = visibleTasks.length;
  const done   = visibleTasks.filter(t => t.status === 'DONE').length;
  const inProg = visibleTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo   = visibleTasks.filter(t => t.status === 'TODO').length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{
        padding: '16px 28px',
        background: '#fff',
        borderBottom: '1px solid #F0F1F3',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
      }}>
        {/* Title */}
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.3px', marginRight: 4 }}>
          Board
        </h1>

        {/* Project selector */}
        <select
          value={selProject}
          onChange={e => setSelProject(e.target.value)}
          style={{
            padding: '6px 12px', borderRadius: 8,
            border: '1.5px solid #E8EAED', background: '#FAFBFC',
            fontSize: 13, color: '#172B4D', fontWeight: 600,
            cursor: 'pointer', outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>

        {/* Priority chips */}
        <div style={{ display: 'flex', gap: 5 }}>
          {PRIO_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilterPrio(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 100,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: filterPrio === f ? '1.5px solid #4C9AFF' : '1.5px solid #E8EAED',
                background: filterPrio === f ? '#DEEBFF' : '#fff',
                color: filterPrio === f ? '#0052CC' : '#6B778C',
                transition: 'all 0.15s',
              }}
            >
              {f !== 'ALL' && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIO_DOT[f] }} />
              )}
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{
          display: 'flex', gap: 2,
          background: '#F4F5F7', border: '1.5px solid #E8EAED',
          borderRadius: 8, padding: 3,
        }}>
          {[
            { key: 'kanban', icon: <LayoutGrid size={14} />, label: 'Board' },
            { key: 'gantt',  icon: <GanttChart  size={14} />, label: 'Timeline' },
          ].map(v => (
            <button
              key={v.key}
              id={`btn-${v.key}-view`}
              onClick={() => setView(v.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 5, border: 'none',
                background: view === v.key ? '#fff' : 'transparent',
                color: view === v.key ? '#0052CC' : '#6B778C',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: view === v.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Create Task */}
        <button
          id="btn-create-task"
          onClick={() => setModal({ task: null, defaultStatus: 'TODO' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 15px', borderRadius: 8,
            background: '#0052CC', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#0747A6'}
          onMouseLeave={e => e.currentTarget.style.background = '#0052CC'}
        >
          <Plus size={15} /> Create Task
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 0,
        background: '#fff',
        borderBottom: '1px solid #F0F1F3',
        padding: '0 28px',
      }}>
        {[
          { val: total,  label: 'Total',       color: '#172B4D' },
          { val: todo,   label: 'To Do',       color: '#42526E' },
          { val: inProg, label: 'In Progress',  color: '#0052CC' },
          { val: done,   label: 'Done',         color: '#00875A' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '10px 20px 10px 0',
            marginRight: 20,
            display: 'flex', alignItems: 'baseline', gap: 5,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
            <span style={{ fontSize: 12, color: '#97A0AF', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
        {total > 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <div style={{ flex: 1, maxWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#00875A' }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: '#F4F5F7', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: 'linear-gradient(90deg, #0052CC, #36B37E)',
                  borderRadius: 100, transition: 'width 0.5s',
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main board area ──────────────────────────────── */}
      <div className="tf-page-body" style={{ background: '#F8F9FA', padding: '16px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, flexDirection: 'column' }}>
            <div className="tf-spinner" />
            <span style={{ fontSize: 13, color: '#97A0AF' }}>Loading tasks…</span>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={visibleTasks}
            onEdit={task => setModal({ task })}
            onDelete={task => setConfirmDel(task)}
            onAddTask={ds => setModal({ task: null, defaultStatus: ds })}
            onRefresh={load}
          />
        ) : (
          <GanttView
            tasks={visibleTasks}
            onEdit={task => setModal({ task })}
            onDelete={task => setConfirmDel(task)}
          />
        )}
      </div>

      {/* Task Modal */}
      {modal && (
        <TaskModal
          task={modal.task}
          projectId={selProject !== 'all' ? selProject : undefined}
          projects={projects}
          users={users}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F1F3' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#172B4D' }}>Delete Task</h3>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#42526E', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>"{confirmDel.title}"</strong>? This cannot be undone.
              </p>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F1F3', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDel(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #DFE1E6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#42526E', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleDeleteConfirm}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#FF5630', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
