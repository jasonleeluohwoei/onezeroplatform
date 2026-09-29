import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Database, EntityName } from './types';
import { buildSeed } from './seed';
import { uid } from '../lib/format';

const LS_DB = 'agencyos.db.v1';

const EMPTY: Database = {
  staff: [],
  clients: [],
  subscriptions: [],
  payments: [],
  equipment: [],
  proposals: [],
  shootings: [],
  media: [],
  videos: [],
  tasks: [],
  learning: [],
  leads: [],
};

type Toast = { id: string; msg: string; kind: 'ok' | 'warn' };

type Ctx = {
  db: Database;
  setDb: (updater: (d: Database) => Database) => void;
  upsert: (entity: EntityName, record: any) => string;
  remove: (entity: EntityName, id: string) => void;
  removeMany: (entity: EntityName, ids: string[]) => void;
  reset: () => void;
  clearAll: () => void;
  importDb: (raw: Database) => void;
  storageKB: number;
  toasts: Toast[];
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
};

const DataCtx = createContext<Ctx>(null as any);

function load(): Database {
  try {
    const raw = localStorage.getItem(LS_DB);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return buildSeed();
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDbState] = useState<Database>(() => load());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_DB, JSON.stringify(db));
      } catch (e) {
        console.warn('storage write failed', e);
      }
    }, 250);
    return () => timer.current && clearTimeout(timer.current);
  }, [db]);

  const toast = useCallback((msg: string, kind: 'ok' | 'warn' = 'ok') => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const setDb = useCallback((updater: (d: Database) => Database) => {
    setDbState((prev) => updater(prev));
  }, []);

  const upsert = useCallback((entity: EntityName, record: any) => {
    const id = record.id || uid();
    setDbState((prev) => {
      const list = (prev[entity] || []) as any[];
      const exists = list.some((r) => r.id === id);
      const next = exists
        ? list.map((r) => (r.id === id ? { ...r, ...record, id, updatedAt: new Date().toISOString().slice(0, 10) } : r))
        : [{ ...record, id, createdAt: record.createdAt || new Date().toISOString().slice(0, 10) }, ...list];
      return { ...prev, [entity]: next } as Database;
    });
    return id;
  }, []);

  const remove = useCallback(
    (entity: EntityName, id: string) => {
      setDbState((prev) => ({ ...prev, [entity]: (prev[entity] as any[]).filter((r) => r.id !== id) }) as Database);
    },
    []
  );

  const removeMany = useCallback((entity: EntityName, ids: string[]) => {
    setDbState((prev) => ({ ...prev, [entity]: (prev[entity] as any[]).filter((r) => !ids.includes(r.id)) }) as Database);
  }, []);

  const reset = useCallback(() => {
    setDbState(buildSeed());
  }, []);

  const clearAll = useCallback(() => {
    setDbState({ ...EMPTY });
  }, []);

  const importDb = useCallback((raw: Database) => {
    setDbState({ ...EMPTY, ...raw });
  }, []);

  const storageKB = useMemo(() => {
    try {
      return Math.round((localStorage.getItem(LS_DB)?.length || 0) / 1024);
    } catch {
      return 0;
    }
  }, [db]);

  const value: Ctx = { db, setDb, upsert, remove, removeMany, reset, clearAll, importDb, storageKB, toasts, toast };
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  return useContext(DataCtx);
}

/* ------------------------------- selectors ------------------------------- */
export function useRefs(entity: EntityName) {
  const { db } = useData();
  return (db[entity] || []) as any[];
}

export function nameOf(list: any[], id: string, key = 'name') {
  if (!id) return '';
  const r = list.find((x) => x.id === id);
  return r ? r[key] || r.name || '' : '';
}
