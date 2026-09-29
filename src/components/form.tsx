import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown, Check } from 'lucide-react';
import type { EntityName } from '../data/types';
import type { FieldDef, SubField } from '../data/schema';
import { ENTITY_MAP } from '../data/schema';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { Btn, cx } from './ui';
import { uid } from '../lib/format';

export const inputCls =
  'w-full rounded-[10px] bg-white px-3 text-[13px] text-ink-900 ring-1 ring-ink-200 outline-none transition placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500/45 dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.14] dark:placeholder:text-ink-300';

export const labelCls = 'block text-[12px] font-medium text-ink-600 mb-1.5 dark:text-ink-300';

/* --------------------------------- Inputs -------------------------------- */
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, 'h-9', props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, 'py-2 min-h-[76px] resize-y leading-relaxed', props.className)} />;
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputCls, 'h-9 appearance-none pr-8', !value && 'text-ink-400')}
      >
        <option value="">{placeholder || '—'}</option>
        {options.filter(Boolean).map((o) => (
          <option key={o} value={o} className="text-ink-900">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
    </div>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cx(
        'relative h-[26px] w-[46px] rounded-full transition-colors duration-200',
        value ? 'bg-brand-500' : 'bg-ink-200 dark:bg-white/15'
      )}
    >
      <span
        className={cx(
          'absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all duration-200',
          value ? 'left-[23px]' : 'left-[3px]'
        )}
      />
    </button>
  );
}

export function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const list = Array.isArray(value) ? value : [];
  const add = () => {
    const v = draft.trim();
    if (v && !list.includes(v)) onChange([...list, v]);
    setDraft('');
  };
  return (
    <div className="rounded-[10px] bg-white px-2 py-2 ring-1 ring-ink-200 dark:bg-white/[0.06] dark:ring-white/[0.14]">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {list.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-[3px] text-[11.5px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
          >
            {t}
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="hover:text-brand-900">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder || 'Type and press Enter'}
        className="w-full bg-transparent px-1 text-[13px] outline-none placeholder:text-ink-400 dark:text-white"
      />
    </div>
  );
}

export function MultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) {
  const list = Array.isArray(value) ? value : [];
  return (
    <div className="rounded-[10px] bg-white p-2 ring-1 ring-ink-200 dark:bg-white/[0.06] dark:ring-white/[0.14]">
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = list.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => onChange(active ? list.filter((x) => x !== o) : [...list, o])}
              className={cx(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-[4px] text-[11.5px] font-medium ring-1 transition',
                active
                  ? 'bg-brand-500 text-white ring-brand-500'
                  : 'bg-ink-100 text-ink-600 ring-transparent hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200'
              )}
            >
              {active && <Check size={11} />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RefSelect({
  entity,
  value,
  onChange,
  labelKey,
}: {
  entity: EntityName;
  value: string;
  onChange: (v: string) => void;
  labelKey?: string;
}) {
  const { db } = useData();
  const rows = (db[entity] || []) as any[];
  const key = labelKey || ENTITY_MAP[entity].titleKey;
  return (
    <SelectInput
      value={value || ''}
      onChange={onChange}
      options={rows.map((r) => r[key] || r.name || r.id)}
      placeholder="—"
    />
  );
}

export function RefMultiSelect({ entity, value, onChange }: { entity: EntityName; value: string[]; onChange: (v: string[]) => void }) {
  const { db } = useData();
  const rows = (db[entity] || []) as any[];
  const key = ENTITY_MAP[entity].titleKey;
  return <MultiSelect value={value} onChange={onChange} options={rows.map((r) => r[key] || r.name)} />;
}

/* ------------------------------ SubList editor ---------------------------- */
export function SubListEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any[];
  onChange: (v: any[]) => void;
}) {
  const { t, tf, lang } = useI18n();
  const { db } = useData();
  const list = Array.isArray(value) ? value : [];

  const addRow = () => {
    const blank: any = { id: uid() };
    field.sub?.forEach((s) => {
      blank[s.key] = s.type === 'boolean' ? false : s.type === 'currency' || s.type === 'number' || s.type === 'percent' ? 0 : '';
    });
    onChange([...list, blank]);
  };

  return (
    <div className="space-y-2">
      {list.length === 0 && (
        <div className="rounded-[10px] border border-dashed border-ink-200 py-4 text-center text-[12.5px] text-ink-400 dark:border-white/15">
          {t('common.noVersions')}
        </div>
      )}
      {list.map((row, i) => (
        <div
          key={row.id || i}
          className="rounded-[12px] bg-ink-50/70 p-3 ring-1 ring-black/[0.04] dark:bg-white/[0.04] dark:ring-white/[0.08]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {field.sub?.map((s: SubField) => (
              <div key={s.key} className={cx(s.type === 'textarea' && 'sm:col-span-2')}>
                <label className="block text-[11px] font-medium text-ink-500 mb-1 dark:text-ink-300">
                  {lang === 'zh' ? s.zh : s.en}
                </label>
                <SubControl
                  sub={s}
                  value={row[s.key]}
                  onChange={(v) => {
                    const next = list.map((r, j) => (j === i ? { ...r, [s.key]: v } : r));
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <Btn
              size="xs"
              variant="ghost"
              icon={Trash2}
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/15"
            >
              {t('common.delete')}
            </Btn>
          </div>
        </div>
      ))}
      <Btn size="xs" variant="outline" icon={Plus} onClick={addRow}>
        {t('common.addItem')}
      </Btn>
    </div>
  );
}

function SubControl({ sub, value, onChange }: { sub: SubField; value: any; onChange: (v: any) => void }) {
  const { db } = useData();
  if (sub.type === 'ref') {
    const rows = (db[sub.ref!] || []) as any[];
    const key = ENTITY_MAP[sub.ref!].titleKey;
    return <SelectInput value={value || ''} onChange={onChange} options={rows.map((r) => r[key] || r.name)} />;
  }
  if (sub.type === 'boolean')
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cx(
          'h-9 w-full rounded-[10px] ring-1 text-[12.5px] font-medium transition',
          value
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
            : 'bg-white text-ink-500 ring-ink-200 dark:bg-white/[0.06] dark:ring-white/[0.14] dark:text-ink-300'
        )}
      >
        {value ? 'Yes' : 'No'}
      </button>
    );
  if (sub.type === 'textarea') return <TextArea value={value || ''} onChange={(e) => onChange(e.target.value)} className="min-h-[54px]" />;
  if (sub.type === 'date') return <TextInput type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  if (sub.type === 'currency' || sub.type === 'number' || sub.type === 'percent')
    return <TextInput type="number" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} />;
  if (sub.options) return <SelectInput value={value || ''} onChange={onChange} options={sub.options} />;
  return <TextInput value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}

/* ------------------------------ Field control ----------------------------- */
export function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const { db } = useData();
  switch (field.type) {
    case 'textarea':
      return <TextArea value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
    case 'currency':
    case 'percent':
      return <TextInput type="number" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'date':
      return <TextInput type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return <SelectInput value={value || ''} onChange={onChange} options={field.options || []} />;
    case 'multiselect':
      return <MultiSelect value={value} onChange={onChange} options={field.options || []} />;
    case 'tags':
      return <TagsInput value={value} onChange={onChange} />;
    case 'boolean':
      return (
        <div className="flex items-center h-9">
          <Toggle value={!!value} onChange={onChange} />
          <span className="ml-2 text-[12px] text-ink-500">{value ? 'Yes' : 'No'}</span>
        </div>
      );
    case 'ref':
      return <RefSelect entity={field.ref!} value={value} onChange={onChange} />;
    case 'refmulti':
      return <RefMultiSelectNames entity={field.ref!} value={value} onChange={onChange} />;
    case 'sublist':
      return <SubListEditor field={field} value={value} onChange={onChange} />;
    default:
      return <TextInput value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }
}

/** refmulti stores IDs — render as multi-select over entity names */
function RefMultiSelectNames({ entity, value, onChange }: { entity: EntityName; value: string[]; onChange: (v: string[]) => void }) {
  const { db } = useData();
  const rows = (db[entity] || []) as any[];
  const key = ENTITY_MAP[entity].titleKey;
  const ids: string[] = Array.isArray(value) ? value : [];
  return (
    <MultiSelect
      value={ids.map((id) => nameOfRow(rows, id, key)).filter(Boolean)}
      onChange={(names) => onChange(names.map((n) => rows.find((r) => (r[key] || r.name) === n)?.id).filter(Boolean))}
      options={rows.map((r) => r[key] || r.name)}
    />
  );
}

function nameOfRow(rows: any[], id: string, key: string) {
  const r = rows.find((x) => x.id === id);
  return r ? r[key] || r.name : '';
}
