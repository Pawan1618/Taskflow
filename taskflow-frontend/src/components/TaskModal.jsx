import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createTask, updateTask } from '../services/api';
import { useToast } from '../context/ToastContext';

const EMPTY = {
  title: '', description: '', status: 'TODO',
  priority: 'MEDIUM', dueDate: '',
};

export default function TaskModal({ task, projectId, projects, users, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [assignedToId, setAssignedToId] = useState('');
  const [selProjectId, setSelProjectId] = useState(projectId || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || '',
        description: task.description || '',
        status:      task.status || 'TODO',
        priority:    task.priority || 'MEDIUM',
        dueDate:     task.dueDate || '',
      });
      setAssignedToId(task.assignedTo?.id || '');
      setSelProjectId(task.project?.id || projectId || '');
    } else {
      setForm(EMPTY);
      setSelProjectId(projectId || '');
    }
  }, [task, projectId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Task title is required', 'error'); return; }
    if (!selProjectId)      { toast('Please select a project', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        status:      form.status,
        priority:    form.priority,
        dueDate:     form.dueDate || null,
      };
      if (task?.id) {
        await updateTask(task.id, payload);
        toast('Task updated', 'success');
      } else {
        await createTask(payload, selProjectId, assignedToId || null);
        toast('Task created', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Error saving task', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tf-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tf-modal">
        <div className="tf-modal-header">
          <span className="tf-modal-title">{task?.id ? 'Edit Task' : 'Create Task'}</span>
          <button className="tf-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tf-modal-body">

            <div className="tf-form-group">
              <label className="tf-label">Title *</label>
              <input
                className="tf-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            <div className="tf-form-group">
              <label className="tf-label">Description</label>
              <textarea
                className="tf-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Add more details…"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="tf-form-group">
                <label className="tf-label">Status</label>
                <select className="tf-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="tf-form-group">
                <label className="tf-label">Priority</label>
                <select className="tf-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="tf-form-group">
                <label className="tf-label">Project *</label>
                <select
                  className="tf-select"
                  value={selProjectId}
                  onChange={e => setSelProjectId(e.target.value)}
                  disabled={!!projectId}
                >
                  <option value="">Select project…</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="tf-form-group">
                <label className="tf-label">Assigned To</label>
                <select
                  className="tf-select"
                  value={assignedToId}
                  onChange={e => setAssignedToId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tf-form-group">
              <label className="tf-label">Due Date</label>
              <input
                type="date"
                className="tf-input"
                value={form.dueDate || ''}
                onChange={e => set('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="tf-modal-footer">
            <button type="button" className="tf-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="tf-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : task?.id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
