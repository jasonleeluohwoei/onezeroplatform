import React, { useMemo } from 'react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { monthKey, moneyShort, todayISO } from '../lib/format';
import { Wallet, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export default function Payments() {
  const { db } = useData();
  const { t } = useI18n();
  const mk = monthKey(todayISO());

  const stats = useMemo(() => {
    const paid = db.payments.filter((p) => p.status === 'Paid');
    const monthCollected = paid.filter((p) => monthKey(p.paymentDate) === mk).reduce((a, p) => a + (p.paidAmount || 0), 0);
    const outstanding = db.payments
      .filter((p) => p.status !== 'Paid')
      .reduce((a, p) => a + Math.max(0, (p.amount || 0) - (p.paidAmount || 0)), 0);
    const overdue = db.payments
      .filter((p) => p.status === 'Overdue')
      .reduce((a, p) => a + Math.max(0, (p.amount || 0) - (p.paidAmount || 0)), 0);
    const totalCollected = paid.reduce((a, p) => a + (p.paidAmount || 0), 0);
    return [
      { label: t('dashboard.monthlyRevenue'), value: moneyShort(monthCollected), tone: 'green' as const, icon: TrendingUp },
      { label: t('dashboard.outstanding'), value: moneyShort(outstanding), tone: 'amber' as const, icon: Clock },
      { label: t('dashboard.overduePayment'), value: moneyShort(overdue), tone: 'red' as const, icon: AlertCircle },
      { label: 'Total Collected', value: moneyShort(totalCollected), tone: 'blue' as const, icon: Wallet },
    ];
  }, [db, t, mk]);

  return (
    <div className="space-y-5">
      <StatsStrip items={stats} cols={4} />
      <EntityPage entity="payments" defaultView="board" subtitle={`${db.payments.length} ${t('common.records')}`} />
    </div>
  );
}
