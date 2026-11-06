import { create } from 'zustand';
import { BOATS, RACE_DEPARTURE, SEED_NOTICES, boatById, seedInventory } from '../data/seed';
import type { Notice } from '../data/models';
import { fmtDay } from '../logic/dates';
import { cancel, confirm, expireHolds, hold, release, remoteBook, seatsLeft, setBlocked, type Fail, type InventoryState } from '../logic/inventory';

export type Query = { destinationId: string; date: string; guests: number; onlyAvailable: boolean };

type State = {
  inv: InventoryState;
  signedIn: boolean;
  query: Query;
  party: { adults: number; children: number };
  holdId?: string;
  /** Set when another guest took the seats in the same instant as our hold. */
  race: { departureId: string; seats: number } | null;
  raced: Record<string, boolean>;
  lastBookingId?: string;
  notices: Notice[];
  toast: string | null;

  signIn: () => void;
  setQuery: (q: Partial<Query>) => void;
  setParty: (adults: number, children: number) => void;
  holdSeats: (departureId: string) => boolean;
  releaseHold: () => void;
  expire: () => void;
  pay: (payment?: 'approved' | 'declined') => { ok: true; id: string } | { ok: false; reason: Fail };
  dismissRace: () => void;
  cancelBooking: (id: string) => number;
  toggleBlock: (boatId: string) => void;
  feedTick: () => void;
  markAllRead: () => void;
  showToast: (t: string | null) => void;
};

const guestsOf = (p: { adults: number; children: number }) => p.adults + p.children;

// Departures the feed simulator may touch: never the ones the demo walks through.
const FEED_BOATS = BOATS.filter((b) => ['yasawa', 'andamanStar', 'oceanPearl', 'marinaSpirit', 'mutiara'].includes(b.id)).map((b) => b.id);

export const useApp = create<State>((set, get) => ({
  inv: seedInventory(),
  signedIn: false,
  query: { destinationId: 'bali', date: '2026-10-18', guests: 4, onlyAvailable: true },
  party: { adults: 2, children: 0 },
  race: null,
  raced: {},
  notices: SEED_NOTICES,
  toast: null,

  signIn: () => set({ signedIn: true }),
  setQuery: (q) => set({ query: { ...get().query, ...q } }),
  setParty: (adults, children) => set({ party: { adults, children } }),

  holdSeats: (departureId) => {
    const now = Date.now();
    let { inv } = get();
    const { holdId, party, raced } = get();
    if (holdId) inv = release(inv, holdId, now);
    const seats = guestsOf(party);
    // Scripted race for the demo: an operator-system booking for the same seats lands in the
    // same instant as the guest's hold. The engine decides; the remote booking arrived first.
    if (departureId === RACE_DEPARTURE && !raced[departureId]) {
      const left = seatsLeft(inv, departureId);
      if (left > 0) inv = remoteBook(inv, departureId, left, 'pms', now).state;
    }
    const r = hold(inv, departureId, seats, now);
    if (!r.ok) {
      set({ inv: r.state, holdId: undefined, race: { departureId, seats }, raced: { ...raced, [departureId]: true } });
      return false;
    }
    set({ inv: r.state, holdId: r.value.id, race: null });
    return true;
  },

  releaseHold: () => {
    const { holdId, inv } = get();
    if (holdId) set({ inv: release(inv, holdId, Date.now()), holdId: undefined });
  },

  expire: () => set({ inv: expireHolds(get().inv, Date.now()) }),

  pay: (payment = 'approved') => {
    const { holdId, inv, notices } = get();
    if (!holdId) return { ok: false, reason: 'HOLD_EXPIRED' };
    const r = confirm(inv, holdId, Date.now(), payment);
    if (!r.ok) {
      set({ inv: r.state, holdId: undefined });
      return { ok: false, reason: r.reason };
    }
    const d = r.state.departures[r.value.departureId];
    const boat = boatById(d.boatId);
    const n: Notice = { id: `n-${r.value.id}`, kind: 'booking', title: `Booking ${r.value.id} confirmed`, body: `${boat.name.split(' - ')[0]}, ${fmtDay(d.date)} ${d.time} ${d.label} - ${r.value.seats} guests. Email and SMS sent.`, when: 'Just now', unread: true, bookingId: r.value.id };
    set({ inv: r.state, holdId: undefined, lastBookingId: r.value.id, notices: [n, ...notices] });
    return { ok: true, id: r.value.id };
  },

  dismissRace: () => set({ race: null }),

  cancelBooking: (id) => {
    const r = cancel(get().inv, id, Date.now());
    if (!r.ok) return 0;
    set({ inv: r.state });
    return r.value.seats;
  },

  toggleBlock: (boatId) => {
    const { inv } = get();
    set({ inv: setBlocked(inv, boatId, !inv.blocked[boatId], Date.now()) });
  },

  // Simulated operator feeds: a remote booking or a sync on a boat outside the demo path.
  feedTick: () => {
    const { inv } = get();
    const now = Date.now();
    const boatId = FEED_BOATS[Math.floor(now / 1000) % FEED_BOATS.length];
    const dep = Object.values(inv.departures).find((d) => d.boatId === boatId && seatsLeft(inv, d.id) > 2);
    if (!dep) return;
    set({ inv: remoteBook(inv, dep.id, 1, boatById(boatId).source, now).state });
  },

  markAllRead: () => set({ notices: get().notices.map((n) => ({ ...n, unread: false })) }),
  showToast: (toast) => set({ toast }),
}));

export const partySize = () => guestsOf(useApp.getState().party);
