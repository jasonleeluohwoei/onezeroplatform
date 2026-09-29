import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, AlertCircle, Plus, Pencil, Trash2, List, LayoutGrid, TrendingUp } from 'lucide-react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { TASKS } from '../data/schema';
import { BoardView } from '../components/EntityPage';
import { Avatar, Badge, Btn, Card, Confirm, Empty, Modal, SearchBox, Segmented, cx } from '../components/ui';
import { StatsStrip } from '../components/StatsStrip';
import { FieldControl, labelCls } from '../components/form';
import { RenderValue } from '../components/render';
import { addDays, daysUntil, fmtDate, fmtDateShort, todayISO, toDate } from '../lib/format';

const RANGES = [
  { value: 'day', label: 'daily' },
  { value: 'week', label: 'weekly' },
  { value: 'month', label: 'monthly' },
  { value: 'all', label: 'all' },
];

export default function Timeline() {
  const { db, upsert, remove, toast } = useData();
  const { t, tf, lang } = useI18n();
  const today = todayISO();

  const [range, setRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');
  const [anchor, setAnchor] = useState(today);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const all = db.tasks;

  const inRange = useMemo(() => {
    const a = toDate(anchor)!;
    let start: string, end: string;
    if (range === 'day') {
      start = end = anchor;
    } else if (range === 'week') {
      const day = a.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start = addDays(anchor, diff);
      end = addDays(anchor, diff + 6);
    } else if (range === 'month') {
      start = new Date(a.getFullYear(), a.getMonth(), 1).toISOString().slice(0, 10);
      end = new Date(a.getFullYear(), a.getMonth() + 1, 0).toISOString().slice(0, 10);
    } else {
      return all;
    }
    return all.filter((x) => x.dueDate && x.dueDate >= start && x.dueDate <= end);
  }, [all, range, anchor]);

  const filtered = useMemo(() => {
    let out = inRange;
    if (selectedDay) out = out.filter((x) => x.dueDate === selectedDay);
    if (q.trim()) {
      const n = q.toLowerCase();
      out = out.filter((x) => [x.title, x.stage, x.description].join(' ').toLowerCase().includes(n));
    }
    return out;
  }, [inRange, selectedDay, q]);

  const stats = useMemo(() => {
    const open = all.filter((x) => x.status !== 'Done');
    const done = all.filter((x) => x.status === 'Done');
    const overdue = open.filter((x) => (daysUntil(x.dueDate) ?? 0) < 0);
    const week = open.filter((x) => {
      const d = daysUntil(x.dueDate);
      return d !== null && d >= 0 && d <= 7;
    });
    return [
      { label: t('timeline.open'), value: open.length, tone: 'blue' as const, icon: Clock },
      { label: t('timeline.completed'), value: done.length, tone: 'green' as const, icon: CheckCircle2 },
      { label: t('timeline.overdueTasks'), value: overdue.length, tone: 'red' as const, icon: AlertCircle },
      { label: t('timeline.dueThisWeek'), value: week.length, tone: 'amber' as const, icon: CalendarDays },
      {
        label: t('timeline.completionRate'),
        value: `${all.length ? Math.round((done.length / all.length) * 100) : 0}%`,
        tone: 'purple' as const,
        icon: TrendingUp,
      },
    ];
  }, [all, t]);

  const openNew = (due?: string) => {
    const blank: any = {};
    TASKS.fields.forEach((f) => {
      blank[f.key] =
        f.type === 'tags' || f.type === 'multiselect' || f.type === 'refmulti' || f.type === 'sublist'
          ? []
          : f.type === 'number' || f.type === 'currency' || f.type === 'percent'
          ? 0
          : '';
    });
    blank.dueDate = due || today;
    blank.status = 'Todo';
    blank.priority = 'Medium';
    setEditing(blank);
    setOpen(true);
  };

  const save = () => {
    upsert('tasks', editing);
    setOpen(false);
    toast(t('common.saved'));
  };

  const toggleDone = (task: any) => {
    const done = task.status === 'Done';
    upsert('tasks', {
      ...task,
      status: done ? 'In Progress' : 'Done',
      completionDate: done ? '' : todayISO(),
    });
  };

  const clientName = (id: string) => db.clients.find((c) => c.id === id)?.name || '—';
  const staffName = (id: string) => db.staff.find((s) => s.id === id)?.name || '—';

  /* ------------------------------ calendar data ----------------------------- */
  const days = useMemo(() => {
    const y = cursor.getFullYear();
    const mo = cursor.getMonth();
    const first = new Date(y, mo, 1);
    const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday start
    const total = new Date(y, mo + 1, 0).getDate();
    const cells: { date: string; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: '', inMonth: false });
    for (let d = 1; d <= total; d++) {
      cells.push({ date: `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, inMonth: true });
    }
    return cells;
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    db.tasks.forEach((x) => {
      if (!x.dueDate) return;
      map[x.dueDate] = map[x.dueDate] || [];
      map[x.dueDate].push(x);
    });
    return map;
  }, [db.tasks]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">{t('timeline.title')}</h1>
          <p className="text-[13.5px] text-ink-500 mt-0.5 dark:text-ink-300">{t('timeline.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={view}
            onChange={(v) => setView(v as any)}
            options={[
              { value: 'list', label: t('common.listView'), icon: List },
              { value: 'board', label: t('common.kanbanView'), icon: LayoutGrid },
              { value: 'calendar', label: t('common.calendarView'), icon: CalendarDays },
            ]}
          />
          <Btn variant="primary" size="sm" icon={Plus} onClick={() => openNew()}>
            {t('common.new')}
          </Btn>
        </div>
      </div>

      <StatsStrip items={stats} cols={5} />

      {/* Range + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({ value: r.value as any, label: t('timeline.' + r.label) }))}
        />
        {range !== 'all' && (
          <input
            type="date"
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            className="h-8 rounded-[10px] bg-white px-2.5 text-[13px] ring-1 ring-ink-200 outline-none dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.14]"
          />
        )}
        <div className="w-56">
          <SearchBox value={q} onChange={setQ} placeholder={`${t('common.search')}…`} />
        </div>
        {selectedDay && (
          <button
            onClick={() => setSelectedDay(null)}
            className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[11.5px] font-medium text-white dark:bg-white dark:text-ink-900"
          >
            {fmtDateShort(selectedDay, lang)} ✕
          </button>
        )}
      </div>

      {/* Views */}
      {view === 'calendar' ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Btn size="xs" variant="subtle" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              ‹
            </Btn>
            <div className="text-[15px] font-semibold text-ink-900 dark:text-white">
              {lang === 'zh'
                ? `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
                : cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Btn size="xs" variant="subtle" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              ›
            </Btn>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-[11px] font-semibold uppercase text-ink-400 py-1">
                {d}
              </div>
            ))}
            {days.map((c, i) => {
              if (!c.inMonth) return <div key={i} />;
              const list = tasksByDay[c.date] || [];
              const isToday = c.date === today;
              const urgent = list.some((x) => (daysUntil(x.dueDate) ?? 0) < 0 && x.status !== 'Done');
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDay(c.date);
                    setView('list');
                  }}
                  className={cx(
                    'h-[74px] rounded-[10px] p-1.5 text-left transition ring-1',
                    isToday
                      ? 'bg-brand-50 ring-brand-300 dark:bg-brand-500/15 dark:ring-brand-500/40'
                      : 'bg-white ring-black/[0.04] hover:bg-ink-50 dark:bg-white/[0.04] dark:ring-white/[0.08] dark:hover:bg-white/[0.08]'
                  )}
                >
                  <div className={cx('text-[11.5px] font-semibold tabular-nums', isToday ? 'text-brand-700 dark:text-brand-300' : 'text-ink-700 dark:text-ink-200')}>
                    {Number(c.date.slice(-2))}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {list.slice(0, 2).map((x) => (
                      <div
                        key={x.id}
                        className={cx(
                          'truncate rounded px-1 text-[9.5px] font-medium',
                          x.status === 'Done'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : urgent
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                            : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-200'
                        )}
                      >
                        {x.title}
                      </div>
                    ))}
                    {list.length > 2 && <div className="text-[9.5px] text-ink-400 pl-1">+{list.length - 2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      ) : view === 'board' ? (
        filtered.length === 0 ? (
          <Card>
            <Empty title={t('common.noData')} icon={CalendarDays} />
          </Card>
        ) : (
          <BoardView
            entity="tasks"
            rows={filtered}
            onOpen={(row) => {
              setEditing({ ...row });
              setOpen(true);
            }}
          />
        )
      ) : (
        <Card pad={false} className="overflow-hidden">
          {filtered.length === 0 ? (
            <Empty title={t('common.noData')} icon={CalendarDays} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                    <th className="w-8 px-3 py-2.5" />
                    {TASKS.columns.map((c) => {
                      const f = TASKS.fields.find((x) => x.key === c);
                      return (
                        <th
                          key={c}
                          className="text-left px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500 whitespace-nowrap dark:text-ink-300"
                        >
                          {f ? tf(f) : c}
                        </th>
                      );
                    })}
                    <th className="w-[80px] px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice()
                    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
                    .map((task) => {
                      const d = daysUntil(task.dueDate);
                      const late = d !== null && d < 0 && task.status !== 'Done';
                      return (
                        <tr
                          key={task.id}
                          className="border-b border-black/[0.04] last:border-0 hover:bg-ink-50/70 group transition dark:border-white/[0.05] dark:hover:bg-white/[0.04]"
                        >
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => toggleDone(task)}
                              className={cx(
                                'h-[18px] w-[18px] rounded-[6px] ring-1 flex items-center justify-center transition',
                                task.status === 'Done'
                                  ? 'bg-emerald-500 ring-emerald-500 text-white'
                                  : 'ring-ink-300 hover:ring-brand-400 dark:ring-white/20'
                              )}
                            >
                              {task.status === 'Done' && <CheckCircle2 size={12} />}
                            </button>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-ink-900 max-w-[260px] dark:text-white">
                            <span className={cx('truncate block', task.status === 'Done' && 'line-through text-ink-400')}>
                              {task.title}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-ink-600 dark:text-ink-200">{clientName(task.clientId)}</td>
                          <td className="px-3 py-2.5 text-ink-600 dark:text-ink-200">{task.stage}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={staffName(task.assigneeId)} size={22} />
                              <span className="text-ink-600 dark:text-ink-200">{staffName(task.assigneeId)}</span>
                            </div>
                          </td>
                          <td className={cx('px-3 py-2.5 tabular-nums', late ? 'text-rose-600 font-medium' : 'text-ink-600 dark:text-ink-200')}>
                            {fmtDateShort(task.dueDate, lang)}
                            {late && <span className="ml-1 text-[10.5px]">{Math.abs(d!)}d</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge value={task.priority} dot={false} />
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge value={task.status} />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  setEditing({ ...task });
                                  setOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-white/10"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmId(task.id)}
                                className="p-1.5 rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Form modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing?.id ? t('common.edit') : t('common.new')}
        footer={
          <>
            <Btn variant="subtle" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Btn>
            <Btn variant="primary" onClick={save}>
              {t('common.saveChanges')}
            </Btn>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {TASKS.fields.map((f) => {
              const wide = f.type === 'textarea';
              return (
                <div key={f.key} className={cx(wide && 'sm:col-span-2')}>
                  <label className={labelCls}>{tf(f)}</label>
                  <FieldControl field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <Confirm
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          remove('tasks', confirmId!);
          setConfirmId(null);
          toast(t('common.deleted'));
        }}
        title={t('common.confirmDelete')}
      />
    </div>
  );
}
