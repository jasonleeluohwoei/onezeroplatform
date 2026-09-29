import React, { useMemo, useState } from 'react';
import { FolderOpen, Image, Video, Music, FileType2, Layers, Plus, Grid3x3, List, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { MEDIA } from '../data/schema';
import { Btn, Card, Empty, Modal, SearchBox, Segmented, cx, Badge, Confirm } from '../components/ui';
import { FieldControl, labelCls } from '../components/form';
import { fmtDateShort, toDate, uid } from '../lib/format';

const TYPE_ICON: Record<string, any> = {
  RAW: Image,
  JPG: Image,
  MOV: Video,
  MP4: Video,
  Audio: Music,
  'B-Roll': Video,
  Thumbnail: Image,
  Graphics: FileType2,
  Other: Layers,
};

const TYPE_TONE: Record<string, string> = {
  RAW: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  JPG: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  MOV: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  MP4: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  Audio: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  'B-Roll': 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
  Thumbnail: 'bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300',
  Graphics: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
  Other: 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-200',
};

const GROUP_OPTIONS = [
  { value: 'clientId', label: 'Client' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'projectId', label: 'Project' },
  { value: 'shootingDate', label: 'Shooting Date' },
  { value: 'fileType', label: 'File Type' },
];

export default function Media() {
  const { db, upsert, remove, toast } = useData();
  const { t, tf, lang } = useI18n();
  const [groupBy, setGroupBy] = useState('clientId');
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const rows = db.media;

  const filtered = useMemo(() => {
    let out = rows;
    if (typeFilter) out = out.filter((r) => r.fileType === typeFilter);
    if (q.trim()) {
      const n = q.toLowerCase();
      out = out.filter((r) =>
        [r.fileName, r.campaign, r.author, r.camera, r.notes, (r.tags || []).join(' ')].join(' ').toLowerCase().includes(n)
      );
    }
    return out;
  }, [rows, q, typeFilter]);

  const groups = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((r) => {
      let key = String(r[groupBy as keyof typeof r] ?? '—');
      if (groupBy === 'clientId') key = db.clients.find((c) => c.id === r.clientId)?.name || '—';
      if (groupBy === 'projectId') key = db.shootings.find((s) => s.id === r.projectId)?.projectName || '—';
      if (!key) key = '—';
      map[key] = map[key] || [];
      map[key].push(r);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filtered, groupBy, db]);

  const openNew = () => {
    const blank: any = {};
    MEDIA.fields.forEach((f) => {
      blank[f.key] =
        f.type === 'tags' || f.type === 'multiselect' || f.type === 'refmulti' || f.type === 'sublist'
          ? []
          : f.type === 'number' || f.type === 'currency' || f.type === 'percent'
          ? 0
          : '';
    });
    blank.shootingDate = new Date().toISOString().slice(0, 10);
    setEditing(blank);
    setOpen(true);
  };

  const save = () => {
    upsert('media', editing);
    setOpen(false);
    toast(t('common.saved'));
  };

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => (map[r.fileType] = (map[r.fileType] || 0) + 1));
    return map;
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">{t('media.library')}</h1>
          <p className="text-[13.5px] text-ink-500 mt-0.5 dark:text-ink-300">
            {filtered.length} {t('common.records')} · {t('media.uploadHint')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={Plus} onClick={openNew}>
            {t('common.new')}
          </Btn>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-60">
          <SearchBox value={q} onChange={setQ} placeholder={`${t('common.search')}…`} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-ink-400">{t('media.groupBy')}</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="h-9 rounded-[10px] bg-white px-2.5 text-[13px] ring-1 ring-ink-200 outline-none dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.14]"
          >
            {GROUP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter('')}
            className={cx(
              'rounded-full px-2.5 py-[4px] text-[12px] font-medium ring-1 transition',
              !typeFilter
                ? 'bg-ink-900 text-white ring-ink-900 dark:bg-white dark:text-ink-900'
                : 'bg-white text-ink-600 ring-ink-200 dark:bg-white/[0.06] dark:text-ink-200 dark:ring-white/10'
            )}
          >
            {t('common.all')}
          </button>
          {Object.keys(TYPE_ICON).map((k) => (
            <button
              key={k}
              onClick={() => setTypeFilter(k)}
              className={cx(
                'rounded-full px-2.5 py-[4px] text-[12px] font-medium ring-1 transition',
                typeFilter === k
                  ? 'bg-ink-900 text-white ring-ink-900 dark:bg-white dark:text-ink-900'
                  : 'bg-white text-ink-600 ring-ink-200 dark:bg-white/[0.06] dark:text-ink-200 dark:ring-white/10'
              )}
            >
              {k} {typeCounts[k] ? `(${typeCounts[k]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Groups */}
      {filtered.length === 0 ? (
        <Card>
          <Empty title={t('common.noData')} hint={t('common.noDataHint')} icon={FolderOpen} />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map(([key, list]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2.5">
                <FolderOpen size={15} className="text-brand-600 dark:text-brand-300" />
                <h3 className="text-[14.5px] font-semibold text-ink-900 dark:text-white">{key}</h3>
                <span className="rounded-full bg-ink-100 px-2 text-[11px] font-medium text-ink-500 dark:bg-white/10 dark:text-ink-300">
                  {list.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {list.map((a) => {
                  const Icon = TYPE_ICON[a.fileType] || Layers;
                  return (
                    <div
                      key={a.id}
                      className="group rounded-[14px] bg-white p-3.5 ring-1 ring-black/[0.05] shadow-card hover:shadow-lift transition dark:bg-[#1c1c1e] dark:ring-white/[0.08]"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cx(
                            'h-11 w-11 rounded-[11px] flex items-center justify-center shrink-0',
                            TYPE_TONE[a.fileType] || TYPE_TONE.Other
                          )}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-ink-900 truncate dark:text-white" title={a.fileName}>
                            {a.fileName}
                          </div>
                          <div className="text-[11.5px] text-ink-500 truncate dark:text-ink-300">{a.campaign || '—'}</div>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <Badge value={a.fileType} dot={false} />
                            {a.resolution && (
                              <span className="text-[10.5px] text-ink-400 tabular-nums">{a.resolution}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11.5px] text-ink-500 dark:text-ink-300">
                        <span className="truncate">{a.author || '—'}</span>
                        <span className="tabular-nums">{fmtDateShort(a.shootingDate, lang)}</span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        {a.cloudLink ? (
                          <a
                            href={a.cloudLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11.5px] text-brand-600 hover:underline dark:text-brand-300"
                          >
                            <ExternalLink size={12} /> {t('media.cloudLink')}
                          </a>
                        ) : (
                          <span />
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditing({ ...a });
                              setOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-white/10"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmId(a.id)}
                            className="p-1.5 rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

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
            {MEDIA.fields.map((f) => {
              const wide = f.type === 'textarea' || f.type === 'tags';
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
          remove('media', confirmId!);
          setConfirmId(null);
          toast(t('common.deleted'));
        }}
        title={t('common.confirmDelete')}
      />
    </div>
  );
}
