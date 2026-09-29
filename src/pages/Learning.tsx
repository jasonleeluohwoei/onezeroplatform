import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Card, SectionHeader, Progress, cx } from '../components/ui';
import { GraduationCap, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

export default function Learning() {
  const { db } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.learning.filter((x) => x.status === s).length;
    const cats = new Set(db.learning.map((l) => l.category)).size;
    const avg = db.learning.length
      ? Math.round(db.learning.reduce((a, l) => a + (l.progress || 0), 0) / db.learning.length)
      : 0;
    return [
      { label: 'Total Materials', value: db.learning.length, tone: 'blue' as const, icon: GraduationCap },
      { label: 'Categories', value: cats, tone: 'purple' as const, icon: BookOpen },
      { label: t('learning.completedCount'), value: c('Completed'), tone: 'green' as const, icon: CheckCircle2 },
      { label: t('learning.inProgressCount'), value: c('Learning'), tone: 'amber' as const, icon: Sparkles },
    ];
  }, [db, t]);

  const byCategory = useMemo(() => {
    const map: Record<string, { total: number; done: number; avg: number }> = {};
    db.learning.forEach((l) => {
      const k = l.category || 'Other';
      map[k] = map[k] || { total: 0, done: 0, avg: 0 };
      map[k].total += 1;
      map[k].avg += l.progress || 0;
      if (l.status === 'Completed') map[k].done += 1;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ category: k, ...v, avg: Math.round(v.avg / v.total) }))
      .sort((a, b) => b.total - a.total);
  }, [db]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />

      <Card>
        <SectionHeader title={t('learning.knowledge')} sub={t('learning.progressHint')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {byCategory.map((c) => (
            <div
              key={c.category}
              className="rounded-[14px] bg-ink-50/70 p-3.5 ring-1 ring-black/[0.04] dark:bg-white/[0.04] dark:ring-white/[0.08]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-800 dark:text-white truncate">{c.category}</span>
                <span className="text-[11.5px] text-ink-500 dark:text-ink-300">
                  {c.done}/{c.total}
                </span>
              </div>
              <div className="mt-2">
                <Progress value={c.avg} tone={c.avg === 100 ? 'green' : 'blue'} height={6} />
              </div>
              <div className="mt-1.5 text-[11px] text-ink-400">{c.avg}% avg</div>
            </div>
          ))}
        </div>
      </Card>

      <EntityPage entity="learning" subtitle={`${db.learning.length} ${t('common.records')}`} initialForm={{ status: 'To Learn' }} />
    </div>
  );
}
