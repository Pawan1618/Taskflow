import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createProject, updateProject } from '../services/api';
import { useToast } from '../context/ToastContext';

const EMPTY = { name: '', description: '', status: 'ACTIVE' };

export default function ProjectModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        name:        project.name || '',
        description: project.description || '',
        status:      project.status || 'ACTIVE',
      });
    } else {
      setForm(EMPTY);
    }
  }, [project]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Project name is required', 'error'); return; }
    setSaving(true);
    try {
      if (project?.id) {
        await updateProject(project.id, form);
        toast('Project updated', 'success');
      } else {
        await createProject(form);
        toast('Project created', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Error saving project', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tf-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tf-modal">
        <div className="tf-modal-header">
          <span className="tf-modal-title">{project?.id ? 'Edit Project' : 'Create Project'}</span>
          <button className="tf-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="tf-modal-body">
            <div className="tf-form-group">
              <label className="tf-label">Project Name *</label>
              <input
                className="tf-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Website Redesign"
                autoFocus
              />
            </div>
            <div className="tf-form-group">
              <label className="tf-label">Description</label>
              <textarea
                className="tf-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="What is this project about?"
              />
            </div>
            <div className="tf-form-group">
              <label className="tf-label">Status</label>
              <select className="tf-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="tf-modal-footer">
            <button type="button" className="tf-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="tf-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : project?.id ? 'Update' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
