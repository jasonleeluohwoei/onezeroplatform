import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Card, SectionHeader, Avatar, Progress, Badge, cx } from '../components/ui';
import { daysUntil } from '../lib/format';
import { Users, Briefcase, Layers, AlertCircle } from 'lucide-react';

export default function Staff() {
  const { db } = useData();
  const { t } = useI18n();

  const data = useMemo(() => {
    const active = db.staff.filter((s) => s.status === 'Active');
    const openTasks = db.tasks.filter((x) => x.status !== 'Done');
    const workload = db.staff
      .map((s) => {
        const mine = db.tasks.filter((x) => x.assigneeId === s.id);
        const open = mine.filter((x) => x.status !== 'Done');
        const overdue = open.filter((x) => (daysUntil(x.dueDate) ?? 0) < 0);
        const done = mine.filter((x) => x.status === 'Done').length;
        return {
          id: s.id,
          name: s.name,
          role: s.role,
          department: s.department,
          status: s.status,
          open: open.length,
          overdue: overdue.length,
          done,
          clients: (s.clientIds || []).length,
        };
      })
      .sort((a, b) => b.open - a.open);
    return {
      active: active.length,
      departments: new Set(db.staff.map((s) => s.department)).size,
      openTasks: openTasks.length,
      overdue: openTasks.filter((x) => (daysUntil(x.dueDate) ?? 0) < 0).length,
      workload,
    };
  }, [db]);

  return (
    <div className="space-y-5">
      <StatsStrip
        items={[
          { label: 'Active Staff', value: data.active, tone: 'green', icon: Users },
          { label: 'Departments', value: data.departments, tone: 'blue', icon: Briefcase },
          { label: t('dashboard.pendingTasks'), value: data.openTasks, tone: 'purple', icon: Layers },
          { label: t('timeline.overdueTasks'), value: data.overdue, tone: 'red', icon: AlertCircle },
        ]}
      />

      <Card>
        <SectionHeader title={t('dashboard.staffWorkload')} sub={t('dashboard.workloadHint')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.workload.map((w) => (
            <div
              key={w.id}
              className="rounded-[14px] bg-ink-50/70 p-3.5 ring-1 ring-black/[0.04] dark:bg-white/[0.04] dark:ring-white/[0.08]"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={w.name} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-ink-900 truncate dark:text-white">{w.name}</div>
                  <div className="text-[11.5px] text-ink-500 truncate dark:text-ink-300">
                    {w.role} · {w.department}
                  </div>
                </div>
                <Badge value={w.status} dot={false} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[16px] font-semibold tabular-nums text-ink-900 dark:text-white">{w.open}</div>
                  <div className="text-[10.5px] text-ink-400">{t('timeline.open')}</div>
                </div>
                <div>
                  <div
                    className={cx(
                      'text-[16px] font-semibold tabular-nums',
                      w.overdue ? 'text-rose-600' : 'text-ink-900 dark:text-white'
                    )}
                  >
                    {w.overdue}
                  </div>
                  <div className="text-[10.5px] text-ink-400">{t('common.overdue')}</div>
                </div>
                <div>
                  <div className="text-[16px] font-semibold tabular-nums text-ink-900 dark:text-white">{w.clients}</div>
                  <div className="text-[10.5px] text-ink-400">{t('nav.clients')}</div>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={(w.open / 8) * 100} tone={w.overdue ? 'red' : w.open > 4 ? 'amber' : 'green'} height={5} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <EntityPage entity="staff" subtitle={`${db.staff.length} ${t('common.records')}`} />
    </div>
  );
}
