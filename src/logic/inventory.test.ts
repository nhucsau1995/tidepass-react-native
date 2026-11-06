/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HOLD_MS, cancel, confirm, createInventory, dayStatus, hold, remoteBook, seatsLeft, setBlocked, weatherCancel, type Departure, type InventoryState } from './inventory.ts';

const dep = (over: Partial<Departure> = {}): Departure => ({ id: 'd1', boatId: 'b1', date: '2026-10-18', time: '13:30', label: 'Sunset', hours: 3.5, capacity: 10, booked: 0, pricePerGuest: 310, ...over });
const T0 = 1_000_000;

test('RTB-001: capacity 10, 9 booked, two guests race for the last seat, exactly one wins', () => {
  let s = createInventory([dep({ booked: 9 })]);
  const a = hold(s, 'd1', 1, T0);
  assert.equal(a.ok, true);
  s = a.state;
  const b = hold(s, 'd1', 1, T0);
  assert.equal(b.ok, false);
  assert.equal(!b.ok && b.reason, 'NO_SEATS');
  s = b.state;
  const c = confirm(s, a.ok ? a.value.id : '', T0 + 1000);
  assert.equal(c.ok, true);
  assert.equal(c.state.departures.d1.booked, 10);
  assert.equal(seatsLeft(c.state, 'd1'), 0);
});

test('a hold takes seats off sale before payment', () => {
  const r = hold(createInventory([dep()]), 'd1', 3, T0);
  assert.equal(seatsLeft(r.state, 'd1'), 7);
  assert.equal(r.state.departures.d1.booked, 0);
});

test('declined payment releases the held seats', () => {
  const h = hold(createInventory([dep()]), 'd1', 3, T0);
  assert.ok(h.ok);
  const r = confirm(h.state, h.value.id, T0 + 5000, 'declined');
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.reason, 'PAYMENT_DECLINED');
  assert.equal(seatsLeft(r.state, 'd1'), 10);
});

test('an expired hold cannot be paid and its seats return', () => {
  const h = hold(createInventory([dep({ booked: 8 })]), 'd1', 2, T0);
  assert.ok(h.ok);
  assert.equal(seatsLeft(h.state, 'd1'), 0);
  const late = confirm(h.state, h.value.id, T0 + HOLD_MS + 1);
  assert.equal(!late.ok && late.reason, 'HOLD_EXPIRED');
  assert.equal(seatsLeft(late.state, 'd1'), 2);
  // and another guest can take them right away
  assert.equal(hold(h.state, 'd1', 2, T0 + HOLD_MS + 1).ok, true);
});

test('confirm is idempotent per hold (a retried tap books once)', () => {
  const h = hold(createInventory([dep()]), 'd1', 2, T0);
  assert.ok(h.ok);
  const a = confirm(h.state, h.value.id, T0 + 1);
  assert.ok(a.ok);
  const b = confirm(a.state, h.value.id, T0 + 2);
  assert.ok(b.ok);
  assert.equal(b.value.id, a.value.id);
  assert.equal(b.state.departures.d1.booked, 2);
  assert.equal(Object.keys(b.state.bookings).length, 1);
});

test('cancel puts the seats back on sale instantly', () => {
  const h = hold(createInventory([dep({ booked: 7 })]), 'd1', 3, T0);
  assert.ok(h.ok);
  const c = confirm(h.state, h.value.id, T0 + 1);
  assert.ok(c.ok);
  assert.equal(seatsLeft(c.state, 'd1'), 0);
  const x = cancel(c.state, c.value.id, T0 + 2);
  assert.ok(x.ok);
  assert.equal(seatsLeft(x.state, 'd1'), 3);
  assert.equal(cancel(x.state, c.value.id, T0 + 3).ok, false, 'second cancel is a no-op');
});

test('a blocked boat shows zero availability and cannot be held', () => {
  const s = setBlocked(createInventory([dep()]), 'b1', true, T0);
  assert.equal(seatsLeft(s, 'd1'), 0);
  assert.equal(dayStatus(s, 'b1', '2026-10-18', 1), 'full');
  const r = hold(s, 'd1', 1, T0);
  assert.equal(!r.ok && r.reason, 'BLOCKED');
});

test('weather cancellation refunds every booking and removes the departure', () => {
  const r = remoteBook(createInventory([dep()]), 'd1', 4, 'pms', T0);
  assert.ok(r.ok);
  const s = weatherCancel(r.state, 'd1', T0 + 1);
  assert.equal(s.bookings[r.value.id].status, 'weather-cancelled');
  assert.equal(seatsLeft(s, 'd1'), 0);
});

test('feed bookings never overbook: a remote booking that does not fit is rejected', () => {
  const h = hold(createInventory([dep({ booked: 8 })]), 'd1', 2, T0);
  assert.ok(h.ok);
  const r = remoteBook(h.state, 'd1', 1, 'agency', T0 + 1);
  assert.equal(r.ok, false);
  assert.equal(r.state.events[0].kind, 'rejected');
});

test('booking references stay unique across 10,000 bookings', () => {
  let s: InventoryState = createInventory([dep({ capacity: 20000 })]);
  const ids = new Set<string>();
  for (let i = 0; i < 10000; i++) {
    const r = remoteBook(s, 'd1', 1, 'pms', T0 + i);
    assert.ok(r.ok);
    s = r.state;
    ids.add(r.value.id);
  }
  assert.equal(ids.size, 10000);
  for (const id of ids) assert.match(id, /^TDP-26-1018-[2-9A-Z]{4}$/);
});

test('mixed concurrent load never exceeds capacity', () => {
  let s = createInventory([dep({ capacity: 25 })]);
  let rnd = 7;
  const next = () => (rnd = (rnd * 48271) % 2147483647);
  const holds: string[] = [];
  for (let i = 0; i < 2000; i++) {
    const t = T0 + i * 1000;
    const op = next() % 5;
    if (op === 0) {
      const r = hold(s, 'd1', 1 + (next() % 4), t);
      s = r.state;
      if (r.ok) holds.push(r.value.id);
    } else if (op === 1 && holds.length) {
      s = confirm(s, holds.shift()!, t, next() % 4 === 0 ? 'declined' : 'approved').state;
    } else if (op === 2) {
      s = remoteBook(s, 'd1', 1 + (next() % 3), 'agency', t).state;
    } else if (op === 3) {
      const live = Object.values(s.bookings).filter((b) => b.status === 'confirmed');
      if (live.length) s = cancel(s, live[next() % live.length].id, t).state;
    }
    const d = s.departures.d1;
    const held = Object.values(s.holds).filter((h) => h.status === 'active').reduce((n, h) => n + h.seats, 0);
    assert.ok(d.booked + held <= d.capacity, `over capacity at step ${i}`);
    const live = Object.values(s.bookings).filter((b) => b.status === 'confirmed').reduce((n, b) => n + b.seats, 0);
    assert.equal(live, d.booked, 'booked count matches live bookings');
  }
});
