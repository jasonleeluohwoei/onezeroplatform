export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function toDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function fmtDate(v: any, lang: 'en' | 'zh' = 'en'): string {
  const d = toDate(v);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.getMonth() + 1;
  if (lang === 'zh') return `${d.getFullYear()}年${mon}月${day}日`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateShort(v: any, lang: 'en' | 'zh' = 'en'): string {
  const d = toDate(v);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.getMonth() + 1;
  if (lang === 'zh') return `${mon}/${day}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]}`;
}

export function money(v: any): string {
  const n = Number(v || 0);
  return 'RM ' + n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function moneyShort(v: any): string {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1000000) return 'RM ' + (n / 1000000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1000) return 'RM ' + (n / 1000).toFixed(1) + 'k';
  return 'RM ' + n.toFixed(0);
}

export function daysUntil(v: any): number | null {
  const d = toDate(v);
  if (!d) return null;
  const now = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

export function daysSince(v: any): number | null {
  const n = daysUntil(v);
  return n === null ? null : -n;
}

export function monthKey(v: any): string {
  const d = toDate(v);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function addDays(base: Date | string, n: number): string {
  const d = toDate(base) || new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function lastNMonths(n: number): { key: string; label: string; date: Date }[] {
  const out: { key: string; label: string; date: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: months[d.getMonth()], date: d });
  }
  return out;
}

export function initials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  const hues = [212, 262, 340, 24, 152, 190, 44];
  return `hsl(${hues[Math.abs(h) % hues.length]} 72% 92%)`;
}

export function avatarText(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  const hues = [212, 262, 340, 24, 152, 190, 44];
  return `hsl(${hues[Math.abs(h) % hues.length]} 55% 38%)`;
}

export function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}
