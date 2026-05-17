import React, { useEffect, useState } from 'react';
import { getTasks, getProjects, deleteTask } from '../services/api';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import GanttView   from '../components/GanttView';
import TaskModal   from '../components/TaskModal';
import { Plus, Columns, GanttChart, ChevronDown, Trash2 } from 'lucide-react';
import { getUsers } from '../services/api';

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export default function Tasks() {
  const toast = useToast();

  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [view,      setView]      = useState('kanban'); // 'kanban' | 'gantt'
  const [selProject, setSelProject] = useState('all');
  const [filterPrio, setFilterPrio] = useState('ALL');

  const [modal,      setModal]      = useState(null);  // null | { task?, defaultStatus? }
  const [confirmDel, setConfirmDel] = useState(null);  // task to delete

  const load = async () => {
    try {
      const [tRes, pRes, uRes] = await Promise.all([
        getTasks(), getProjects(), getUsers(),
      ]);
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

  // ── Filtering ──────────────────────────────────────────────────
  const visibleTasks = tasks.filter(t => {
    if (selProject !== 'all' && String(t.project?.id) !== selProject) return false;
    if (filterPrio  !== 'ALL' && t.priority !== filterPrio)            return false;
    return true;
  });

  // ── Delete confirm ─────────────────────────────────────────────
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

  // ── Stats for mini header ──────────────────────────────────────
  const total  = visibleTasks.length;
  const done   = visibleTasks.filter(t => t.status === 'DONE').length;
  const inProg = visibleTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo   = visibleTasks.filter(t => t.status === 'TODO').length;

  return (
    <>
      {/* Page header */}
      <div className="tf-page-header">
        <h1 className="tf-page-title">Board</h1>

        {/* Project filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          <select
            className="tf-select"
            style={{ minWidth: 160, padding: '5px 10px' }}
            value={selProject}
            onChange={e => setSelProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Priority filter chips */}
        <div className="tf-filter-bar">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              className={`tf-chip ${filterPrio === p ? 'active-chip' : 'inactive'}`}
              onClick={() => setFilterPrio(p)}
            >
              {p === 'ALL' ? 'All Priorities' : p}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View Toggle */}
        <div className="tf-view-toggle">
          <button
            id="btn-kanban-view"
            className={`tf-view-btn${view === 'kanban' ? ' active' : ''}`}
            onClick={() => setView('kanban')}
            title="Kanban Board"
          >
            <Columns size={14} />
            Board
          </button>
          <button
            id="btn-gantt-view"
            className={`tf-view-btn${view === 'gantt' ? ' active' : ''}`}
            onClick={() => setView('gantt')}
            title="Timeline / Gantt"
          >
            <GanttChart size={14} />
            Timeline
          </button>
        </div>

        <button
          id="btn-create-task"
          className="tf-btn-primary"
          onClick={() => setModal({ task: null, defaultStatus: 'TODO' })}
        >
          <Plus size={14} />
          Create Task
        </button>
      </div>

      {/* Mini stats strip */}
      <div style={{
        display: 'flex', gap: 20, padding: '8px 24px',
        fontSize: 12, color: '#6B778C', alignItems: 'center',
        borderBottom: '1px solid #DFE1E6', background: '#fff',
        flexWrap: 'wrap',
      }}>
        <span><strong style={{ color: '#172B4D' }}>{total}</strong> tasks</span>
        <span style={{ color: '#DFE1E6' }}>|</span>
        <span><strong style={{ color: '#42526E' }}>{todo}</strong> To Do</span>
        <span><strong style={{ color: '#0052CC' }}>{inProg}</strong> In Progress</span>
        <span><strong style={{ color: '#00875A' }}>{done}</strong> Done</span>
        {total > 0 && (
          <div style={{ flex: 1, maxWidth: 200 }}>
            <div style={{ height: 4, background: '#DFE1E6', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(done / total) * 100}%`,
                background: '#00875A', transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="tf-page-body">
        {loading ? (
          <div className="tf-loading"><div className="tf-spinner" /><span>Loading tasks…</span></div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={visibleTasks}
            onEdit={task => setModal({ task })}
            onDelete={task => setConfirmDel(task)}
            onAddTask={defaultStatus => setModal({ task: null, defaultStatus })}
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

      {/* Delete Confirm */}
      {confirmDel && (
        <div className="tf-modal-overlay">
          <div className="tf-modal" style={{ width: 380 }}>
            <div className="tf-modal-header">
              <span className="tf-modal-title">Delete Task</span>
            </div>
            <div className="tf-modal-body">
              <p style={{ color: '#42526E', fontSize: 14 }}>
                Are you sure you want to delete <strong>"{confirmDel.title}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="tf-modal-footer">
              <button className="tf-btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button
                className="tf-btn-primary"
                style={{ background: '#FF5630' }}
                onClick={handleDeleteConfirm}
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
