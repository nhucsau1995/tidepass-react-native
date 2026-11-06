// Date helpers on plain 'YYYY-MM-DD' strings (UTC math, no Intl: same output on Hermes and Node).
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The demo runs on a fixed "today" so seats, holds and trips line up with the design.
export const TODAY = '2026-10-16';

const parse = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day));
};
const iso = (dt: Date) => dt.toISOString().slice(0, 10);

export function addDays(d: string, n: number): string {
  const dt = parse(d);
  dt.setUTCDate(dt.getUTCDate() + n);
  return iso(dt);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);
}

export const dow = (d: string) => DOW[parse(d).getUTCDay()];
export const dayNum = (d: string) => parse(d).getUTCDate();
export const monthShort = (d: string) => MON[parse(d).getUTCMonth()];

/** 'Sat 18 Oct' */
export const fmtDay = (d: string) => `${dow(d)} ${dayNum(d)} ${monthShort(d)}`;
/** '18 Oct' */
export const fmtShort = (d: string) => `${dayNum(d)} ${monthShort(d)}`;

/** Monday-first month grid: leading nulls, then every date of the month. */
export function monthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const out: (string | null)[] = Array(lead).fill(null);
  for (let i = 1; i <= days; i++) out.push(iso(new Date(Date.UTC(year, month0, i))));
  return out;
}

export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const money = (n: number, cur = 'A$') => `${cur}${n.toLocaleString('en-US')}`;
