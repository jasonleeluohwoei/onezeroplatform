import React, { useMemo, useState } from 'react';
import { Download, LayoutGrid, List, Plus, Trash2, Pencil, Filter } from 'lucide-react';
import type { EntityName } from '../data/types';
import { ENTITY_MAP, toneOf, TONE_DOT } from '../data/schema';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { fmtDateShort, uid } from '../lib/format';
import { Badge, Btn, Card, Confirm, Empty, Modal, SearchBox, Segmented, cx } from './ui';
import { FieldControl, labelCls } from './form';
import { RenderValue, useNameResolver } from './render';

export function EntityPage({
  entity,
  defaultView = 'list',
  title,
  subtitle,
  extraFilters,
  renderExtraActions,
  cardExtra,
  allowNew = true,
  initialForm = {},
  onSaved,
  headerRight,
  groupByDefault,
}: {
  entity: EntityName;
  defaultView?: 'list' | 'board';
  title?: string;
  subtitle?: string;
  extraFilters?: React.ReactNode;
  renderExtraActions?: (row: any) => React.ReactNode;
  cardExtra?: (row: any) => React.ReactNode;
  allowNew?: boolean;
  initialForm?: Record<string, any>;
  onSaved?: (record: any) => void;
  headerRight?: React.ReactNode;
  groupByDefault?: string;
}) {
  const def = ENTITY_MAP[entity];
  const { db, upsert, remove, toast } = useData();
  const { t, tf, lang } = useI18n();
  const resolve = useNameResolver();

  const [view, setView] = useState<'list' | 'board'>(defaultView);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBy, setGroupBy] = useState(groupByDefault || '');
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: '', dir: 1 });

  const rows = (db[entity] || []) as any[];
  const statusField = def.fields.find((f) => f.key === def.statusKey);
  const statusOptions = statusField?.options || [];

  const filtered = useMemo(() => {
    let out = rows;
    if (statusFilter) out = out.filter((r) => r[def.statusKey!] === statusFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((r) =>
        def.searchKeys.some((k) => {
          const v = r[k];
          if (Array.isArray(v)) return v.join(' ').toLowerCase().includes(needle);
          return String(v ?? '').toLowerCase().includes(needle);
        })
      );
    }
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key] ?? '';
        const bv = b[sort.key] ?? '';
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    }
    return out;
  }, [rows, q, statusFilter, sort, def]);

  const openNew = () => {
    const blank: any = { id: '' };
    def.fields.forEach((f) => {
      if (f.type === 'boolean') blank[f.key] = false;
      else if (f.type === 'tags' || f.type === 'multiselect' || f.type === 'refmulti' || f.type === 'sublist') blank[f.key] = [];
      else if (f.type === 'number' || f.type === 'currency' || f.type === 'percent') blank[f.key] = 0;
      else blank[f.key] = '';
    });
    setEditing({ ...blank, ...initialForm });
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing({ ...row });
    setOpen(true);
  };

  const save = () => {
    const payload = { ...editing };
    const missing = def.fields.find((f) => f.required && !payload[f.key] && payload[f.key] !== 0);
    if (missing) {
      toast(`${tf(missing)} — ${t('common.required')}`, 'warn');
      return;
    }
    upsert(entity, payload);
    setOpen(false);
    setEditing(null);
    toast(t('common.saved'));
    onSaved?.(payload);
  };

  const exportCsv = () => {
    const cols = def.columns;
    const headers = cols.map((c) => def.fields.find((f) => f.key === c)?.en || c);
    const lines = [headers.join(',')];
    filtered.forEach((r) => {
      lines.push(
        cols
          .map((c) => {
            const f = def.fields.find((x) => x.key === c);
            let v = r[c];
            if (f?.type === 'ref') v = resolve(f.ref!, v);
            if (Array.isArray(v)) v = v.join(' / ');
            return `"${String(v ?? '').replace(/"/g, '""')}"`;
          })
          .join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const name = title || (lang === 'zh' ? def.zhPlural || def.zh : def.enPlural || def.en);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">{name}</h1>
          <p className="text-[13.5px] text-ink-500 mt-0.5 dark:text-ink-300">
            {subtitle || `${filtered.length} ${t('common.records')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          <Segmented
            value={view}
            onChange={(v) => setView(v as any)}
            options={[
              { value: 'list', label: t('common.listView'), icon: List },
              { value: 'board', label: t('common.kanbanView'), icon: LayoutGrid },
            ]}
          />
          <Btn variant="ghost" size="sm" icon={Download} onClick={exportCsv} title="Export CSV" />
          {allowNew && (
            <Btn variant="primary" size="sm" icon={Plus} onClick={openNew}>
              {t('common.new')}
            </Btn>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64">
          <SearchBox value={q} onChange={setQ} placeholder={`${t('common.search')} ${name}…`} />
        </div>
        {statusOptions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-ink-400" />
            <button
              onClick={() => setStatusFilter('')}
              className={cx(
                'rounded-full px-2.5 py-[4px] text-[12px] font-medium ring-1 transition',
                !statusFilter
                  ? 'bg-ink-900 text-white ring-ink-900 dark:bg-white dark:text-ink-900'
                  : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50 dark:bg-white/[0.06] dark:text-ink-200 dark:ring-white/10'
              )}
            >
              {t('common.all')}
            </button>
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cx(
                  'rounded-full px-2.5 py-[4px] text-[12px] font-medium ring-1 transition inline-flex items-center gap-1.5',
                  statusFilter === s
                    ? 'bg-ink-900 text-white ring-ink-900 dark:bg-white dark:text-ink-900'
                    : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50 dark:bg-white/[0.06] dark:text-ink-200 dark:ring-white/10'
                )}
              >
                <span className={cx('h-1.5 w-1.5 rounded-full', TONE_DOT[toneOf(s)])} />
                {s}
              </button>
            ))}
          </div>
        )}
        {extraFilters}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <Empty title={t('common.noData')} hint={t('common.noDataHint')} icon={List} />
        </Card>
      ) : view === 'list' ? (
        <Card pad={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  {def.columns.map((c) => {
                    const f = def.fields.find((x) => x.key === c);
                    return (
                      <th
                        key={c}
                        onClick={() => f && setSort({ key: c, dir: sort.key === c && sort.dir === 1 ? -1 : 1 })}
                        className="text-left px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500 whitespace-nowrap cursor-pointer hover:text-ink-800 select-none dark:text-ink-300"
                      >
                        {f ? tf(f) : c}
                        {sort.key === c && <span className="ml-1 text-brand-500">{sort.dir === 1 ? '↑' : '↓'}</span>}
                      </th>
                    );
                  })}
                  <th className="w-[90px] px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-black/[0.04] last:border-0 hover:bg-ink-50/70 transition-colors group dark:border-white/[0.05] dark:hover:bg-white/[0.04]"
                  >
                    {def.columns.map((c, i) => (
                      <td
                        key={c}
                        onClick={() => openEdit(row)}
                        className={cx(
                          'px-4 py-2.5 align-middle cursor-pointer max-w-[240px]',
                          i === 0 && 'font-medium text-ink-900 dark:text-white'
                        )}
                      >
                        <div className="truncate">
                          <RenderValue entity={entity} fieldKey={c} value={row[c]} />
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderExtraActions?.(row)}
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-white/10"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmId(row.id)}
                          className="p-1.5 rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <BoardView entity={entity} rows={filtered} onOpen={openEdit} cardExtra={cardExtra} />
      )}

      {/* Form modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing?.id ? t('common.edit') + ' — ' + (editing[def.titleKey] || name) : t('common.new') + ' — ' + name}
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
            {def.fields.map((f) => {
              const wide = f.type === 'textarea' || f.type === 'sublist' || f.type === 'tags' || f.type === 'multiselect' || f.type === 'refmulti';
              return (
                <div key={f.key} className={cx(wide && 'sm:col-span-2')}>
                  <label className={labelCls}>
                    {tf(f)}
                    {f.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </label>
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
          remove(entity, confirmId!);
          setConfirmId(null);
          toast(t('common.deleted'));
        }}
        title={t('common.confirmDelete')}
        hint={t('common.confirmDeleteHint')}
      />
    </div>
  );
}

/* --------------------------------- Board --------------------------------- */
export function BoardView({
  entity,
  rows,
  onOpen,
  cardExtra,
}: {
  entity: EntityName;
  rows: any[];
  onOpen: (row: any) => void;
  cardExtra?: (row: any) => React.ReactNode;
}) {
  const def = ENTITY_MAP[entity];
  const key = def.kanbanKey || def.statusKey!;
  const field = def.fields.find((f) => f.key === key);
  const options = field?.options || Array.from(new Set(rows.map((r) => r[key]).filter(Boolean)));
  const { lang } = useI18n();

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
      {options.map((opt) => {
        const list = rows.filter((r) => r[key] === opt);
        const tone = toneOf(opt);
        return (
          <div key={opt} className="w-[290px] shrink-0">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={cx('h-2 w-2 rounded-full', TONE_DOT[tone])} />
              <span className="text-[12.5px] font-semibold text-ink-700 dark:text-ink-100">{opt}</span>
              <span className="text-[11.5px] text-ink-400 bg-ink-100 rounded-full px-1.5 dark:bg-white/10">{list.length}</span>
            </div>
            <div className="space-y-2 min-h-[80px] rounded-[14px] bg-ink-50/60 p-2 dark:bg-white/[0.03]">
              {list.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onOpen(row)}
                  className="cursor-pointer rounded-[12px] bg-white p-3 ring-1 ring-black/[0.05] shadow-card hover:shadow-lift transition dark:bg-[#232326] dark:ring-white/[0.08]"
                >
                  <div className="text-[13.5px] font-medium text-ink-900 leading-snug dark:text-white">
                    {row[def.titleKey] || '(untitled)'}
                  </div>
                  {def.subtitleKey && row[def.subtitleKey] && (
                    <div className="text-[12px] text-ink-500 mt-0.5 truncate dark:text-ink-300">{row[def.subtitleKey]}</div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {def.statusKey !== key && row[def.statusKey!] && <Badge value={row[def.statusKey!]} />}
                    {row.dueDate && (
                      <span className="text-[11px] text-ink-500 tabular-nums dark:text-ink-300">
                        {fmtDateShort(row.dueDate, lang)}
                      </span>
                    )}
                  </div>
                  {cardExtra && <div className="mt-2">{cardExtra(row)}</div>}
                </div>
              ))}
              {list.length === 0 && <div className="py-6 text-center text-[12px] text-ink-400">—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
