import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Lightbulb, CheckCircle2, XCircle, Clapperboard } from 'lucide-react';

export default function Proposals() {
  const { db } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const pending = db.proposals.filter((p) => ['Idea', 'Draft', 'Internal Review', 'Sent to Client', 'Client Review'].includes(p.status)).length;
    const approved = db.proposals.filter((p) => p.status === 'Approved').length;
    const production = db.proposals.filter((p) => p.status === 'Production').length;
    const rejected = db.proposals.filter((p) => p.status === 'Rejected').length;
    return [
      { label: t('dashboard.pendingProposals'), value: pending, tone: 'amber' as const, icon: Lightbulb },
      { label: 'Approved', value: approved, tone: 'green' as const, icon: CheckCircle2 },
      { label: 'In Production', value: production, tone: 'purple' as const, icon: Clapperboard },
      { label: 'Rejected', value: rejected, tone: 'red' as const, icon: XCircle },
    ];
  }, [db, t]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />
      <EntityPage
        entity="proposals"
        defaultView="board"
        subtitle={`${db.proposals.length} ${t('common.records')}`}
        initialForm={{ status: 'Idea', targetDate: new Date().toISOString().slice(0, 10) }}
      />
    </div>
  );
}
