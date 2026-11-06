import { BOATS } from '../data/seed';
import type { Boat } from '../data/models';
import { addDays } from '../logic/dates';
import { departuresFor, seatsLeft, type Departure, type InventoryState } from '../logic/inventory';

export type Slot = { dep: Departure; left: number };

export const slotsFor = (inv: InventoryState, boatId: string, date: string): Slot[] => departuresFor(inv, boatId, date).map((dep) => ({ dep, left: seatsLeft(inv, dep.id) }));

/** Most seats any departure of the boat still has on that date. */
export const bestLeft = (inv: InventoryState, boatId: string, date: string) => Math.max(0, ...slotsFor(inv, boatId, date).map((s) => s.left));

export type Result = { boat: Boat; slots: Slot[]; best: number };

/** Search: boats in a destination on a date; with onlyAvailable, only boats that fit the party. */
export function search(inv: InventoryState, destinationId: string, date: string, guests: number, onlyAvailable: boolean): Result[] {
  return BOATS.filter((b) => b.destinationId === destinationId && b.specs.maxGuests >= 1)
    .map((boat) => {
      const slots = slotsFor(inv, boat.id, date);
      return { boat, slots, best: Math.max(0, ...slots.map((s) => s.left)) };
    })
    .filter((r) => r.slots.length && (!onlyAvailable || r.best >= guests))
    .sort((a, b) => b.best - a.best);
}

/** Next dates after `date` that still have space for the party, with how many boats fit. */
export function nearbyDates(inv: InventoryState, destinationId: string, date: string, guests: number, n = 4) {
  const out: { date: string; boats: number }[] = [];
  for (let i = 1; i <= 21 && out.length < n; i++) {
    const d = addDays(date, i);
    const boats = search(inv, destinationId, d, guests, true).length;
    if (boats) out.push({ date: d, boats });
  }
  return out;
}
