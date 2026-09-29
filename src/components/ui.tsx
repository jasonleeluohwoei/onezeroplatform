import React, { useEffect } from 'react';
import { X, Search, ChevronDown, Check, Plus, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { TONE_CLASS, TONE_DOT, toneOf } from '../data/schema';
import { avatarColor, avatarText, initials } from '../lib/format';
import { useI18n } from '../i18n';

export function cx(...a: any[]) {
  return a.filter(Boolean).join(' ');
}

/* --------------------------------- Button -------------------------------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'subtle' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  icon?: any;
};

export function Btn({ variant = 'subtle', size = 'sm', icon: Icon, className, children, ...rest }: BtnProps) {
  const sizes = {
    xs: 'h-7 px-2.5 text-[12px] gap-1',
    sm: 'h-8 px-3 text-[13px] gap-1.5',
    md: 'h-10 px-4 text-[14px] gap-2',
  }[size];
  const variants = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm disabled:bg-brand-500/40',
    subtle:
      'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.16]',
    outline:
      'bg-white text-ink-800 ring-1 ring-ink-200 hover:bg-ink-50 dark:bg-white/[0.04] dark:text-white dark:ring-white/15 dark:hover:bg-white/[0.08]',
    ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm',
  }[variant];
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center rounded-[10px] font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        sizes,
        variants,
        className
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'xs' ? 13 : 15} strokeWidth={2} />}
      {children}
    </button>
  );
}

/* ---------------------------------- Card --------------------------------- */
export function Card({ className, children, pad = true }: { className?: string; children: React.ReactNode; pad?: boolean }) {
  return (
    <div
      className={cx(
        'rounded-[16px] bg-white ring-1 ring-black/[0.05] shadow-card dark:bg-[#1c1c1e] dark:ring-white/[0.08]',
        pad && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  sub,
  action,
  className,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900 dark:text-white">{title}</h2>
        {sub && <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-0.5">{sub}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */
export function Badge({ value, dot = true, className }: { value: string; dot?: boolean; className?: string }) {
  const tone = toneOf(value);
  if (!value) return <span className="text-ink-400">—</span>;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[11.5px] font-medium ring-1 ring-inset whitespace-nowrap',
        TONE_CLASS[tone],
        'dark:bg-white/[0.08] dark:ring-white/10',
        className
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', TONE_DOT[tone])} />}
      {value}
    </span>
  );
}

/* --------------------------------- Avatar -------------------------------- */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: avatarColor(name || 'x'),
        color: avatarText(name || 'x'),
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}

export function AvatarStack({ names, max = 4, size = 26 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((n, i) => (
          <div key={i} className="ring-2 ring-white rounded-full dark:ring-[#1c1c1e]">
            <Avatar name={n} size={size} />
          </div>
        ))}
      </div>
      {rest > 0 && <span className="ml-2 text-[11.5px] text-ink-500 dark:text-ink-300">+{rest}</span>}
    </div>
  );
}

/* --------------------------------- Modal --------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-3xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 animate-fadeIn">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          'relative w-full rounded-[18px] bg-white shadow-pop ring-1 ring-black/5 animate-scaleIn mt-2 dark:bg-[#1c1c1e] dark:ring-white/10',
          width
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold text-ink-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[62vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-black/[0.06] bg-ink-50/60 rounded-b-[18px] dark:border-white/[0.08] dark:bg-white/[0.03]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Search -------------------------------- */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[10px] bg-ink-100/70 pl-9 pr-3 text-[13px] text-ink-900 placeholder:text-ink-400 outline-none ring-1 ring-transparent focus:bg-white focus:ring-brand-500/40 transition dark:bg-white/[0.07] dark:text-white dark:placeholder:text-ink-300"
      />
    </div>
  );
}

/* ---------------------------------- Tabs -------------------------------- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'sm',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: any }[];
  size?: 'xs' | 'sm';
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-[11px] bg-ink-100/80 p-0.5 dark:bg-white/[0.07]">
      {options.map((o) => {
        const Icon = o.icon;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-[9px] font-medium transition-all duration-150',
              size === 'xs' ? 'h-6 px-2.5 text-[11.5px]' : 'h-7 px-3 text-[12.5px]',
              active
                ? 'bg-white text-ink-900 shadow-sm dark:bg-white/[0.16] dark:text-white'
                : 'text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-white'
            )}
          >
            {Icon && <Icon size={13} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Stats --------------------------------- */
export function Stat({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'blue',
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: any;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    purple: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    gray: 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-200',
  }[tone];
  return (
    <div
      onClick={onClick}
      className={cx(
        'rounded-[16px] bg-white p-4 ring-1 ring-black/[0.05] shadow-card transition hover:shadow-lift dark:bg-[#1c1c1e] dark:ring-white/[0.08]',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-ink-500 dark:text-ink-300 truncate">{label}</div>
          <div className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink-900 dark:text-white leading-none">
            {value}
          </div>
          {sub && <div className="mt-1.5 text-[11.5px] text-ink-400 dark:text-ink-300">{sub}</div>}
        </div>
        {Icon && (
          <div className={cx('h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0', tones)}>
            <Icon size={17} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Progress -------------------------------- */
export function Progress({ value, tone = 'blue', height = 6 }: { value: number; tone?: string; height?: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    tone === 'green'
      ? 'bg-emerald-500'
      : tone === 'amber'
      ? 'bg-amber-500'
      : tone === 'red'
      ? 'bg-rose-500'
      : tone === 'purple'
      ? 'bg-violet-500'
      : 'bg-brand-500';
  return (
    <div className="w-full rounded-full bg-ink-100 overflow-hidden dark:bg-white/10" style={{ height }}>
      <div className={cx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${v}%` }} />
    </div>
  );
}

/* -------------------------------- Credits -------------------------------- */
export function Credits({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const left = Math.max(0, total - used);
  const tone = pct >= 100 ? 'red' : pct >= 80 ? 'amber' : 'green';
  return (
    <div className="min-w-[92px]">
      <div className="flex items-center justify-between text-[11.5px] mb-1">
        <span className="text-ink-500 dark:text-ink-300">
          {used}/{total}
        </span>
        <span
          className={cx(
            'font-medium',
            tone === 'red' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-emerald-600'
          )}
        >
          {left} left
        </span>
      </div>
      <Progress value={pct} tone={tone} height={5} />
    </div>
  );
}

/* --------------------------------- Empty --------------------------------- */
export function Empty({ title, hint, icon: Icon }: { title: string; hint?: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {Icon && (
        <div className="h-12 w-12 rounded-[14px] bg-ink-100 flex items-center justify-center text-ink-400 mb-3 dark:bg-white/[0.07]">
          <Icon size={22} />
        </div>
      )}
      <p className="text-[14px] font-medium text-ink-700 dark:text-ink-100">{title}</p>
      {hint && <p className="text-[13px] text-ink-400 mt-1 max-w-sm dark:text-ink-300">{hint}</p>}
    </div>
  );
}

/* --------------------------------- Toast --------------------------------- */
export function Toasts({ items }: { items: { id: string; msg: string; kind: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center">
      {items.map((t) => (
        <div
          key={t.id}
          className="animate-slideUp rounded-[12px] bg-ink-900/95 text-white px-4 py-2.5 text-[13px] shadow-pop backdrop-blur flex items-center gap-2 dark:bg-white dark:text-ink-900"
        >
          {t.kind === 'warn' && <AlertTriangle size={15} className="text-amber-400" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Confirmation ----------------------------- */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  hint,
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  hint?: string;
  danger?: boolean;
}) {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Btn variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Btn>
          <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {t('common.delete')}
          </Btn>
        </>
      }
    >
      <p className="text-[13.5px] text-ink-600 dark:text-ink-200">{hint}</p>
    </Modal>
  );
}

/* --------------------------------- Link ---------------------------------- */
export function ExternalLinkBtn({ href }: { href: string }) {
  const { t } = useI18n();
  if (!href) return null;
  return (
    <a
      href={href.startsWith('http') ? href : 'https://' + href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-brand-600 hover:underline text-[12.5px] dark:text-brand-300"
    >
      <ExternalLink size={12} /> {t('common.link')}
    </a>
  );
}

export { Plus, Trash2, Check, ChevronDown };
