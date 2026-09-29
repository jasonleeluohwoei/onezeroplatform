import React from 'react';
import type { EntityName } from '../data/types';
import { ENTITY_MAP, type FieldDef } from '../data/schema';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { fmtDate, fmtDateShort, money } from '../lib/format';
import { Badge, ExternalLinkBtn } from './ui';

export function useNameResolver() {
  const { db } = useData();
  return (entity: EntityName, id: string, key?: string): string => {
    if (!id) return '';
    const def = ENTITY_MAP[entity];
    const k = key || def.titleKey;
    const rows = (db[entity] || []) as any[];
    const r = rows.find((x) => x.id === id);
    if (!r) return '';
    return r[k] || r.name || '';
  };
}

export function useListResolver() {
  const { db } = useData();
  return (entity: EntityName): any[] => (db[entity] || []) as any[];
}

export function useFieldDef(entity: EntityName, key: string): FieldDef | undefined {
  return ENTITY_MAP[entity].fields.find((f) => f.key === key);
}

export function RenderValue({
  entity,
  fieldKey,
  value,
  compact = true,
}: {
  entity: EntityName;
  fieldKey: string;
  value: any;
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const { db } = useData();
  const def = ENTITY_MAP[entity];
  const field = def.fields.find((f) => f.key === fieldKey);

  if (!field) return <>{String(value ?? '')}</>;

  if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-ink-400">—</span>;
  }

  switch (field.type) {
    case 'currency':
      return <span className="font-medium tabular-nums">{money(value)}</span>;
    case 'percent':
      return (
        <span className="tabular-nums font-medium">
          {value}
          <span className="text-ink-400">%</span>
        </span>
      );
    case 'date':
      return <span className="tabular-nums text-ink-700 dark:text-ink-100">{compact ? fmtDateShort(value, lang) : fmtDate(value, lang)}</span>;
    case 'ref': {
      const refDef = ENTITY_MAP[field.ref!];
      const rows = (db[field.ref!] || []) as any[];
      const r = rows.find((x) => x.id === value);
      if (!r) return <span className="text-ink-400">—</span>;
      const label = r[refDef.titleKey] || r.name;
      if (field.ref === 'staff')
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-[9px] font-semibold flex items-center justify-center dark:bg-brand-500/20 dark:text-brand-200">
              {String(label).slice(0, 1)}
            </span>
            <span className="truncate">{label}</span>
          </span>
        );
      return <span className="font-medium truncate">{label}</span>;
    }
    case 'refmulti': {
      const refDef = ENTITY_MAP[field.ref!];
      const rows = (db[field.ref!] || []) as any[];
      const names = (Array.isArray(value) ? value : [])
        .map((id) => rows.find((x) => x.id === id))
        .filter(Boolean)
        .map((r) => r[refDef.titleKey] || r.name);
      if (!names.length) return <span className="text-ink-400">—</span>;
      return (
        <span className="text-ink-700 dark:text-ink-100">
          {names.slice(0, 2).join(', ')}
          {names.length > 2 ? ` +${names.length - 2}` : ''}
        </span>
      );
    }
    case 'tags':
    case 'multiselect': {
      const arr = Array.isArray(value) ? value : [];
      return (
        <span className="flex flex-wrap gap-1">
          {arr.slice(0, 2).map((t, i) => (
            <span
              key={i}
              className="rounded-md bg-ink-100 px-1.5 py-[2px] text-[11px] text-ink-600 dark:bg-white/10 dark:text-ink-200"
            >
              {t}
            </span>
          ))}
          {arr.length > 2 && <span className="text-[11px] text-ink-400">+{arr.length - 2}</span>}
        </span>
      );
    }
    case 'boolean':
      return <span className="text-[12px]">{value ? 'Yes' : 'No'}</span>;
    case 'url':
      return <ExternalLinkBtn href={value} />;
    case 'sublist':
      return <span className="text-[12px] text-ink-500">{Array.isArray(value) ? value.length : 0} items</span>;
    default:
      if (def.statusKey === fieldKey) return <Badge value={String(value)} />;
      return <span className="truncate">{String(value)}</span>;
  }
}
