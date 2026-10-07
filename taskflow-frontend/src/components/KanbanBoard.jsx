import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
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
const COL_IDS = COLS.map(c => c.id); // ['TODO', 'IN_PROGRESS', 'DONE']

// ── Sortable Task Card ───────────────────────────────────────────
function KanbanCard({ task, onEdit, onDelete }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Card placeholder stays in place but invisible while its ghost floats above
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? 'none' : undefined,
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
      {/* Priority left-bar */}
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

      {/* Hover actions — stopPropagation so clicks don't trigger drag */}
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

// ── Floating ghost shown in DragOverlay ─────────────────────────
function DragGhost({ task }) {
  return (
    <div
      className="kanban-card"
      style={{
        cursor: 'grabbing',
        transform: 'rotate(2.5deg) scale(1.04)',
        boxShadow: '0 20px 48px rgba(9,30,66,0.35), 0 4px 16px rgba(9,30,66,0.2)',
        border: '1.5px solid #0052CC',
        opacity: 1,
      }}
    >
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
        </div>
      </div>
    </div>
  );
}

// ── Droppable Column ─────────────────────────────────────────────
// Each column registers as a useDroppable zone (critical fix — was missing before).
// This makes the column body a valid drop target even when it has no cards.
function KanbanColumn({ col, tasks, onEdit, onDelete, onAddTask, isOver, isDragging }) {
  const { setNodeRef } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className="kanban-col"
      style={{
        outline: isOver && isDragging ? '2px dashed #0052CC' : '2px solid transparent',
        background: isOver && isDragging ? 'rgba(0,82,204,0.05)' : undefined,
        borderRadius: 4,
        transition: 'outline 0.15s, background 0.15s',
      }}
    >
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

        {/* "Drop here" indicator for empty columns being hovered */}
        {tasks.length === 0 && isOver && isDragging && (
          <div style={{
            height: 72,
            borderRadius: 4,
            border: '2px dashed #0052CC',
            background: 'rgba(0,82,204,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0052CC',
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'none',
          }}>
            Drop here
          </div>
        )}

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

  const [activeId, setActiveId]   = useState(null);
  const [overColId, setOverColId] = useState(null);

  // Per-column task lists stored locally so we can:
  //  • reorder cards within the same column instantly (no backend position field needed)
  //  • do optimistic cross-column moves before the API responds
  const [colItems, setColItems] = useState(() => {
    const m = {};
    COL_IDS.forEach(id => { m[id] = tasks.filter(t => t.status === id); });
    return m;
  });

  // Sync local state whenever the parent refreshes task data from the server
  useEffect(() => {
    const m = {};
    COL_IDS.forEach(id => { m[id] = tasks.filter(t => t.status === id); });
    setColItems(m);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Flatten all local items to find the active task for DragOverlay
  const allLocal = Object.values(colItems).flat();
  const activeTask = activeId ? allLocal.find(t => t.id === activeId) : null;

  // Given any droppable id (a column ID or a task/card ID), return the column ID.
  const resolveColId = useCallback((id) => {
    if (!id) return null;
    if (COL_IDS.includes(id)) return id;                             // it IS a column
    for (const [colId, list] of Object.entries(colItems)) {          // find by task
      if (list.some(t => t.id === id)) return colId;
    }
    return null;
  }, [colItems]);

  // ── Custom collision detection ────────────────────────────────
  // Strategy: check the pointer position against COLUMN containers first.
  // This reliably resolves the target column regardless of which column
  // the drag originates from (fixes IN_PROGRESS→DONE, TODO→DONE, etc.).
  // Falls back to rectIntersection for card-level (within-column) detection.
  const collisionDetection = useCallback((args) => {
    const pointerHits = pointerWithin(args);
    // Prefer any column container the pointer is directly inside
    const colHits = pointerHits.filter(({ id }) => COL_IDS.includes(id));
    if (colHits.length > 0) return colHits;
    // Fall back to rectangle-based detection (finds cards / column bodies)
    return rectIntersection(args);
  }, []);

  // ── Drag handlers ────────────────────────────────────────────

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setOverColId(null);
  };

  const handleDragOver = ({ over }) => {
    setOverColId(over ? resolveColId(over.id) : null);
  };

  const handleDragEnd = async ({ active, over }) => {
    const draggedId = activeId;
    setActiveId(null);
    setOverColId(null);

    // Dropped outside every droppable → cancel silently
    if (!over) return;

    const sourceColId = resolveColId(active.id);
    const targetColId = resolveColId(over.id);
    if (!sourceColId || !targetColId) return;

    // ── Same-column reorder (local only — no position field in DB) ──
    if (sourceColId === targetColId) {
      const list   = colItems[sourceColId] ?? [];
      const oldIdx = list.findIndex(t => t.id === draggedId);
      const newIdx = list.findIndex(t => t.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setColItems(prev => ({
          ...prev,
          [sourceColId]: arrayMove(prev[sourceColId], oldIdx, newIdx),
        }));
      }
      return;
    }

    // ── Cross-column move → validate one-way FSM rules ──
    const isValidTransition = (from, to) => {
      if (from === to) return true;
      if (from === 'TODO') return to === 'IN_PROGRESS' || to === 'DONE';
      if (from === 'IN_PROGRESS') return to === 'DONE';
      if (from === 'DONE') return false; // Terminal state - cannot move back
      return false;
    };

    if (!isValidTransition(sourceColId, targetColId)) {
      toast('Tasks can only move forward (To Do → In Progress → Done)', 'error');
      return;
    }

    const draggedTask = allLocal.find(t => t.id === draggedId);
    if (!draggedTask) return;

    // Optimistic update: move card in local state immediately so the UI
    // responds before the network round-trip completes.
    setColItems(prev => {
      const updatedTask = { ...draggedTask, status: targetColId };
      return {
        ...prev,
        [sourceColId]: prev[sourceColId].filter(t => t.id !== draggedId),
        [targetColId]: [...prev[targetColId], updatedTask],
      };
    });

    try {
      await updateTask(draggedTask.id, {
        title:       draggedTask.title,
        description: draggedTask.description,
        status:      targetColId,
        priority:    draggedTask.priority,
        dueDate:     draggedTask.dueDate || null,
      });
      const label = COLS.find(c => c.id === targetColId)?.label;
      toast(`Moved to "${label}"`, 'success');
      onRefresh(); // re-sync from server
    } catch {
      // Rollback optimistic move on API failure
      setColItems(prev => ({
        ...prev,
        [sourceColId]: [...prev[sourceColId], draggedTask],
        [targetColId]: prev[targetColId].filter(t => t.id !== draggedId),
      }));
      toast('Failed to update task — please try again', 'error');
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverColId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-board">
        {COLS.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={colItems[col.id] ?? []}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
            isOver={overColId === col.id}
            isDragging={!!activeId}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTask ? <DragGhost task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
