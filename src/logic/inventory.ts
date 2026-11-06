// Availability engine: per-departure seat inventory with timed holds. Pure functions over an
// immutable state, so the store, the operator feeds and the unit tests share one set of rules:
// - a hold takes seats off sale at once (nobody else can book them while the guest pays);
// - a declined payment or an expired hold puts the seats straight back;
// - a confirm turns the hold into a booking with a unique reference, idempotent per hold;
// - a cancel returns the seats instantly; a blocked boat or cancelled departure sells nothing;
// - remote bookings from operator systems go through the same check, so capacity is never exceeded.

export type Source = 'app' | 'pms' | 'agency' | 'manual';

export type Departure = {
  id: string;
  boatId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  label: string; // 'Half day', 'Sunset', ...
  hours: number;
  capacity: number;
  booked: number;
  pricePerGuest: number;
  cancelled?: boolean;
};

export type Hold = {
  id: string;
  departureId: string;
  seats: number;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'confirmed' | 'released' | 'expired';
};

export type Booking = {
  id: string;
  holdId?: string;
  departureId: string;
  seats: number;
  total: number;
  source: Source;
  createdAt: number;
  status: 'confirmed' | 'cancelled' | 'weather-cancelled';
};

export type EventKind = 'hold' | 'confirm' | 'release' | 'expire' | 'cancel' | 'remote-book' | 'rejected' | 'block' | 'unblock' | 'weather';
export type InvEvent = { at: number; kind: EventKind; departureId?: string; seats?: number; detail: string };

export type InventoryState = {
  departures: Record<string, Departure>;
  holds: Record<string, Hold>;
  bookings: Record<string, Booking>;
  blocked: Record<string, boolean>;
  events: InvEvent[];
  seq: number;
};

export type Fail = 'NO_SEATS' | 'BLOCKED' | 'NOT_FOUND' | 'HOLD_EXPIRED' | 'PAYMENT_DECLINED' | 'BAD_SEATS';
export type Result<T> = { state: InventoryState; ok: true; value: T } | { state: InventoryState; ok: false; reason: Fail };

export const HOLD_MS = 10 * 60 * 1000;

export function createInventory(departures: Departure[], blocked: Record<string, boolean> = {}): InventoryState {
  return { departures: Object.fromEntries(departures.map((d) => [d.id, d])), holds: {}, bookings: {}, blocked, events: [], seq: 0 };
}

const log = (s: InventoryState, e: InvEvent): InvEvent[] => [e, ...s.events].slice(0, 200);

export function heldSeats(s: InventoryState, departureId: string): number {
  let n = 0;
  for (const h of Object.values(s.holds)) if (h.departureId === departureId && h.status === 'active') n += h.seats;
  return n;
}

/** Seats a new guest can still take. Expired holds still count until expireHolds runs. */
export function seatsLeft(s: InventoryState, departureId: string): number {
  const d = s.departures[departureId];
  if (!d || d.cancelled || s.blocked[d.boatId]) return 0;
  return Math.max(0, d.capacity - d.booked - heldSeats(s, departureId));
}

export function expireHolds(s: InventoryState, now: number): InventoryState {
  const due = Object.values(s.holds).filter((h) => h.status === 'active' && h.expiresAt <= now);
  if (!due.length) return s;
  const holds = { ...s.holds };
  let events = s.events;
  for (const h of due) {
    holds[h.id] = { ...h, status: 'expired' };
    events = [{ at: now, kind: 'expire' as const, departureId: h.departureId, seats: h.seats, detail: `Hold ${h.id} timed out, ${h.seats} seats back on sale` }, ...events];
  }
  return { ...s, holds, events: events.slice(0, 200) };
}

export function hold(s0: InventoryState, departureId: string, seats: number, now: number, ttl = HOLD_MS): Result<Hold> {
  const s = expireHolds(s0, now);
  const d = s.departures[departureId];
  if (!d) return { state: s, ok: false, reason: 'NOT_FOUND' };
  if (!Number.isInteger(seats) || seats < 1) return { state: s, ok: false, reason: 'BAD_SEATS' };
  if (s.blocked[d.boatId] || d.cancelled) return { state: s, ok: false, reason: 'BLOCKED' };
  if (seatsLeft(s, departureId) < seats) {
    return { state: { ...s, events: log(s, { at: now, kind: 'rejected', departureId, seats, detail: `No seats available for ${seats} on ${d.time}` }) }, ok: false, reason: 'NO_SEATS' };
  }
  const seq = s.seq + 1;
  const h: Hold = { id: `H${seq}`, departureId, seats, createdAt: now, expiresAt: now + ttl, status: 'active' };
  return {
    state: { ...s, seq, holds: { ...s.holds, [h.id]: h }, events: log(s, { at: now, kind: 'hold', departureId, seats, detail: `${seats} seats held for 10 min` }) },
    ok: true,
    value: h,
  };
}

export function release(s: InventoryState, holdId: string, now: number): InventoryState {
  const h = s.holds[holdId];
  if (!h || h.status !== 'active') return s;
  return { ...s, holds: { ...s.holds, [holdId]: { ...h, status: 'released' } }, events: log(s, { at: now, kind: 'release', departureId: h.departureId, seats: h.seats, detail: `${h.seats} seats released` }) };
}

// Readable reference: TDP-YY-MMDD-XXXX. The 4-char code is an odd-multiplier permutation of
// the sequence number (unique below 32^4), with a collision check on top.
const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function bookingRef(date: string, n: number, taken: (id: string) => boolean): string {
  const [y, m, d] = date.split('-');
  for (let k = n; ; k++) {
    let x = (k * 637481 + 92821) % 1048576;
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += ALPHA[x % 32];
      x = Math.floor(x / 32);
    }
    const id = `TDP-${y.slice(2)}-${m}${d}-${code}`;
    if (!taken(id)) return id;
  }
}

export function confirm(s0: InventoryState, holdId: string, now: number, payment: 'approved' | 'declined' = 'approved'): Result<Booking> {
  // Idempotent: a retried confirm for the same hold returns the same booking.
  const existing = Object.values(s0.bookings).find((b) => b.holdId === holdId);
  if (existing) return { state: s0, ok: true, value: existing };
  const s = expireHolds(s0, now);
  const h = s.holds[holdId];
  if (!h) return { state: s, ok: false, reason: 'NOT_FOUND' };
  if (h.status !== 'active') return { state: s, ok: false, reason: 'HOLD_EXPIRED' };
  if (payment === 'declined') return { state: release(s, holdId, now), ok: false, reason: 'PAYMENT_DECLINED' };
  const d = s.departures[h.departureId];
  const seq = s.seq + 1;
  const id = bookingRef(d.date, seq, (x) => !!s.bookings[x]);
  const b: Booking = { id, holdId, departureId: d.id, seats: h.seats, total: h.seats * d.pricePerGuest, source: 'app', createdAt: now, status: 'confirmed' };
  return {
    state: {
      ...s,
      seq,
      departures: { ...s.departures, [d.id]: { ...d, booked: d.booked + h.seats } },
      holds: { ...s.holds, [holdId]: { ...h, status: 'confirmed' } },
      bookings: { ...s.bookings, [id]: b },
      events: log(s, { at: now, kind: 'confirm', departureId: d.id, seats: h.seats, detail: `Booking ${id} confirmed, email + SMS sent` }),
    },
    ok: true,
    value: b,
  };
}

export function cancel(s: InventoryState, bookingId: string, now: number): Result<Booking> {
  const b = s.bookings[bookingId];
  if (!b || b.status !== 'confirmed') return { state: s, ok: false, reason: 'NOT_FOUND' };
  const d = s.departures[b.departureId];
  const nb: Booking = { ...b, status: 'cancelled' };
  return {
    state: {
      ...s,
      departures: { ...s.departures, [d.id]: { ...d, booked: Math.max(0, d.booked - b.seats) } },
      bookings: { ...s.bookings, [bookingId]: nb },
      events: log(s, { at: now, kind: 'cancel', departureId: d.id, seats: b.seats, detail: `${b.seats} seats back on sale (${bookingId} cancelled)` }),
    },
    ok: true,
    value: nb,
  };
}

/** A booking made in an operator system (PMS / agency feed), checked against the same capacity. */
export function remoteBook(s0: InventoryState, departureId: string, seats: number, source: Source, now: number): Result<Booking> {
  const s = expireHolds(s0, now);
  const d = s.departures[departureId];
  if (!d) return { state: s, ok: false, reason: 'NOT_FOUND' };
  if (seatsLeft(s, departureId) < seats) {
    return { state: { ...s, events: log(s, { at: now, kind: 'rejected', departureId, seats, detail: `Feed booking for ${seats} rejected, would overbook` }) }, ok: false, reason: 'NO_SEATS' };
  }
  const seq = s.seq + 1;
  const id = bookingRef(d.date, seq, (x) => !!s.bookings[x]);
  const b: Booking = { id, departureId, seats, total: seats * d.pricePerGuest, source, createdAt: now, status: 'confirmed' };
  return {
    state: {
      ...s,
      seq,
      departures: { ...s.departures, [d.id]: { ...d, booked: d.booked + seats } },
      bookings: { ...s.bookings, [id]: b },
      events: log(s, { at: now, kind: 'remote-book', departureId, seats, detail: `${seats} seats booked via ${source.toUpperCase()} feed` }),
    },
    ok: true,
    value: b,
  };
}

export function setBlocked(s: InventoryState, boatId: string, on: boolean, now: number): InventoryState {
  return { ...s, blocked: { ...s.blocked, [boatId]: on }, events: log(s, { at: now, kind: on ? 'block' : 'unblock', detail: `${boatId} ${on ? 'blocked, hidden from all listings' : 'back on sale'}` }) };
}

/** Weather / operational cancellation: every booking refunded, the departure leaves sale. */
export function weatherCancel(s: InventoryState, departureId: string, now: number): InventoryState {
  const d = s.departures[departureId];
  if (!d) return s;
  const bookings = { ...s.bookings };
  for (const b of Object.values(bookings)) if (b.departureId === departureId && b.status === 'confirmed') bookings[b.id] = { ...b, status: 'weather-cancelled' };
  return { ...s, bookings, departures: { ...s.departures, [departureId]: { ...d, cancelled: true, booked: 0 } }, events: log(s, { at: now, kind: 'weather', departureId, detail: `${d.time} cancelled for weather, guests refunded` }) };
}

export type DayStatus = 'available' | 'limited' | 'full' | 'none';

/** Calendar dot for one boat on one day, for a party of `guests`. */
export function dayStatus(s: InventoryState, boatId: string, date: string, guests: number): DayStatus {
  const deps = Object.values(s.departures).filter((d) => d.boatId === boatId && d.date === date);
  if (!deps.length) return 'none';
  const best = Math.max(...deps.map((d) => seatsLeft(s, d.id)));
  if (best < guests) return 'full';
  return best - guests <= 2 ? 'limited' : 'available';
}

export function departuresFor(s: InventoryState, boatId: string, date: string): Departure[] {
  return Object.values(s.departures)
    .filter((d) => d.boatId === boatId && d.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}
