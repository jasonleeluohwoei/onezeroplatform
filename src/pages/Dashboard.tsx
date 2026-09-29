import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  Layers,
  Camera,
  CalendarDays,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  Bell,
  CheckCircle2,
  Film,
  Lightbulb,
  Scissors,
  Building2,
  FileText,
} from 'lucide-react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { Card, SectionHeader, Stat, Badge, Progress, Avatar, Empty, cx } from '../components/ui';
import { LEAD_STAGES, toneOf, TONE_DOT } from '../data/schema';
import { addDays, daysUntil, fmtDate, fmtDateShort, lastNMonths, money, moneyShort, monthKey, todayISO } from '../lib/format';
import { WorkflowStrip } from '../components/WorkflowStrip';

export default function Dashboard() {
  const { db } = useData();
  const { t, lang } = useI18n();
  const today = todayISO();

  const m = useMemo(() => {
    const mk = monthKey(today);
    const activeClients = db.clients.filter((c) => c.status === 'Active').length;
    const newClients = db.clients.filter((c) => monthKey(c.startDate) === mk).length;
    const expiring = db.subscriptions.filter((s) => {
      const d = daysUntil(s.endDate);
      return d !== null && d >= 0 && d <= 60 && s.status !== 'Expired' && s.status !== 'Cancelled';
    }).length;

    const monthlyRevenue = db.payments
      .filter((p) => monthKey(p.paymentDate) === mk)
      .reduce((a, p) => a + (p.paidAmount || 0), 0);
    const outstanding = db.payments
      .filter((p) => p.status !== 'Paid')
      .reduce((a, p) => a + Math.max(0, (p.amount || 0) - (p.paidAmount || 0)), 0);
    const overdue = db.payments
      .filter((p) => p.status === 'Overdue')
      .reduce((a, p) => a + Math.max(0, (p.amount || 0) - (p.paidAmount || 0)), 0);
    const mrr = db.subscriptions
      .filter((s) => s.status === 'Active' || s.status === 'Expiring')
      .reduce((a, s) => a + (s.monthlyFee || 0), 0);

    const pendingProposals = db.proposals.filter((p) =>
      ['Idea', 'Draft', 'Internal Review', 'Sent to Client', 'Client Review'].includes(p.status)
    ).length;
    const approvedContent = db.proposals.filter((p) => p.status === 'Approved' || p.status === 'Production').length;
    const shootingProjects = db.shootings.filter((s) => ['Planning', 'Confirmed', 'Shooting'].includes(s.status)).length;
    const editingProjects = db.videos.filter((v) => ['Footage', 'Editing', 'Draft V1', 'Revision V2'].includes(v.status)).length;
    const pendingReview = db.videos.filter((v) => v.status === 'Client Review').length;
    const finalVideos = db.videos.filter((v) => v.status === 'Final Approved' || v.status === 'Published').length;

    const openTasks = db.tasks.filter((x) => x.status !== 'Done');
    const overdueTasks = openTasks.filter((x) => {
      const d = daysUntil(x.dueDate);
      return d !== null && d < 0;
    });
    const todaysTasks = openTasks.filter((x) => x.dueDate === today);
    const upcomingDeadlines = openTasks
      .filter((x) => {
        const d = daysUntil(x.dueDate);
        return d !== null && d >= 0 && d <= 7;
      })
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

    const upcomingShootings = db.shootings
      .filter((s) => {
        const d = daysUntil(s.shootingDate);
        return d !== null && d >= -1 && d <= 30;
      })
      .sort((a, b) => (a.shootingDate > b.shootingDate ? 1 : -1));

    const eqInUse = db.equipment.filter((e) => e.status === 'In Use' || e.status === 'Borrowed').length;
    const eqMaint = db.equipment.filter((e) => e.status === 'Maintenance').length;

    const openLeads = db.leads.filter((l) => !l.stage.startsWith('Lost') && l.stage !== 'Won / Converted');
    const won = db.leads.filter((l) => l.stage === 'Won / Converted');
    const lost = db.leads.filter((l) => l.stage.startsWith('Lost'));
    const newLeadsMonth = db.leads.filter((l) => monthKey(l.dateAdded) === mk).length;
    const proposalsSent = db.leads.filter((l) => l.proposalDate).length;
    const followUpsToday = openLeads.filter((l) => l.nextFollowUpDate === today);
    const followUpsOverdue = openLeads.filter((l) => {
      const d = daysUntil(l.nextFollowUpDate);
      return d !== null && d < 0;
    });
    const potentialRevenue = openLeads.reduce((a, l) => a + (l.estimatedBudget || 0) * ((l.probability || 0) / 100), 0);

    const workload = db.staff
      .filter((s) => s.status === 'Active')
      .map((s) => ({
        name: s.name,
        role: s.role,
        open: db.tasks.filter((x) => x.assigneeId === s.id && x.status !== 'Done').length,
        overdue: db.tasks.filter((x) => x.assigneeId === s.id && x.status !== 'Done' && (daysUntil(x.dueDate) ?? 0) < 0).length,
      }))
      .sort((a, b) => b.open - a.open);

    const months = lastNMonths(6).map((mo) => ({
      label: mo.label,
      value: db.payments.filter((p) => monthKey(p.paymentDate) === mo.key).reduce((a, p) => a + (p.paidAmount || 0), 0),
    }));

    const stageCounts = LEAD_STAGES.map((s) => ({
      stage: s,
      count: db.leads.filter((l) => l.stage === s).length,
      value: db.leads.filter((l) => l.stage === s).reduce((a, l) => a + (l.estimatedBudget || 0), 0),
    }));

    const reminders = openLeads
      .map((l) => {
        const d = daysUntil(l.nextFollowUpDate);
        return { lead: l, d };
      })
      .filter((x) => x.d !== null && x.d! <= 3)
      .sort((a, b) => (a.d ?? 0) - (b.d ?? 0));

    const contentPipeline = [
      { label: t('dashboard.pendingProposals'), value: pendingProposals, tone: 'amber' },
      { label: t('dashboard.approvedContent'), value: approvedContent, tone: 'green' },
      { label: t('dashboard.shootingProjects'), value: shootingProjects, tone: 'blue' },
      { label: t('dashboard.editingProjects'), value: editingProjects, tone: 'purple' },
      { label: t('dashboard.pendingClientReview'), value: pendingReview, tone: 'amber' },
      { label: t('dashboard.finalVideos'), value: finalVideos, tone: 'green' },
    ];

    return {
      activeClients,
      newClients,
      expiring,
      monthlyRevenue,
      outstanding,
      overdue,
      mrr,
      pendingProposals,
      approvedContent,
      shootingProjects,
      editingProjects,
      pendingReview,
      finalVideos,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      todaysTasks,
      upcomingDeadlines,
      upcomingShootings,
      eqTotal: db.equipment.length,
      eqInUse,
      eqMaint,
      totalLeads: db.leads.length,
      openLeads: openLeads.length,
      newLeadsMonth,
      proposalsSent,
      followUpsToday: followUpsToday.length,
      followUpsOverdue: followUpsOverdue.length,
      won: won.length,
      lost: lost.length,
      potentialRevenue,
      workload,
      months,
      stageCounts,
      reminders,
      contentPipeline,
      recentPayments: [...db.payments]
        .filter((p) => p.status !== 'Paid')
        .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
        .slice(0, 5),
    };
  }, [db, today, t]);

  const clientName = (id: string) => db.clients.find((c) => c.id === id)?.name || '—';
  const staffName = (id: string) => db.staff.find((s) => s.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">{t('nav.dashboard')}</h1>
        <p className="text-[13.5px] text-ink-500 mt-0.5 dark:text-ink-300">{t('dashboard.sub')}</p>
      </div>

      <WorkflowStrip />

      {/* Clients + Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader
            title={t('dashboard.clients')}
            action={
              <Link to="/clients" className="text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
                {t('common.view')} →
              </Link>
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t('dashboard.activeClients')} value={m.activeClients} icon={Building2} tone="green" />
            <Stat label={t('dashboard.newClients')} value={m.newClients} icon={Users} tone="blue" />
            <Stat label={t('dashboard.expiringContracts')} value={m.expiring} icon={AlertCircle} tone="amber" />
          </div>
        </Card>

        <Card>
          <SectionHeader
            title={t('dashboard.finance')}
            action={
              <Link to="/payments" className="text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
                {t('common.view')} →
              </Link>
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t('dashboard.monthlyRevenue')} value={moneyShort(m.monthlyRevenue)} icon={Wallet} tone="green" />
            <Stat label={t('dashboard.outstanding')} value={moneyShort(m.outstanding)} icon={FileText} tone="amber" />
            <Stat label={t('dashboard.overduePayment')} value={moneyShort(m.overdue)} icon={AlertCircle} tone="red" />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-[12px] bg-ink-50 px-3.5 py-2.5 dark:bg-white/[0.05]">
            <span className="text-[12.5px] font-medium text-ink-600 dark:text-ink-200">{t('dashboard.mrr')}</span>
            <span className="text-[15px] font-semibold tabular-nums text-ink-900 dark:text-white">{money(m.mrr)}</span>
          </div>
        </Card>
      </div>

      {/* Revenue trend + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionHeader title={t('dashboard.revenueTrend')} sub={t('dashboard.last6Months')} />
          <BarChart data={m.months} />
        </Card>
        <Card>
          <SectionHeader title={t('dashboard.contentPipeline')} />
          <div className="space-y-3">
            {m.contentPipeline.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-ink-600 truncate dark:text-ink-200">{p.label}</div>
                </div>
                <div className="text-[15px] font-semibold tabular-nums text-ink-900 w-9 text-right dark:text-white">{p.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leads */}
      <Card>
        <SectionHeader
          title={t('dashboard.leadsOverview')}
          sub={`${m.totalLeads} ${t('leads.pipeline')}`}
          action={
            <Link to="/leads" className="text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
              {t('common.view')} →
            </Link>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <Stat label={t('dashboard.totalLeads')} value={m.totalLeads} tone="blue" />
          <Stat label={t('dashboard.newLeadsThisMonth')} value={m.newLeadsMonth} tone="blue" />
          <Stat label={t('dashboard.activeLeads')} value={m.openLeads} tone="purple" />
          <Stat label={t('dashboard.proposalsSent')} value={m.proposalsSent} tone="amber" />
          <Stat label={t('dashboard.followUpsDueToday')} value={m.followUpsToday} tone="amber" />
          <Stat label={t('dashboard.overdueFollowUps')} value={m.followUpsOverdue} tone="red" />
          <Stat label={t('dashboard.wonClients')} value={m.won} tone="green" />
          <Stat label={t('dashboard.lostLeads')} value={m.lost} tone="red" />
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="text-[12px] font-medium text-ink-500 mb-2 dark:text-ink-300">{t('leads.byStage')}</div>
            <div className="space-y-2">
              {m.stageCounts.map((s) => {
                const max = Math.max(1, ...m.stageCounts.map((x) => x.count));
                return (
                  <div key={s.stage} className="flex items-center gap-2.5">
                    <span className={cx('h-2 w-2 rounded-full shrink-0', TONE_DOT[toneOf(s.stage)])} />
                    <span className="text-[12px] text-ink-600 w-[130px] truncate dark:text-ink-200">{s.stage}</span>
                    <div className="flex-1">
                      <Progress value={(s.count / max) * 100} height={6} tone={s.count ? 'blue' : 'gray'} />
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums w-6 text-right text-ink-800 dark:text-white">
                      {s.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-ink-500 dark:text-ink-300">{t('dashboard.followUpReminders')}</span>
              <span className="text-[12px] font-semibold text-brand-600 dark:text-brand-300">
                {t('dashboard.potentialRevenue')}: {moneyShort(m.potentialRevenue)}
              </span>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {m.reminders.length === 0 && (
                <div className="text-[12.5px] text-ink-400 py-4 text-center">{t('common.noData')}</div>
              )}
              {m.reminders.slice(0, 6).map(({ lead, d }) => {
                const overdue = (d ?? 0) < 0;
                const due = d === 0;
                return (
                  <Link
                    key={lead.id}
                    to="/leads"
                    className={cx(
                      'flex items-center gap-2.5 rounded-[11px] px-3 py-2 ring-1 transition',
                      overdue
                        ? 'bg-rose-50/70 ring-rose-200/70 dark:bg-rose-500/10 dark:ring-rose-500/20'
                        : due
                        ? 'bg-amber-50/70 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20'
                        : 'bg-ink-50 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/[0.08]'
                    )}
                  >
                    <Bell size={14} className={cx(overdue ? 'text-rose-500' : due ? 'text-amber-500' : 'text-ink-400')} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium text-ink-800 truncate dark:text-white">{lead.companyName}</div>
                      <div className="text-[11px] text-ink-500 dark:text-ink-300">
                        {overdue
                          ? t('leads.followUpOverdue', { n: Math.abs(d ?? 0) })
                          : due
                          ? t('leads.followUpToday')
                          : t('common.inDays', { n: d })}
                      </div>
                    </div>
                    <Badge value={lead.stage} dot={false} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Content + Team + Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionHeader title={t('dashboard.content')} />
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t('dashboard.pendingProposals')} value={m.pendingProposals} icon={Lightbulb} tone="amber" />
            <Stat label={t('dashboard.approvedContent')} value={m.approvedContent} icon={CheckCircle2} tone="green" />
            <Stat label={t('dashboard.shootingProjects')} value={m.shootingProjects} icon={Camera} tone="blue" />
            <Stat label={t('dashboard.editingProjects')} value={m.editingProjects} icon={Scissors} tone="purple" />
            <Stat label={t('dashboard.pendingClientReview')} value={m.pendingReview} icon={Clock} tone="amber" />
            <Stat label={t('dashboard.finalVideos')} value={m.finalVideos} icon={Film} tone="green" />
          </div>
        </Card>

        <Card>
          <SectionHeader title={t('dashboard.team')} sub={t('dashboard.workloadHint')} />
          <div className="space-y-2.5 mb-4 max-h-[190px] overflow-y-auto pr-1">
            {m.workload.slice(0, 6).map((w) => (
              <div key={w.name} className="flex items-center gap-2.5">
                <Avatar name={w.name} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-ink-800 truncate dark:text-white">{w.name}</div>
                  <div className="text-[10.5px] text-ink-400 truncate">{w.role}</div>
                </div>
                <div className="w-[70px]">
                  <Progress value={(w.open / 8) * 100} tone={w.overdue ? 'red' : w.open > 4 ? 'amber' : 'green'} height={5} />
                </div>
                <span className="text-[12px] font-semibold tabular-nums w-5 text-right text-ink-700 dark:text-ink-100">
                  {w.open}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t('dashboard.pendingTasks')} value={m.openTasks} icon={Layers} tone="blue" />
            <Stat label={t('dashboard.upcomingDeadlines')} value={m.upcomingDeadlines.length} icon={Clock} tone="amber" />
          </div>
        </Card>

        <Card>
          <SectionHeader title={t('dashboard.equipment')} />
          <div className="grid grid-cols-1 gap-3">
            <Stat label={t('dashboard.totalEquipment')} value={m.eqTotal} icon={Camera} tone="gray" />
            <Stat label={t('dashboard.equipmentInUse')} value={m.eqInUse} icon={TrendingUp} tone="blue" />
            <Stat label={t('dashboard.equipmentMaintenance')} value={m.eqMaint} icon={AlertCircle} tone="amber" />
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader
            title={t('dashboard.todaysTasks')}
            action={
              <Link to="/timeline" className="text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
                {t('common.view')} →
              </Link>
            }
          />
          {m.todaysTasks.length === 0 ? (
            <Empty title={t('dashboard.noTasks')} icon={CalendarDays} />
          ) : (
            <div className="space-y-2">
              {m.todaysTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 rounded-[11px] bg-ink-50 px-3 py-2.5 dark:bg-white/[0.05]"
                >
                  <span
                    className={cx(
                      'h-2 w-2 rounded-full shrink-0',
                      task.priority === 'Urgent' ? 'bg-rose-500' : task.priority === 'High' ? 'bg-amber-500' : 'bg-ink-300'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-ink-800 truncate dark:text-white">{task.title}</div>
                    <div className="text-[11px] text-ink-500 dark:text-ink-300">
                      {clientName(task.clientId)} · {staffName(task.assigneeId)}
                    </div>
                  </div>
                  <Badge value={task.status} dot={false} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title={t('dashboard.upcomingShootings')}
            action={
              <Link to="/shootings" className="text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
                {t('common.view')} →
              </Link>
            }
          />
          {m.upcomingShootings.length === 0 ? (
            <Empty title={t('dashboard.upcomingShootingsEmpty')} icon={Camera} />
          ) : (
            <div className="space-y-2">
              {m.upcomingShootings.slice(0, 5).map((s) => {
                const d = daysUntil(s.shootingDate);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-[11px] bg-ink-50 px-3 py-2.5 dark:bg-white/[0.05]">
                    <div className="h-9 w-9 rounded-[10px] bg-white flex flex-col items-center justify-center shrink-0 ring-1 ring-black/[0.05] dark:bg-white/[0.08] dark:ring-white/10">
                      <span className="text-[13px] font-semibold leading-none text-ink-900 dark:text-white">
                        {new Date(s.shootingDate).getDate()}
                      </span>
                      <span className="text-[9px] text-ink-400 uppercase">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
                          new Date(s.shootingDate).getMonth()
                        ]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-ink-800 truncate dark:text-white">{s.projectName}</div>
                      <div className="text-[11px] text-ink-500 truncate dark:text-ink-300">
                        {clientName(s.clientId)} · {s.location}
                      </div>
                    </div>
                    <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0 dark:text-ink-300">
                      {d === 0 ? t('common.today') : d === 1 ? t('common.tomorrow') : t('common.inDays', { n: d })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Outstanding payments */}
      <Card>
        <SectionHeader title={t('dashboard.outstanding')} sub={`${t('dashboard.overduePayment')}: ${money(m.overdue)}`} />
        {m.recentPayments.length === 0 ? (
          <Empty title={t('common.noData')} icon={Wallet} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="text-left px-2 py-2 text-[11.5px] uppercase tracking-wide text-ink-500 font-semibold">Invoice</th>
                  <th className="text-left px-2 py-2 text-[11.5px] uppercase tracking-wide text-ink-500 font-semibold">Client</th>
                  <th className="text-left px-2 py-2 text-[11.5px] uppercase tracking-wide text-ink-500 font-semibold">Due</th>
                  <th className="text-right px-2 py-2 text-[11.5px] uppercase tracking-wide text-ink-500 font-semibold">Amount</th>
                  <th className="text-left px-2 py-2 text-[11.5px] uppercase tracking-wide text-ink-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {m.recentPayments.map((p) => {
                  const d = daysUntil(p.dueDate);
                  return (
                    <tr key={p.id} className="border-b border-black/[0.04] last:border-0 dark:border-white/[0.05]">
                      <td className="px-2 py-2 font-medium">{p.invoiceNo}</td>
                      <td className="px-2 py-2 text-ink-600 dark:text-ink-200">{clientName(p.clientId)}</td>
                      <td className="px-2 py-2 tabular-nums text-ink-600 dark:text-ink-200">
                        {fmtDateShort(p.dueDate, lang)}
                        {d !== null && d < 0 && <span className="ml-1.5 text-[11px] text-rose-500">{Math.abs(d)}d late</span>}
                      </td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums">{money(p.amount - (p.paidAmount || 0))}</td>
                      <td className="px-2 py-2">
                        <Badge value={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* --------------------------------- Charts -------------------------------- */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2.5 h-[160px] pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-[8px] bg-gradient-to-t from-brand-500/70 to-brand-500 transition-all duration-500 group-hover:from-brand-600 group-hover:to-brand-500 dark:from-brand-500/60 dark:to-brand-400"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-ink-700 whitespace-nowrap dark:text-white">
              {moneyShort(d.value)}
            </div>
          </div>
          <span className="text-[11px] text-ink-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
