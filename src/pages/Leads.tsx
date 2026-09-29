import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Bell, TrendingUp, CheckCircle2, XCircle, FileText, Users, RefreshCw } from 'lucide-react';
import { useData } from '../data/store';
import { useI18n } from '../i18n';
import { EntityPage } from '../components/EntityPage';
import { StatsStrip } from '../components/StatsStrip';
import { Badge, Btn, Card, Modal, Progress, SectionHeader, cx } from '../components/ui';
import { SelectInput, TextArea, TextInput, labelCls } from '../components/form';
import { LEAD_STAGES, TONE_DOT, toneOf } from '../data/schema';
import { addDays, daysSince, daysUntil, money, moneyShort, monthKey, todayISO, uid } from '../lib/format';

export default function Leads() {
  const { db, upsert, toast } = useData();
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const today = todayISO();

  const [logLead, setLogLead] = useState<any | null>(null);
  const [logForm, setLogForm] = useState<any>({ type: 'WhatsApp Follow-up', note: '', date: today, next: '' });

  const m = useMemo(() => {
    const open = db.leads.filter((l) => !l.stage.startsWith('Lost') && l.stage !== 'Won / Converted');
    const won = db.leads.filter((l) => l.stage === 'Won / Converted');
    const lost = db.leads.filter((l) => l.stage.startsWith('Lost'));
    const mk = monthKey(today);
    const potential = open.reduce((a, l) => a + (l.estimatedBudget || 0) * ((l.probability || 0) / 100), 0);

    const withDays = open
      .map((l) => ({ lead: l, d: daysUntil(l.nextFollowUpDate) }))
      .filter((x) => x.d !== null)
      .sort((a, b) => (a.d ?? 0) - (b.d ?? 0));

    const overdue = withDays.filter((x) => (x.d ?? 0) < 0);
    const dueToday = withDays.filter((x) => x.d === 0);
    const upcoming = withDays.filter((x) => (x.d ?? 0) > 0 && (x.d ?? 0) <= 7);
    const noContact = open
      .map((l) => ({ lead: l, d: daysSince(l.lastContactDate) ?? 0 }))
      .filter((x) => x.d >= 7)
      .sort((a, b) => b.d - a.d);

    const bySource: Record<string, number> = {};
    db.leads.forEach((l) => (bySource[l.leadSource] = (bySource[l.leadSource] || 0) + 1));

    const byOwner: Record<string, { count: number; value: number }> = {};
    open.forEach((l) => {
      const k = l.assignedTo || '';
      byOwner[k] = byOwner[k] || { count: 0, value: 0 };
      byOwner[k].count += 1;
      byOwner[k].value += l.estimatedBudget || 0;
    });

    return {
      total: db.leads.length,
      open: open.length,
      newMonth: db.leads.filter((l) => monthKey(l.dateAdded) === mk).length,
      proposalsSent: db.leads.filter((l) => l.proposalDate).length,
      won: won.length,
      lost: lost.length,
      potential,
      overdue,
      dueToday,
      upcoming,
      noContact,
      bySource,
      byOwner,
      stages: LEAD_STAGES.map((s) => ({ stage: s, count: db.leads.filter((l) => l.stage === s).length })),
    };
  }, [db, today]);

  const staffName = (id: string) => db.staff.find((s) => s.id === id)?.name || '—';

  const convert = (lead: any) => {
    const budget = lead.quotationAmount || lead.estimatedBudget || 0;
    const clientId = upsert('clients', {
      name: lead.companyName,
      companyReg: '',
      contactPerson: lead.contactPerson,
      contactPosition: lead.position,
      phone: lead.phone,
      email: lead.email,
      socialAccounts: lead.socialAccount ? [lead.socialAccount] : [],
      industry: lead.industry,
      website: lead.website,
      location: lead.location,
      startDate: today,
      status: 'Onboarding',
      accountManagerId: lead.assignedTo,
      teamIds: [],
      notes: `Converted from lead on ${today}. ${lead.notes || ''}`,
    });

    upsert('subscriptions', {
      clientId,
      packageName: lead.proposedPackage || 'Monthly Content Package',
      services: lead.interestedServices || [],
      monthlyFee: budget,
      contractAmount: budget * 12,
      billingCycle: 'Monthly',
      contentPerMonth: 12,
      videosPerMonth: 4,
      photosPerMonth: 20,
      shootsPerMonth: 1,
      usedContent: 0,
      usedVideos: 0,
      usedPhotos: 0,
      usedShoots: 0,
      startDate: lead.expectedStartDate || today,
      endDate: addDays(today, 365),
      status: 'Active',
      autoRenew: true,
      notes: 'Auto-created from converted lead.',
    });

    upsert('leads', { ...lead, stage: 'Won / Converted', contractStatus: 'Signed', approvalStatus: 'Approved' });
    toast(t('leads.converted'));
    nav('/clients');
  };

  const saveLog = () => {
    if (!logLead) return;
    const activity = { id: uid(), date: logForm.date || today, type: logForm.type, note: logForm.note, by: staffName(logLead.assignedTo) };
    upsert('leads', {
      ...logLead,
      activities: [...(logLead.activities || []), activity],
      lastContactDate: logForm.date || today,
      nextFollowUpDate: logForm.next || logLead.nextFollowUpDate,
    });
    setLogLead(null);
    toast(t('leads.activityLogged'));
  };

  return (
    <div className="space-y-5">
      <StatsStrip
        items={[
          { label: t('dashboard.totalLeads'), value: m.total, tone: 'blue', icon: Target },
          { label: t('dashboard.newLeadsThisMonth'), value: m.newMonth, tone: 'blue', icon: Users },
          { label: t('dashboard.activeLeads'), value: m.open, tone: 'purple', icon: TrendingUp },
          { label: t('dashboard.proposalsSent'), value: m.proposalsSent, tone: 'amber', icon: FileText },
          { label: t('dashboard.followUpsDueToday'), value: m.dueToday.length, tone: 'amber', icon: Bell },
          { label: t('dashboard.overdueFollowUps'), value: m.overdue.length, tone: 'red', icon: Bell },
          { label: t('dashboard.wonClients'), value: m.won, tone: 'green', icon: CheckCircle2 },
          { label: t('dashboard.lostLeads'), value: m.lost, tone: 'red', icon: XCircle },
        ]}
        cols={4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reminders */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title={t('dashboard.followUpReminders')}
            sub={`${t('dashboard.potentialRevenue')}: ${moneyShort(m.potential)}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReminderGroup title={t('common.overdue')} tone="red" items={m.overdue} onLog={setLogLead} t={t} staffName={staffName} />
            <ReminderGroup title={t('common.dueToday')} tone="amber" items={m.dueToday} onLog={setLogLead} t={t} staffName={staffName} />
            <ReminderGroup title={t('common.upcoming')} tone="blue" items={m.upcoming} onLog={setLogLead} t={t} staffName={staffName} />
          </div>
          {m.noContact.length > 0 && (
            <div className="mt-4 rounded-[12px] bg-ink-50 p-3 dark:bg-white/[0.05]">
              <div className="text-[12px] font-semibold text-ink-600 mb-2 dark:text-ink-200">
                {t('leads.noContact')} 7+ {t('leads.days')}
              </div>
              <div className="space-y-1.5">
                {m.noContact.slice(0, 4).map(({ lead, d }) => (
                  <div key={lead.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className="text-ink-700 truncate dark:text-ink-100">{lead.companyName}</span>
                    <span className="text-ink-400 shrink-0">
                      {d} {t('leads.days')}
                    </span>
                    <Btn size="xs" variant="outline" onClick={() => setLogLead(lead)}>
                      {t('leads.followUp')}
                    </Btn>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Source analysis */}
        <Card>
          <SectionHeader title={t('leads.bySource')} />
          <div className="space-y-2">
            {Object.entries(m.bySource)
              .sort((a, b) => b[1] - a[1])
              .map(([src, count]) => {
                const max = Math.max(...Object.values(m.bySource));
                return (
                  <div key={src} className="flex items-center gap-2.5">
                    <span className="text-[12px] text-ink-600 w-[92px] truncate dark:text-ink-200">{src}</span>
                    <div className="flex-1">
                      <Progress value={(count / max) * 100} height={6} tone="blue" />
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums w-5 text-right text-ink-800 dark:text-white">{count}</span>
                  </div>
                );
              })}
          </div>
          <div className="mt-5">
            <div className="text-[12px] font-medium text-ink-500 mb-2 dark:text-ink-300">{t('leads.byStage')}</div>
            <div className="flex flex-wrap gap-1.5">
              {m.stages.map((s) => (
                <span
                  key={s.stage}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-[3px] text-[11px] font-medium text-ink-600 dark:bg-white/10 dark:text-ink-200"
                >
                  <span className={cx('h-1.5 w-1.5 rounded-full', TONE_DOT[toneOf(s.stage)])} />
                  {s.stage} · {s.count}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <EntityPage
        entity="leads"
        defaultView="board"
        subtitle={`${db.leads.length} ${t('common.records')}`}
        initialForm={{ dateAdded: today, stage: 'New Lead', probability: 30 }}
        renderExtraActions={(row) =>
          row.stage === 'Won / Converted' ? (
            <button
              onClick={() => convert(row)}
              title={t('leads.convert')}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/15"
            >
              <RefreshCw size={14} />
            </button>
          ) : (
            <button
              onClick={() => setLogLead(row)}
              title={t('leads.addActivity')}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-white/10"
            >
              <Bell size={14} />
            </button>
          )
        }
        cardExtra={(row) => (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11.5px] font-medium text-ink-700 dark:text-ink-100">{money(row.estimatedBudget)}</span>
            <span className="text-[11px] text-ink-400">{row.probability}%</span>
            {row.nextFollowUpDate && (
              <span className="text-[10.5px] text-ink-400 tabular-nums">{row.nextFollowUpDate.slice(5)}</span>
            )}
          </div>
        )}
      />

      {/* Log activity modal */}
      <Modal
        open={!!logLead}
        onClose={() => setLogLead(null)}
        title={t('leads.addActivity') + (logLead ? ` — ${logLead.companyName}` : '')}
        width="max-w-lg"
        footer={
          <>
            <Btn variant="subtle" onClick={() => setLogLead(null)}>
              {t('common.cancel')}
            </Btn>
            <Btn variant="primary" onClick={saveLog}>
              {t('common.save')}
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{t('leads.followUp')} type</label>
            <SelectInput
              value={logForm.type}
              onChange={(v) => setLogForm({ ...logForm, type: v })}
              options={[
                'Initial Contact',
                'WhatsApp Follow-up',
                'Call',
                'Email',
                'Meeting',
                'Proposal Sent',
                'Quotation Sent',
                'Revision Requested',
                'Negotiation',
                'Contract Signed',
                'Other',
              ]}
            />
          </div>
          <div>
            <label className={labelCls}>{t('common.date')}</label>
            <TextInput type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('common.notes')}</label>
            <TextArea value={logForm.note} onChange={(e) => setLogForm({ ...logForm, note: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('leads.nextFollowUp')}</label>
            <TextInput type="date" value={logForm.next} onChange={(e) => setLogForm({ ...logForm, next: e.target.value })} />
          </div>
          {logLead && (logLead.activities || []).length > 0 && (
            <div className="rounded-[12px] bg-ink-50 p-3 dark:bg-white/[0.05]">
              <div className="text-[12px] font-semibold text-ink-600 mb-2 dark:text-ink-200">{t('leads.pipeline')} history</div>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {[...(logLead.activities || [])]
                  .sort((a: any, b: any) => (a.date > b.date ? -1 : 1))
                  .map((a: any) => (
                    <div key={a.id} className="flex gap-2.5">
                      <span className="text-[11px] text-ink-400 tabular-nums w-[46px] shrink-0">{a.date?.slice(5)}</span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-ink-800 dark:text-white">{a.type}</div>
                        {a.note && <div className="text-[11.5px] text-ink-500 dark:text-ink-300">{a.note}</div>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ReminderGroup({
  title,
  tone,
  items,
  onLog,
  t,
  staffName,
}: {
  title: string;
  tone: 'red' | 'amber' | 'blue';
  items: { lead: any; d: number | null }[];
  onLog: (lead: any) => void;
  t: (k: string, v?: any) => string;
  staffName: (id: string) => string;
}) {
  const toneCls = {
    red: 'bg-rose-50/70 ring-rose-200/70 dark:bg-rose-500/10 dark:ring-rose-500/20',
    amber: 'bg-amber-50/70 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20',
    blue: 'bg-ink-50 ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/[0.08]',
  }[tone];
  return (
    <div className={cx('rounded-[12px] p-3 ring-1', toneCls)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-100">{title}</span>
        <span className="text-[11px] text-ink-400">{items.length}</span>
      </div>
      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
        {items.length === 0 && <div className="text-[11.5px] text-ink-400 py-2">—</div>}
        {items.slice(0, 5).map(({ lead, d }) => (
          <div key={lead.id}>
            <div className="text-[12px] font-medium text-ink-800 truncate dark:text-white">{lead.companyName}</div>
            <div className="text-[10.5px] text-ink-500 dark:text-ink-300">
              {d !== null && d < 0 ? t('leads.followUpOverdue', { n: Math.abs(d) }) : d === 0 ? t('leads.followUpToday') : t('common.inDays', { n: d })}
              {' · '}
              {staffName(lead.assignedTo)}
            </div>
            <Btn size="xs" variant="outline" className="mt-1" onClick={() => onLog(lead)}>
              {t('leads.followUp')}
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}
