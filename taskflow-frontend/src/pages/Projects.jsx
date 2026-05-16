import React, { useEffect, useState } from 'react';
import { getProjects, deleteProject } from '../services/api';
import { useToast } from '../context/ToastContext';
import ProjectModal from '../components/ProjectModal';
import { Plus, FolderOpen, Pencil, Trash2, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_BADGE = {
  ACTIVE:    'active',
  COMPLETED: 'completed',
  ARCHIVED:  'archived',
};

const PROJECT_COLORS = [
  '#0052CC','#00875A','#FF5630','#6554C0','#FF8B00','#00B8D9',
];

function avatarColor(name = '') {
  return PROJECT_COLORS[name.charCodeAt(0) % PROJECT_COLORS.length];
}

export default function Projects() {
  const toast = useToast();
  const navigate = useNavigate();
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);  // null | project obj
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const load = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      toast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = filterStatus === 'ALL'
    ? projects
    : projects.filter(p => p.status === filterStatus);

  const handleDelete = async () => {
    try {
      await deleteProject(confirmDel.id);
      toast('Project deleted', 'success');
      setConfirmDel(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="tf-page-header">
        <h1 className="tf-page-title">Projects</h1>

        {/* Status filter chips */}
        <div className="tf-filter-bar">
          {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map(s => (
            <button
              key={s}
              className={`tf-chip ${filterStatus === s ? 'active-chip' : 'inactive'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          id="btn-create-project"
          className="tf-btn-primary"
          onClick={() => setModal({})}
        >
          <Plus size={14} />
          Create Project
        </button>
      </div>

      <div className="tf-page-body">
        {loading ? (
          <div className="tf-loading"><div className="tf-spinner" /><span>Loading projects…</span></div>
        ) : visible.length === 0 ? (
          <div className="tf-empty" style={{ marginTop: 60 }}>
            <FolderOpen size={48} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>No projects yet</p>
            <button className="tf-btn-primary" style={{ marginTop: 12 }} onClick={() => setModal({})}>
              <Plus size={13} /> Create your first project
            </button>
          </div>
        ) : (
          <div className="tf-project-grid">
            {visible.map(p => (
              <div
                key={p.id}
                className="tf-project-card"
                onClick={() => navigate('/tasks', { state: { projectId: String(p.id) } })}
              >
                {/* Avatar */}
                <div className="tf-project-avatar" style={{ background: avatarColor(p.name) }}>
                  {p.name?.charAt(0).toUpperCase()}
                </div>

                {/* Name & status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', lineHeight: 1.3 }}>
                    {p.name}
                  </h3>
                  <span className={`tf-badge ${STATUS_BADGE[p.status] || 'inactive'}`} style={{ flexShrink: 0 }}>
                    {p.status}
                  </span>
                </div>

                {/* Description */}
                {p.description && (
                  <p style={{
                    fontSize: 12.5, color: '#6B778C', lineHeight: 1.5,
                    marginBottom: 12, display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {p.description}
                  </p>
                )}

                <hr className="tf-divider" />

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckSquare size={12} style={{ color: '#97A0AF' }} />
                  <span style={{ fontSize: 11, color: '#97A0AF', flex: 1 }}>
                    Created {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </span>

                  {/* Actions */}
                  <button
                    className="tf-btn-ghost"
                    style={{ padding: '3px 6px' }}
                    onClick={e => { e.stopPropagation(); setModal(p); }}
                    title="Edit project"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="tf-btn-ghost danger"
                    style={{ padding: '3px 6px' }}
                    onClick={e => { e.stopPropagation(); setConfirmDel(p); }}
                    title="Delete project"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    className="tf-btn-ghost"
                    style={{ padding: '3px 6px', color: '#0052CC' }}
                    onClick={e => { e.stopPropagation(); navigate('/tasks', { state: { projectId: String(p.id) } }); }}
                    title="Open board"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal !== null && (
        <ProjectModal
          project={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div className="tf-modal-overlay">
          <div className="tf-modal" style={{ width: 380 }}>
            <div className="tf-modal-header">
              <span className="tf-modal-title">Delete Project</span>
            </div>
            <div className="tf-modal-body">
              <p style={{ color: '#42526E', fontSize: 14 }}>
                Delete <strong>"{confirmDel.name}"</strong>? All tasks in this project will also be deleted. This cannot be undone.
              </p>
            </div>
            <div className="tf-modal-footer">
              <button className="tf-btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button
                className="tf-btn-primary"
                style={{ background: '#FF5630' }}
                onClick={handleDelete}
              >
                <Trash2 size={13} /> Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
