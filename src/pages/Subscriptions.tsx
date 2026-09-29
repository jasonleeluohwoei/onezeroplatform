import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Credits } from '../components/ui';
import { daysUntil, moneyShort } from '../lib/format';
import { Package, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function Subscriptions() {
  const { db } = useData();
  const { t } = useI18n();

  const stats = useMemo(() => {
    const c = (s: string) => db.subscriptions.filter((x) => x.status === s).length;
    const mrr = db.subscriptions
      .filter((s) => s.status === 'Active' || s.status === 'Expiring')
      .reduce((a, s) => a + (s.monthlyFee || 0), 0);
    const expiring = db.subscriptions.filter((s) => {
      const d = daysUntil(s.endDate);
      return d !== null && d >= 0 && d <= 60 && s.status !== 'Expired' && s.status !== 'Cancelled';
    }).length;
    return [
      { label: 'Active', value: c('Active'), tone: 'green' as const, icon: CheckCircle2 },
      { label: t('dashboard.expiringContracts'), value: expiring, tone: 'amber' as const, icon: AlertCircle },
      { label: 'Expired', value: c('Expired'), tone: 'red' as const, icon: XCircle },
      { label: t('dashboard.mrr'), value: moneyShort(mrr), tone: 'blue' as const, icon: Package },
    ];
  }, [db, t]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />
      <EntityPage
        entity="subscriptions"
        defaultView="board"
        subtitle={`${db.subscriptions.length} ${t('common.records')}`}
        cardExtra={(row) => (
          <div className="flex items-center justify-between gap-3 pt-1">
            <Credits used={row.usedContent || 0} total={row.contentPerMonth || 0} />
          </div>
        )}
      />
    </div>
  );
}
