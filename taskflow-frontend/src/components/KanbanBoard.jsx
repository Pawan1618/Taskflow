import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { updateTask } from '../services/api';
import { useToast } from '../context/ToastContext';

// ── Priority colours ─────────────────────────────────────────────
const PRIO_COLOR = { HIGH: '#FF5630', MEDIUM: '#0052CC', LOW: '#36B37E' };

// ── Column config ────────────────────────────────────────────────
const COLS = [
  { id: 'TODO',        label: 'To Do',       cls: 'todo'   },
  { id: 'IN_PROGRESS', label: 'In Progress',  cls: 'inprog' },
  { id: 'DONE',        label: 'Done',         cls: 'done'   },
];

// ── Sortable Task Card ───────────────────────────────────────────
function KanbanCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const today = dayjs();
  const due = task.dueDate ? dayjs(task.dueDate) : null;
  const isOverdue = due && due.isBefore(today, 'day') && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
    >
      {/* Priority bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3,
        height: '100%', background: PRIO_COLOR[task.priority] || '#DFE1E6',
        borderRadius: '4px 0 0 4px',
      }} />
      <div style={{ paddingLeft: 8 }}>
        <div className="kanban-card-title">{task.title}</div>
        <div className="kanban-card-meta">
          <div className="prio-dot" style={{ background: PRIO_COLOR[task.priority] }} />
          <span style={{ fontSize: 11, color: '#97A0AF', fontWeight: 500 }}>
            {task.priority}
          </span>
          {task.assignedTo && (
            <div style={{
              marginLeft: 'auto', width: 22, height: 22,
              background: '#0052CC', borderRadius: '50%',
              color: '#fff', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title={task.assignedTo.name}>
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {due && (
          <div className={`card-due${isOverdue ? ' overdue' : ''}`} style={{ marginTop: 6 }}>
            <Calendar size={10} />
            {due.format('MMM D')}
            {isOverdue && ' (overdue)'}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="kanban-card-actions">
        <button
          className="tf-btn-ghost"
          style={{ padding: '2px 4px' }}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onEdit(task); }}
          title="Edit"
        >
          <Pencil size={12} />
        </button>
        <button
          className="tf-btn-ghost danger"
          style={{ padding: '2px 4px' }}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(task); }}
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Droppable Column ─────────────────────────────────────────────
function KanbanColumn({ col, tasks, onEdit, onDelete, onAddTask }) {
  return (
    <div className="kanban-col">
      <div className={`kanban-col-header ${col.cls}`}>
        <span className="kanban-col-title">{col.label}</span>
        <span className="kanban-col-count">{tasks.length}</span>
      </div>
      <div className="kanban-col-body">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        <button className="kanban-add-card" onClick={() => onAddTask(col.id)}>
          <Plus size={14} />
          Add task
        </button>
      </div>
    </div>
  );
}

// ── Main KanbanBoard ─────────────────────────────────────────────
export default function KanbanBoard({ tasks, onEdit, onDelete, onAddTask, onRefresh }) {
  const toast = useToast();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByCol = (status) => tasks.filter(t => t.status === status);
  const activeTask = tasks.find(t => t.id === activeId);

  const findColOfTask = (id) => {
    return COLS.find(c => tasks.find(t => t.id === id)?.status === c.id)?.id || null;
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const draggedTask = tasks.find(t => t.id === active.id);
    if (!draggedTask) return;

    // Determine target column
    let targetStatus = null;
    if (COLS.find(c => c.id === over.id)) {
      targetStatus = over.id;
    } else {
      targetStatus = tasks.find(t => t.id === over.id)?.status;
    }

    if (!targetStatus || targetStatus === draggedTask.status) return;

    try {
      await updateTask(draggedTask.id, {
        title:       draggedTask.title,
        description: draggedTask.description,
        status:      targetStatus,
        priority:    draggedTask.priority,
        dueDate:     draggedTask.dueDate || null,
      });
      toast(`Moved to ${COLS.find(c => c.id === targetStatus)?.label}`, 'success');
      onRefresh();
    } catch {
      toast('Failed to update task', 'error');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="kanban-board">
        {COLS.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={tasksByCol(col.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="kanban-card" style={{ transform: 'rotate(2deg)', boxShadow: '0 8px 24px rgba(9,30,66,0.25)' }}>
            <div className="kanban-card-title">{activeTask.title}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
