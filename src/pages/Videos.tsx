import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Card, Badge, cx } from '../components/ui';
import { Film, Scissors, Eye, CheckCircle2, Send } from 'lucide-react';

export default function Videos() {
  const { db } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.videos.filter((x) => x.status === s).length;
    return [
      { label: 'In Edit', value: c('Footage') + c('Editing') + c('Draft V1') + c('Revision V2'), tone: 'purple' as const, icon: Scissors },
      { label: 'Awaiting Review', value: c('Client Review'), tone: 'amber' as const, icon: Eye },
      { label: 'Final Approved', value: c('Final Approved'), tone: 'green' as const, icon: CheckCircle2 },
      { label: 'Published', value: c('Published'), tone: 'green' as const, icon: Send },
    ];
  }, [db]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />

      <Card className="flex items-start gap-3 bg-brand-50/60 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
        <Film size={18} className="text-brand-600 mt-0.5 dark:text-brand-300" />
        <div>
          <div className="text-[13.5px] font-semibold text-ink-900 dark:text-white">{t('common.versionControl')}</div>
          <p className="text-[12.5px] text-ink-600 mt-0.5 dark:text-ink-200">{t('videos.versionHint')}</p>
        </div>
      </Card>

      <EntityPage
        entity="videos"
        defaultView="board"
        subtitle={`${db.videos.length} ${t('common.records')}`}
        cardExtra={(row) => (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span
              className={cx(
                'rounded-md px-2 py-[3px] text-[11px] font-semibold ring-1',
                row.currentVersion === 'Final'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-ink-100 text-ink-600 ring-black/5 dark:bg-white/10 dark:text-ink-200'
              )}
            >
              {row.currentVersion || '—'}
            </span>
            {row.editorId && (
              <span className="text-[11px] text-ink-500 dark:text-ink-300">
                {db.staff.find((s) => s.id === row.editorId)?.name || ''}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
}
