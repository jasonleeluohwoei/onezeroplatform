import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Card, SectionHeader, Avatar, Empty, cx } from '../components/ui';
import { daysUntil, fmtDateShort } from '../lib/format';
import { Clapperboard, Camera, CheckCircle2, Scissors } from 'lucide-react';

export default function Shootings() {
  const { db } = useData();
  const { t, lang } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.shootings.filter((x) => x.status === s).length;
    return [
      { label: 'Planning', value: c('Planning'), tone: 'blue' as const, icon: Clapperboard },
      { label: 'Confirmed', value: c('Confirmed'), tone: 'blue' as const, icon: Camera },
      { label: 'Completed', value: c('Completed'), tone: 'green' as const, icon: CheckCircle2 },
      { label: 'Post Production', value: c('Post Production'), tone: 'amber' as const, icon: Scissors },
    ];
  }, [db]);

  const upcoming = useMemo(
    () =>
      db.shootings
        .filter((s) => {
          const d = daysUntil(s.shootingDate);
          return d !== null && d >= 0 && d <= 30;
        })
        .sort((a, b) => (a.shootingDate > b.shootingDate ? 1 : -1))
        .slice(0, 6),
    [db]
  );

  const clientName = (id: string) => db.clients.find((c) => c.id === id)?.name || '—';
  const staffName = (id: string) => db.staff.find((s) => s.id === id)?.name || '';

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />

      <Card>
        <SectionHeader title={t('dashboard.upcomingShootings')} />
        {upcoming.length === 0 ? (
          <Empty title={t('dashboard.upcomingShootingsEmpty')} icon={Camera} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((s) => {
              const d = daysUntil(s.shootingDate) ?? 0;
              return (
                <Link
                  key={s.id}
                  to="/shootings"
                  className={cx(
                    'rounded-[14px] p-3.5 ring-1 transition hover:shadow-lift',
                    d <= 2
                      ? 'bg-amber-50/70 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20'
                      : 'bg-ink-50/70 ring-black/[0.04] dark:bg-white/[0.04] dark:ring-white/[0.08]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-ink-900 truncate dark:text-white">{s.projectName}</div>
                      <div className="text-[11.5px] text-ink-500 truncate dark:text-ink-300">{clientName(s.clientId)}</div>
                    </div>
                    <span className="text-[11.5px] font-semibold text-brand-600 shrink-0 dark:text-brand-300">
                      {d === 0 ? t('common.today') : d === 1 ? t('common.tomorrow') : t('common.inDays', { n: d })}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-ink-500 dark:text-ink-300">
                    <span>{fmtDateShort(s.shootingDate, lang)} · {s.shootingTime || '—'}</span>
                    <span className="truncate max-w-[45%]">{s.location || '—'}</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {[s.directorId, s.photographerId, s.videographerId].filter(Boolean).map((id, i) => (
                      <Avatar key={i} name={staffName(id)} size={22} />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <EntityPage
        entity="shootings"
        defaultView="board"
        subtitle={`${db.shootings.length} ${t('common.records')}`}
        initialForm={{ shootingDate: new Date().toISOString().slice(0, 10), status: 'Planning' }}
      />
    </div>
  );
}
