import React, { useMemo, useRef, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Pencil, Trash2, Calendar, Crosshair } from 'lucide-react';

dayjs.extend(isoWeek);

const LABEL_W = 240;   // px — frozen label column width
const COL_W   = 38;    // px — width of each day column
const ROW_H   = 44;    // px — row height

const PRIO_COLOR = { HIGH: '#FF5630', MEDIUM: '#0052CC', LOW: '#36B37E' };

function getDays(start, end) {
  const days = [];
  let cur = start.clone();
  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    days.push(cur);
    cur = cur.add(1, 'day');
  }
  return days;
}

function buildMonths(days) {
  const months = [];
  let cur = { label: days[0].format('MMMM YYYY'), count: 0 };
  days.forEach(d => {
    const label = d.format('MMMM YYYY');
    if (label === cur.label) {
      cur.count++;
    } else {
      months.push(cur);
      cur = { label, count: 1 };
    }
  });
  months.push(cur);
  return months;
}

export default function GanttView({ tasks, onEdit, onDelete }) {
  const today = useMemo(() => dayjs(), []);
  const scrollRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Date range: guaranteed at least 25 days before today to ensure 10 days previous are always available,
  // up to 60 days after, expanded if any task due date or start date extends beyond.
  const range = useMemo(() => {
    let minD = today.subtract(25, 'day');
    let maxD = today.add(60, 'day');
    tasks.forEach(t => {
      if (t.dueDate) {
        const d = dayjs(t.dueDate);
        if (d.isBefore(minD)) minD = d.subtract(7, 'day');
        if (d.isAfter(maxD))  maxD = d.add(7, 'day');
      }
      if (t.startDate) {
        const s = dayjs(t.startDate);
        if (s.isBefore(minD)) minD = s.subtract(7, 'day');
      }
    });
    return { start: minD, end: maxD };
  }, [tasks, today]);

  const days     = useMemo(() => getDays(range.start, range.end), [range]);
  const months   = useMemo(() => buildMonths(days), [days]);
  const totalW   = days.length * COL_W;
  const todayIdx = useMemo(() => days.findIndex(d => d.isSame(today, 'day')), [days, today]);

  // Center today in the timeline area while guaranteeing at least 10 previous days are visible
  const scrollToToday = (smooth = true) => {
    const container = scrollRef.current;
    if (!container || todayIdx < 0) return;
    const visibleWidth = Math.max(200, container.clientWidth - LABEL_W);
    const todayCenter = todayIdx * COL_W + COL_W / 2;
    const centerScroll = todayCenter - visibleWidth / 2;
    const maxScrollFor10Days = (todayIdx - 10) * COL_W;
    const target = Math.max(0, Math.min(centerScroll, maxScrollFor10Days));
    if (smooth) {
      container.scrollTo({ left: target, behavior: 'smooth' });
    } else {
      container.scrollLeft = target;
    }
  };

  // Initial scroll on mount: lands on near today date as center with 10 previous days shown
  useEffect(() => {
    if (todayIdx < 0) return;
    const timer = setTimeout(() => {
      scrollToToday(false);
    }, 60);
    return () => clearTimeout(timer);
  }, [todayIdx]);

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
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      border: '1px solid #DFE1E6', borderRadius: 6,
      overflow: 'hidden', background: '#fff',
      boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    }}>
      {/* Scrollable Container with horizontal & vertical scroll */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, minHeight: 0,
          overflowX: 'auto', overflowY: 'auto',
          scrollbarWidth: 'thin', scrollbarColor: '#C1C7D0 #F4F5F7',
        }}
      >
        {/* Inner layout table */}
        <div style={{ minWidth: LABEL_W + totalW, display: 'flex', flexDirection: 'column' }}>

          {/* ════ STICKY HEADER ════════════════════════════════════════ */}
          <div style={{ position: 'sticky', top: 0, zIndex: 25, display: 'flex', flexDirection: 'column', background: '#fff' }}>

            {/* Month band */}
            <div style={{ display: 'flex', background: '#0C2040' }}>
              {/* Top-left corner with "Today" quick-jump */}
              <div style={{
                position: 'sticky', left: 0, zIndex: 35,
                width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
                background: '#0C2040',
                borderRight: '1px solid #1a3a5c',
                borderBottom: '1px solid #1a3a5c',
                padding: '4px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8993A4', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Timeline
                </span>
                <button
                  onClick={() => scrollToToday(true)}
                  title="Center timeline on Today"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    padding: '2px 7px',
                    color: '#DEEBFF',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  <Crosshair size={10} />
                  Today
                </button>
              </div>

              {/* Month labels */}
              {months.map((m, i) => (
                <div key={i} style={{
                  width: m.count * COL_W, minWidth: m.count * COL_W,
                  padding: '6px 0', textAlign: 'center',
                  fontSize: 11, fontWeight: 700, color: '#B8D0EB',
                  borderRight: '1px solid #1a3a5c',
                  borderBottom: '1px solid #1a3a5c',
                  letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0,
                }}>{m.label}</div>
              ))}
            </div>

            {/* Day-number band */}
            <div style={{ display: 'flex', background: '#F4F5F7', borderBottom: '2px solid #DFE1E6' }}>
              {/* "Task" header corner */}
              <div style={{
                position: 'sticky', left: 0, zIndex: 35,
                width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
                background: '#F4F5F7',
                borderRight: '1px solid #DFE1E6',
                boxShadow: '3px 0 6px -1px rgba(9, 30, 66, 0.08)',
                height: ROW_H,
                display: 'flex', alignItems: 'center',
                padding: '0 14px',
                fontSize: 11, fontWeight: 700,
                color: '#5E6C84', textTransform: 'uppercase', letterSpacing: 0.6,
              }}>
                Tasks ({sortedTasks.length})
              </div>

              {/* Day cells */}
              {days.map((d, i) => {
                const isToday   = d.isSame(today, 'day');
                const isWeekend = d.day() === 0 || d.day() === 6;
                return (
                  <div key={i} style={{
                    width: COL_W, minWidth: COL_W, flexShrink: 0,
                    height: ROW_H,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    borderRight: '1px solid #EBECF0',
                    background: isToday ? '#E9F2FF' : isWeekend ? '#FAFBFC' : '#F4F5F7',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}>
                    {isToday ? (
                      <div style={{
                        background: '#0052CC',
                        color: '#fff',
                        borderRadius: 4,
                        padding: '1px 5px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        lineHeight: 1.1,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{d.format('D')}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{d.format('ddd')}</span>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 11, fontWeight: 500, color: isWeekend ? '#97A0AF' : '#172B4D' }}>
                          {d.format('D')}
                        </span>
                        <span style={{ fontSize: 9, color: '#97A0AF' }}>{d.format('ddd')}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* ════ END STICKY HEADER ════════════════════════════════════ */}

          {/* ════ TASK ROWS ════════════════════════════════════════════ */}
          {sortedTasks.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: 56, color: '#97A0AF',
            }}>
              <Calendar size={36} style={{ opacity: 0.25 }} />
              <span style={{ fontSize: 13 }}>No tasks to display</span>
            </div>
          ) : sortedTasks.map(task => {
            const due = task.dueDate ? dayjs(task.dueDate) : null;
            const isHovered = hoveredId === task.id;

            // Bar position: starts at startDate (or 1 day before due), ends on due date column
            let barLeft = null, barWidth = COL_W;
            if (due) {
              const dueIdx = days.findIndex(d => d.isSame(due, 'day'));
              if (dueIdx >= 0) {
                const startIdx = task.startDate
                  ? Math.max(0, days.findIndex(d => d.isSame(dayjs(task.startDate), 'day')))
                  : Math.max(0, dueIdx - 1);
                barLeft  = startIdx * COL_W + 2;
                barWidth = Math.max(COL_W - 4, (dueIdx - startIdx + 1) * COL_W - 4);
              }
            }

            const isOverdue = due && due.isBefore(today, 'day') && task.status !== 'DONE';
            const barColor  = isOverdue               ? '#FF5630'
                            : task.status === 'DONE'  ? '#00875A'
                            : PRIO_COLOR[task.priority] ?? '#0052CC';

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #EBECF0',
                  minHeight: ROW_H,
                  background: isHovered ? '#F8F9FA' : '#FFFFFF',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/*
                 * FROZEN LABEL CELL
                 * Uses 100% opaque backgroundColor so timeline elements never show through
                 * when scrolling horizontally.
                 */}
                <div style={{
                  position: 'sticky', left: 0, zIndex: 10,
                  width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
                  backgroundColor: isHovered ? '#F8F9FA' : '#FFFFFF',
                  borderRight: '1px solid #DFE1E6',
                  boxShadow: '3px 0 6px -1px rgba(9, 30, 66, 0.08)',
                  padding: '6px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: '#172B4D',
                }}>
                  {/* Priority dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: PRIO_COLOR[task.priority] ?? '#0052CC', flexShrink: 0,
                  }} />

                  {/* Task title */}
                  <span style={{
                    flex: 1, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }} title={task.title}>{task.title}</span>

                  {/* Action buttons */}
                  <button
                    className="tf-btn-ghost"
                    style={{ padding: '2px 5px', flexShrink: 0 }}
                    onClick={() => onEdit(task)} title="Edit"
                  ><Pencil size={12} /></button>
                  <button
                    className="tf-btn-ghost danger"
                    style={{ padding: '2px 5px', flexShrink: 0 }}
                    onClick={() => onDelete(task)} title="Delete"
                  ><Trash2 size={12} /></button>
                </div>

                {/* Timeline cell for this row */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  width: totalW, minWidth: totalW,
                  minHeight: ROW_H,
                  alignItems: 'center',
                }}>
                  {/* Column background stripes */}
                  {days.map((d, i) => {
                    const isWeekend  = d.day() === 0 || d.day() === 6;
                    const isTodayCol = d.isSame(today, 'day');
                    return (
                      <div key={i} style={{
                        width: COL_W, minWidth: COL_W, flexShrink: 0,
                        height: '100%', minHeight: ROW_H,
                        borderRight: '1px solid #F4F5F7',
                        background: isTodayCol ? '#E9F2FF'
                                  : isWeekend  ? '#FAFBFC'
                                  : 'transparent',
                      }} />
                    );
                  })}

                  {/* Today vertical guideline marker */}
                  {todayIdx >= 0 && (
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      left: todayIdx * COL_W + Math.floor(COL_W / 2),
                      width: 2, background: '#0052CC',
                      zIndex: 4, pointerEvents: 'none',
                      opacity: 0.75,
                    }} />
                  )}

                  {/* Task bar */}
                  {barLeft !== null ? (
                    <div
                      onClick={() => onEdit(task)}
                      title={`${task.title} — Due ${due.format('MMM D, YYYY')}`}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      style={{
                        position: 'absolute',
                        left: barLeft, width: barWidth,
                        height: 26, top: '50%', transform: 'translateY(-50%)',
                        background: barColor,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center',
                        paddingLeft: 8, paddingRight: 8,
                        fontSize: 11, fontWeight: 600, color: '#fff',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        cursor: 'pointer', zIndex: 5,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                        transition: 'filter 0.15s',
                      }}
                    >
                      {barWidth > 48 ? task.title : ''}
                    </div>
                  ) : (
                    /* No-due-date ghost chip */
                    <div
                      onClick={() => onEdit(task)}
                      style={{
                        position: 'absolute',
                        left: todayIdx >= 0 ? todayIdx * COL_W + 4 : 4,
                        top: '50%', transform: 'translateY(-50%)',
                        background: '#FFFFFF', border: '1px dashed #C1C7D0',
                        borderRadius: 3, padding: '3px 8px',
                        fontSize: 11, color: '#6B778C',
                        whiteSpace: 'nowrap', cursor: 'pointer', zIndex: 5,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >No due date</div>
                  )}

                  {/* Done checkmark badge */}
                  {task.status === 'DONE' && barLeft !== null && (
                    <div style={{
                      position: 'absolute',
                      left: barLeft + barWidth + 6,
                      top: '50%', transform: 'translateY(-50%)',
                      fontSize: 12, color: '#00875A', fontWeight: 800, zIndex: 5,
                    }}>✓</div>
                  )}
                </div>
              </div>
            );
          })}
          {/* ════ END TASK ROWS ════════════════════════════════════════ */}

        </div>
      </div>
    </div>
  );
}