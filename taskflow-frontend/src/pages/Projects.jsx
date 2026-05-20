import React, { useEffect, useState } from 'react';
import { getProjects, deleteProject } from '../services/api';
import { useToast } from '../context/ToastContext';
import ProjectModal from '../components/ProjectModal';
import { Plus, FolderOpen, Pencil, Trash2, ArrowRight, CheckSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROJECT_COLORS = ['#0052CC','#00875A','#FF5630','#6554C0','#FF8B00','#00B8D9'];
const avatarColor = (name = '') => PROJECT_COLORS[name.charCodeAt(0) % PROJECT_COLORS.length];

const STATUS_CONFIG = {
  ACTIVE:    { bg: '#E3FCEF', color: '#006644', label: 'Active' },
  COMPLETED: { bg: '#EAE6FF', color: '#403294', label: 'Completed' },
  ARCHIVED:  { bg: '#F4F5F7', color: '#42526E', label: 'Archived' },
};

const FILTERS = ['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'];

export default function Projects() {
  const toast    = useToast();
  const navigate = useNavigate();
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const load = async () => {
    try { const r = await getProjects(); setProjects(r.data); }
    catch { toast('Failed to load projects', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = filterStatus === 'ALL' ? projects : projects.filter(p => p.status === filterStatus);

  const handleDelete = async () => {
    try {
      await deleteProject(confirmDel.id);
      toast('Project deleted', 'success');
      setConfirmDel(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  return (
    <>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        padding: '22px 28px 18px',
        background: '#fff',
        borderBottom: '1px solid #F0F1F3',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.3px' }}>Projects</h1>
          <p style={{ fontSize: 13, color: '#97A0AF', marginTop: 2 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '5px 13px', borderRadius: 100,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: filterStatus === s ? '1.5px solid #4C9AFF' : '1.5px solid #E8EAED',
                background: filterStatus === s ? '#DEEBFF' : '#fff',
                color: filterStatus === s ? '#0052CC' : '#6B778C',
                transition: 'all 0.15s',
              }}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button
          id="btn-create-project"
          onClick={() => setModal({})}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 8,
            background: '#0052CC', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.15s',
            boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#0747A6'}
          onMouseLeave={e => e.currentTarget.style.background = '#0052CC'}
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div style={{ padding: '24px 28px', flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, padding: 60, flexDirection: 'column' }}>
            <div className="tf-spinner" />
            <span style={{ fontSize: 13, color: '#97A0AF' }}>Loading projects…</span>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={34} color="#C1C7D0" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', margin: 0 }}>No projects yet</p>
            <p style={{ fontSize: 13, color: '#97A0AF', margin: 0 }}>Create your first project to get started</p>
            <button
              onClick={() => setModal({})}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
                padding: '10px 20px', borderRadius: 8,
                background: '#0052CC', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Create Project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {visible.map(p => {
              const sc  = STATUS_CONFIG[p.status] || STATUS_CONFIG.ACTIVE;
              const col = avatarColor(p.name);
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  sc={sc}
                  col={col}
                  onOpen={() => navigate('/tasks', { state: { projectId: String(p.id) } })}
                  onEdit={e => { e.stopPropagation(); setModal(p); }}
                  onDelete={e => { e.stopPropagation(); setConfirmDel(p); }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal !== null && (
        <ProjectModal project={modal?.id ? modal : null} onClose={() => setModal(null)} onSaved={load} />
      )}

      {confirmDel && (
        <DeleteModal
          title="Delete Project"
          message={<>Delete <strong>"{confirmDel.name}"</strong>? All tasks will be deleted. This cannot be undone.</>}
          onCancel={() => setConfirmDel(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

function ProjectCard({ project: p, sc, col, onOpen, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hov ? col + '55' : '#E8EAED'}`,
        borderRadius: 14,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hov ? `0 6px 24px ${col}18` : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top color accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: col, borderRadius: '14px 14px 0 0' }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, marginTop: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: col, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800,
        }}>
          {p.name?.charAt(0).toUpperCase()}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: sc.bg, color: sc.color,
          padding: '3px 10px', borderRadius: 100,
        }}>
          {sc.label}
        </span>
      </div>

      {/* Name */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#172B4D', marginBottom: 6, lineHeight: 1.3 }}>{p.name}</h3>

      {/* Description */}
      {p.description && (
        <p style={{
          fontSize: 12.5, color: '#6B778C', lineHeight: 1.55,
          marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.description}
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #F4F5F7', marginTop: p.description ? 0 : 12,
      }}>
        <Calendar size={11} color="#97A0AF" style={{ marginRight: 4 }} />
        <span style={{ fontSize: 11, color: '#97A0AF', flex: 1 }}>
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <ActionBtn icon={<Pencil size={12} />} onClick={onEdit} color="#6B778C" hoverBg="#F4F5F7" />
          <ActionBtn icon={<Trash2 size={12} />} onClick={onDelete} color="#FF5630" hoverBg="#FFEBE6" />
          <ActionBtn icon={<ArrowRight size={12} />} onClick={onOpen} color={col} hoverBg={col + '20'} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, onClick, color, hoverBg }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov ? hoverBg : 'transparent',
        border: 'none', cursor: 'pointer',
        color, transition: 'background 0.15s',
      }}
    >
      {icon}
    </button>
  );
}

function DeleteModal({ title, message, onCancel, onConfirm }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(9,30,66,0.54)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: 400, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F1F3' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#172B4D' }}>{title}</h3>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ color: '#42526E', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{message}</p>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F1F3', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #DFE1E6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#42526E', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#FF5630', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
