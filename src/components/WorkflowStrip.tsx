import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n';
import { cx } from './ui';

const STEPS = [
  { en: 'Lead', zh: '潜客', to: '/leads' },
  { en: 'Sales Pipeline', zh: '销售管线', to: '/leads' },
  { en: 'Client', zh: '客户', to: '/clients' },
  { en: 'Subscription', zh: '订阅配套', to: '/subscriptions' },
  { en: 'Content Proposal', zh: '内容提案', to: '/proposals' },
  { en: 'Production', zh: '制作筹备', to: '/shootings' },
  { en: 'Shooting', zh: '拍摄', to: '/shootings' },
  { en: 'Media', zh: '素材', to: '/media' },
  { en: 'Editing', zh: '剪辑', to: '/videos' },
  { en: 'Delivery', zh: '交付', to: '/videos' },
  { en: 'Payment', zh: '收款', to: '/payments' },
  { en: 'Renewal', zh: '续约', to: '/subscriptions' },
];

export function WorkflowStrip() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  return (
    <div className="rounded-[16px] bg-white p-4 ring-1 ring-black/[0.05] shadow-card dark:bg-[#1c1c1e] dark:ring-white/[0.08]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">{t('workflow.title')}</h2>
        <span className="text-[11.5px] text-ink-400">{t('workflow.subtitle')}</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.en}>
            <button
              onClick={() => nav(s.to)}
              className={cx(
                'shrink-0 rounded-[10px] px-2.5 py-1.5 text-[12px] font-medium ring-1 transition',
                'bg-ink-50 text-ink-700 ring-black/[0.04] hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200',
                'dark:bg-white/[0.06] dark:text-ink-100 dark:ring-white/[0.08] dark:hover:bg-brand-500/15 dark:hover:text-brand-200'
              )}
            >
              {lang === 'zh' ? s.zh : s.en}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={13} className="shrink-0 text-ink-300" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
