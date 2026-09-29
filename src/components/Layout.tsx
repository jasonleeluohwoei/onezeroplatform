import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  Building2,
  Package,
  CreditCard,
  Lightbulb,
  Clapperboard,
  FolderOpen,
  Film,
  CalendarDays,
  Camera,
  GraduationCap,
  Settings as SettingsIcon,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  ChevronRight,
} from 'lucide-react';
import { useI18n, useTheme } from '../i18n';
import { Avatar, cx } from './ui';
import { useData } from '../data/store';

const ICONS: Record<string, any> = {
  LayoutDashboard,
  Users,
  Target,
  Building2,
  Package,
  CreditCard,
  Lightbulb,
  Clapperboard,
  FolderOpen,
  Film,
  CalendarDays,
  Camera,
  GraduationCap,
  SettingsIcon,
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { db } = useData();
  const loc = useLocation();

  const groups = [
    {
      label: t('nav.sectionOperate'),
      items: [{ to: '/', label: t('nav.dashboard'), icon: 'LayoutDashboard' }],
    },
    {
      label: t('nav.sectionSales'),
      items: [
        { to: '/leads', label: t('nav.leads'), icon: 'Target', badge: db.leads.filter((l) => !l.stage.startsWith('Lost') && l.stage !== 'Won / Converted').length },
        { to: '/clients', label: t('nav.clients'), icon: 'Building2', badge: db.clients.filter((c) => c.status === 'Active').length },
        { to: '/subscriptions', label: t('nav.subscriptions'), icon: 'Package' },
        { to: '/payments', label: t('nav.payments'), icon: 'CreditCard' },
      ],
    },
    {
      label: t('nav.sectionProduce'),
      items: [
        { to: '/proposals', label: t('nav.proposals'), icon: 'Lightbulb' },
        { to: '/shootings', label: t('nav.shootings'), icon: 'Clapperboard' },
        { to: '/media', label: t('nav.media'), icon: 'FolderOpen' },
        { to: '/videos', label: t('nav.videos'), icon: 'Film' },
      ],
    },
    {
      label: t('nav.sectionManage'),
      items: [
        { to: '/staff', label: t('nav.staff'), icon: 'Users' },
        { to: '/timeline', label: t('nav.timeline'), icon: 'CalendarDays' },
        { to: '/equipment', label: t('nav.equipment'), icon: 'Camera' },
        { to: '/learning', label: t('nav.learning'), icon: 'GraduationCap' },
      ],
    },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-50/80 backdrop-blur-xl dark:bg-[#161618]">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[11px] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900 dark:text-white">AgencyOS</div>
            <div className="text-[10.5px] text-ink-400 dark:text-ink-400">Agency Operating System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-400">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon];
                const active = it.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(it.to);
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={cx(
                      'group flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] text-[13.5px] font-medium transition-all duration-150',
                      active
                        ? 'bg-white text-ink-900 shadow-card dark:bg-white/[0.12] dark:text-white'
                        : 'text-ink-600 hover:bg-white/60 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
                    )}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.9} className={cx(active ? 'text-brand-600 dark:text-brand-300' : '')} />
                    <span className="flex-1 truncate">{it.label}</span>
                    {!!it.badge && (
                      <span className="rounded-full bg-ink-200/70 px-1.5 text-[10.5px] font-semibold text-ink-600 dark:bg-white/10 dark:text-ink-200">
                        {it.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-black/[0.06] p-3 dark:border-white/[0.08]">
        <NavLink
          to="/settings"
          onClick={() => setOpen(false)}
          className={cx(
            'flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] text-[13.5px] font-medium transition',
            loc.pathname === '/settings'
              ? 'bg-white text-ink-900 shadow-card dark:bg-white/[0.12] dark:text-white'
              : 'text-ink-600 hover:bg-white/60 dark:text-ink-300 dark:hover:bg-white/[0.06]'
          )}
        >
          <SettingsIcon size={16} />
          <span className="flex-1">{t('nav.settings')}</span>
        </NavLink>
        <div className="mt-2 flex items-center gap-2 px-1">
          <Avatar name="Wei Loon Tan" size={28} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[12.5px] font-medium text-ink-800 truncate dark:text-white">Wei Loon Tan</div>
            <div className="text-[10.5px] text-ink-400 truncate">Managing Director</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-ink-900 antialiased dark:bg-black dark:text-white">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[248px] border-r border-black/[0.06] lg:block dark:border-white/[0.08]">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] animate-fadeIn shadow-pop">{sidebar}</div>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[52px] items-center justify-between gap-3 border-b border-black/[0.06] bg-[#f5f5f7]/85 px-4 backdrop-blur-xl lg:px-8 dark:border-white/[0.08] dark:bg-black/80">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-ink-200/60 dark:hover:bg-white/10">
              <Menu size={18} />
            </button>
            <div className="hidden lg:flex items-center gap-1.5 text-[12.5px] text-ink-400">
              <span>{t('app.workspace')}</span>
              <ChevronRight size={13} />
              <span className="text-ink-600 dark:text-ink-200">{t('app.tagline')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[12.5px] font-medium text-ink-600 hover:bg-ink-200/60 transition dark:text-ink-200 dark:hover:bg-white/10"
              title={t('settings.langTitle')}
            >
              <Languages size={15} />
              {lang === 'en' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-[9px] p-2 text-ink-600 hover:bg-ink-200/60 transition dark:text-ink-200 dark:hover:bg-white/10"
              title={t('settings.themeTitle')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-7 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
