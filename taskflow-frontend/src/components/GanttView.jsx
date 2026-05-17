import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Pencil, Trash2, Calendar } from 'lucide-react';

dayjs.extend(isoWeek);

const PRIO_COLOR = { HIGH: '#FF5630', MEDIUM: '#0052CC', LOW: '#36B37E' };
const COL_W = 36; // px per day

function getDays(start, end) {
  const days = [];
  let cur = start.clone();
  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    days.push(cur);
    cur = cur.add(1, 'day');
  }
  return days;
}

// ── Month header spanning above days ─────────────────────────────
function MonthHeaders({ days }) {
  const months = [];
  let cur = { label: days[0].format('MMM YYYY'), count: 0 };
  days.forEach(d => {
    const label = d.format('MMM YYYY');
    if (label === cur.label) { cur.count++; }
    else { months.push(cur); cur = { label, count: 1 }; }
  });
  months.push(cur);

  return (
    <div style={{ display: 'flex', background: '#0C2040', borderBottom: '1px solid #1a3a5c' }}>
      <div style={{ width: 220, minWidth: 220, borderRight: '1px solid #1a3a5c', flexShrink: 0 }} />
      {months.map((m, i) => (
        <div key={i} style={{
          width: m.count * COL_W,
          minWidth: m.count * COL_W,
          padding: '6px 0',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#B8D0EB',
          borderRight: '1px solid #1a3a5c',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {m.label}
        </div>
      ))}
    </div>
  );
}

export default function GanttView({ tasks, onEdit, onDelete }) {
  const today = dayjs();

  // Determine date range — 60 days centred around today,
  // extended to cover any task due dates
  const range = useMemo(() => {
    let minD = today.subtract(7, 'day');
    let maxD = today.add(53, 'day');
    tasks.forEach(t => {
      if (t.dueDate) {
        const d = dayjs(t.dueDate);
        if (d.isBefore(minD)) minD = d.subtract(2, 'day');
        if (d.isAfter(maxD))  maxD = d.add(2, 'day');
      }
    });
    return { start: minD, end: maxD };
  }, [tasks, today]);

  const days = useMemo(() => getDays(range.start, range.end), [range]);
  const totalWidth = days.length * COL_W;
  const todayIdx = days.findIndex(d => d.isSame(today, 'day'));

  // Sort tasks: those with due dates first, then by priority
  const sortedTasks = useMemo(() => {
    const prioOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...tasks].sort((a, b) => {
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) return dayjs(a.dueDate).diff(dayjs(b.dueDate));
      return prioOrder[a.priority] - prioOrder[b.priority];
    });
  }, [tasks]);

  return (
    <div className="gantt-wrapper">
      {/* Month header */}
      <MonthHeaders days={days} />

      {/* Days header */}
      <div className="gantt-header-row">
        <div className="gantt-label-col">Task</div>
        <div style={{ overflowX: 'hidden', flex: 1 }}>
          <div className="gantt-days-header" style={{ width: totalWidth }}>
            {days.map((d, i) => {
              const isToday   = d.isSame(today, 'day');
              const isWeekend = d.day() === 0 || d.day() === 6;
              return (
                <div
                  key={i}
                  className={`gantt-day-cell${isToday ? ' today' : ''}${isWeekend ? ' weekend' : ''}`}
                >
                  <div style={{ fontWeight: isToday ? 700 : 400 }}>{d.format('D')}</div>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>{d.format('ddd')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="gantt-rows">
        {sortedTasks.length === 0 && (
          <div className="tf-empty" style={{ padding: 40 }}>
            <Calendar size={32} style={{ opacity: 0.3 }} />
            <span>No tasks to display</span>
          </div>
        )}
        {sortedTasks.map(task => {
          const due = task.dueDate ? dayjs(task.dueDate) : null;

          // Bar: spans from (due - 1 day) to due, OR spans 1 day on due date
          let barLeft = null, barWidth = COL_W;
          if (due) {
            const dueDayIdx = days.findIndex(d => d.isSame(due, 'day'));
            if (dueDayIdx >= 0) {
              const startIdx = Math.max(0, dueDayIdx - 1);
              barLeft = startIdx * COL_W;
              barWidth = (dueDayIdx - startIdx + 1) * COL_W - 2;
            }
          }

          const isOverdue = due && due.isBefore(today, 'day') && task.status !== 'DONE';

          return (
            <div key={task.id} className="gantt-row">
              {/* Label */}
              <div className="gantt-row-label">
                <div className="prio-dot" style={{ background: PRIO_COLOR[task.priority] }} />
                <span className="gantt-row-label-text" title={task.title}>{task.title}</span>
                <button
                  className="tf-btn-ghost"
                  style={{ padding: '1px 4px', flexShrink: 0 }}
                  onClick={() => onEdit(task)}
                  title="Edit"
                >
                  <Pencil size={11} />
                </button>
                <button
                  className="tf-btn-ghost danger"
                  style={{ padding: '1px 4px', flexShrink: 0 }}
                  onClick={() => onDelete(task)}
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {/* Timeline grid */}
              <div className="gantt-row-grid" style={{ overflow: 'hidden' }}>
                {/* Grid cells */}
                <div style={{ display: 'flex', width: totalWidth, position: 'absolute', top: 0, bottom: 0, left: 0 }}>
                  {days.map((d, i) => {
                    const isWeekend = d.day() === 0 || d.day() === 6;
                    const isTodayCol = d.isSame(today, 'day');
                    return (
                      <div
                        key={i}
                        style={{
                          width: COL_W, minWidth: COL_W,
                          borderRight: '1px solid #F4F5F7',
                          height: '100%',
                          background: isTodayCol ? '#E9F2FF' : isWeekend ? '#FAFBFC' : 'transparent',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Today line */}
                {todayIdx >= 0 && (
                  <div
                    className="gantt-today-line"
                    style={{ left: todayIdx * COL_W + COL_W / 2 }}
                  />
                )}

                {/* Task bar */}
                {barLeft !== null ? (
                  <div
                    className={`gantt-bar ${task.priority}`}
                    style={{
                      left: barLeft,
                      width: barWidth,
                      background: isOverdue
                        ? '#FF5630'
                        : task.status === 'DONE'
                          ? '#00875A'
                          : PRIO_COLOR[task.priority],
                    }}
                    title={`${task.title} — Due ${due.format('MMM D')}`}
                    onClick={() => onEdit(task)}
                  >
                    {barWidth > 50 ? task.title : ''}
                  </div>
                ) : (
                  // No due date — show a floating chip
                  <div style={{
                    position: 'absolute',
                    left: todayIdx >= 0 ? todayIdx * COL_W : 0,
                    top: '50%', transform: 'translateY(-50%)',
                    background: '#F4F5F7',
                    border: '1px dashed #DFE1E6',
                    borderRadius: 3,
                    padding: '3px 8px',
                    fontSize: 11,
                    color: '#97A0AF',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }} onClick={() => onEdit(task)}>
                    No due date
                  </div>
                )}

                {/* Status badge overlay on bar */}
                {task.status === 'DONE' && barLeft !== null && (
                  <div style={{
                    position: 'absolute',
                    left: barLeft + barWidth + 4,
                    top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, color: '#00875A', fontWeight: 700,
                  }}>✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
