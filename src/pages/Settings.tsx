import React, { useRef } from 'react';
import { Download, Upload, Database, Trash2, Languages, Sun, Moon, Info, Check } from 'lucide-react';
import { useData } from '../data/store';
import { useI18n, useTheme } from '../i18n';
import { Btn, Card, SectionHeader, cx } from '../components/ui';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { db, reset, clearAll, importDb, storageKB, toast } = useData();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `agencyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast(t('common.exportJson'));
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importDb(JSON.parse(String(reader.result)));
        toast(t('common.importJson'));
      } catch {
        toast('Invalid file', 'warn');
      }
    };
    reader.readAsText(f);
  };

  const counts = [
    ['staff', db.staff.length],
    ['clients', db.clients.length],
    ['leads', db.leads.length],
    ['subscriptions', db.subscriptions.length],
    ['payments', db.payments.length],
    ['proposals', db.proposals.length],
    ['shootings', db.shootings.length],
    ['media', db.media.length],
    ['videos', db.videos.length],
    ['tasks', db.tasks.length],
    ['equipment', db.equipment.length],
    ['learning', db.learning.length],
  ] as const;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white">{t('settings.title')}</h1>
        <p className="text-[13.5px] text-ink-500 mt-0.5 dark:text-ink-300">{t('settings.aboutTitle')}</p>
      </div>

      {/* Language */}
      <Card>
        <SectionHeader title={t('settings.langTitle')} sub={t('settings.langHint')} />
        <div className="grid grid-cols-2 gap-3">
          {(['en', 'zh'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cx(
                'flex items-center justify-between rounded-[14px] p-4 ring-1 transition',
                lang === l
                  ? 'bg-brand-50 ring-brand-300 dark:bg-brand-500/15 dark:ring-brand-500/40'
                  : 'bg-ink-50/70 ring-black/[0.04] hover:bg-ink-100 dark:bg-white/[0.04] dark:ring-white/[0.08]'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Languages size={17} className="text-brand-600 dark:text-brand-300" />
                <span className="text-[14px] font-medium text-ink-900 dark:text-white">
                  {l === 'en' ? 'English (Primary)' : '中文 Chinese'}
                </span>
              </span>
              {lang === l && <Check size={17} className="text-brand-600 dark:text-brand-300" />}
            </button>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <SectionHeader title={t('settings.themeTitle')} sub={t('settings.themeHint')} />
        <div className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              className={cx(
                'flex items-center justify-between rounded-[14px] p-4 ring-1 transition',
                theme === th
                  ? 'bg-brand-50 ring-brand-300 dark:bg-brand-500/15 dark:ring-brand-500/40'
                  : 'bg-ink-50/70 ring-black/[0.04] hover:bg-ink-100 dark:bg-white/[0.04] dark:ring-white/[0.08]'
              )}
            >
              <span className="flex items-center gap-2.5">
                {th === 'light' ? <Sun size={17} /> : <Moon size={17} />}
                <span className="text-[14px] font-medium text-ink-900 dark:text-white">
                  {th === 'light' ? t('settings.light') : t('settings.dark')}
                </span>
              </span>
              {theme === th && <Check size={17} className="text-brand-600 dark:text-brand-300" />}
            </button>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <SectionHeader title={t('settings.dataTitle')} sub={t('settings.dataHint')} />
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Btn variant="outline" icon={Download} onClick={exportJson}>
            {t('common.exportJson')}
          </Btn>
          <Btn variant="outline" icon={Upload} onClick={() => fileRef.current?.click()}>
            {t('common.importJson')}
          </Btn>
          <Btn variant="outline" icon={Database} onClick={reset}>
            {t('common.loadDemo')}
          </Btn>
          <Btn
            variant="danger"
            icon={Trash2}
            onClick={() => {
              if (confirm(t('common.clearDataConfirm'))) clearAll();
            }}
          >
            {t('common.clearData')}
          </Btn>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
        </div>
        <div className="text-[12.5px] text-ink-500 mb-3 dark:text-ink-300">
          {t('settings.storage')}: {t('settings.storageUsed', { n: storageKB })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {counts.map(([k, v]) => (
            <div
              key={k}
              className="rounded-[11px] bg-ink-50 px-3 py-2 flex items-center justify-between dark:bg-white/[0.05]"
            >
              <span className="text-[12px] text-ink-500 dark:text-ink-300">{k}</span>
              <span className="text-[13px] font-semibold tabular-nums text-ink-900 dark:text-white">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* About */}
      <Card>
        <SectionHeader title={t('settings.aboutTitle')} />
        <div className="flex items-start gap-3">
          <Info size={18} className="text-brand-600 mt-0.5 dark:text-brand-300" />
          <p className="text-[13.5px] leading-relaxed text-ink-600 dark:text-ink-200">{t('settings.aboutBody')}</p>
        </div>
      </Card>
    </div>
  );
}
