import React, { useMemo } from 'react';
import { Undo2 } from 'lucide-react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Btn } from '../components/ui';
import { moneyShort, todayISO } from '../lib/format';
import { Camera, Wrench, PackageCheck, SearchX } from 'lucide-react';

export default function Equipment() {
  const { db, upsert, toast } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.equipment.filter((x) => x.status === s).length;
    const value = db.equipment.reduce((a, e) => a + (e.purchasePrice || 0), 0);
    return [
      { label: t('dashboard.totalEquipment'), value: db.equipment.length, tone: 'gray' as const, icon: Camera },
      { label: 'Available', value: c('Available'), tone: 'green' as const, icon: PackageCheck },
      { label: t('dashboard.equipmentInUse'), value: c('In Use') + c('Borrowed'), tone: 'blue' as const, icon: Camera },
      { label: t('dashboard.equipmentMaintenance'), value: c('Maintenance'), tone: 'amber' as const, icon: Wrench },
      { label: t('equipment.value'), value: moneyShort(value), tone: 'purple' as const, icon: SearchX },
    ];
  }, [db, t]);

  const markReturned = (row: any) => {
    const records = [...(row.borrowRecords || [])];
    if (records.length) records[records.length - 1] = { ...records[records.length - 1], returnDate: todayISO() };
    upsert('equipment', { ...row, status: 'Available', borrowRecords: records, assignedTo: '' });
    toast(t('equipment.returned'));
  };

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={5} />
      <EntityPage
        entity="equipment"
        defaultView="board"
        subtitle={`${db.equipment.length} ${t('common.records')}`}
        renderExtraActions={(row) =>
          row.status === 'Borrowed' ? (
            <button
              onClick={() => markReturned(row)}
              title={t('equipment.returned')}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/15"
            >
              <Undo2 size={14} />
            </button>
          ) : null
        }
        cardExtra={(row) => (
          <div className="text-[11.5px] text-ink-500 dark:text-ink-300">
            {row.location || '—'} {row.assignedTo ? '· ' + (db.staff.find((s) => s.id === row.assignedTo)?.name || '') : ''}
          </div>
        )}
      />
    </div>
  );
}
