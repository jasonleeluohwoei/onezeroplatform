import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { moneyShort } from '../lib/format';
import { Building2, UserPlus, PauseCircle, UserMinus } from 'lucide-react';

export default function Clients() {
  const { db } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.clients.filter((x) => x.status === s).length;
    const mrr = db.subscriptions
      .filter((s) => db.clients.find((cl) => cl.id === s.clientId && cl.status === 'Active'))
      .filter((s) => s.status === 'Active' || s.status === 'Expiring')
      .reduce((a, s) => a + (s.monthlyFee || 0), 0);
    return [
      { label: 'Active', value: c('Active'), tone: 'green' as const, icon: Building2 },
      { label: 'Onboarding', value: c('Onboarding'), tone: 'blue' as const, icon: UserPlus },
      { label: 'Paused', value: c('Paused'), tone: 'amber' as const, icon: PauseCircle },
      { label: 'Churned', value: c('Churned'), tone: 'red' as const, icon: UserMinus },
    ].concat([{ label: t('dashboard.mrr'), value: moneyShort(mrr), tone: 'purple' as const }] as any);
  }, [db, t]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={5} />
      <EntityPage entity="clients" subtitle={`${db.clients.length} ${t('common.records')}`} />
    </div>
  );
}
