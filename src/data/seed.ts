import { addDays, TODAY } from '../logic/dates';
import { createInventory, type Booking, type Departure, type InventoryState } from '../logic/inventory';
import type { Boat, Destination, Notice } from './models';

export const DESTINATIONS: Destination[] = [
  { id: 'whitsundays', name: 'Whitsundays', country: 'Australia', region: 'Queensland, Coral Sea', fleet: 22, image: 'destWhitsundays' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', region: 'Bali and Lombok', fleet: 31, image: 'destBali' },
  { id: 'palawan', name: 'Palawan', country: 'Philippines', region: 'MIMAROPA, Sulu Sea', fleet: 12, image: 'destPalawan' },
  { id: 'fiji', name: 'Fiji', country: 'Fiji', region: 'Mamanuca and Yasawa', fleet: 24, image: 'destFiji' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', region: 'Sentosa and Southern Islands', fleet: 18, image: 'destSingapore' },
  { id: 'tahiti', name: 'Tahiti', country: 'French Polynesia', region: 'Society Islands', fleet: 9, image: 'destTahiti' },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', region: 'North Male Atoll', fleet: 15, image: 'destMaldives' },
  { id: 'phuket', name: 'Phuket', country: 'Thailand', region: 'Andaman Sea', fleet: 27, image: 'destPhuket' },
];

const spec = (length: string, cabins: number, berths: number, maxGuests: number, year: string, skipper = true) => ({ length, cabins, berths, maxGuests, year, skipper });
const ABOUT_CAT = 'Explore secluded turquoise coves and silica sands aboard this immaculately kept catamaran. Four airy double cabins, a wide forward trampoline for sun-lounging and an experienced skipper to guide you to the best anchorages of the day.';

export const BOATS: Boat[] = [
  { id: 'lagoon380', name: 'Lagoon 380 - 4 cab.', type: 'Catamaran', destinationId: 'whitsundays', location: 'Airlie Beach, Whitsundays', operator: 'Coral Coast Charters', source: 'pms', rating: 4.88, reviews: 126, image: 'boatLagoonHero', specs: spec('11.6 m', 4, 8, 10, '2019'), fromPrice: 240, about: ABOUT_CAT, amenities: ['Snorkel gear included', 'Tender and outboard', 'Solar and 220V generator', 'Stand-up paddleboards'] },
  { id: 'blueHorizon', name: 'Blue Horizon', type: 'Catamaran', destinationId: 'whitsundays', location: 'Airlie Beach, Whitsundays', operator: 'Coral Coast Charters', source: 'pms', rating: 4.71, reviews: 88, image: 'boatBlueHorizon', specs: spec('12.4 m', 4, 10, 10, '2021'), fromPrice: 330, about: ABOUT_CAT, amenities: ['Snorkel gear included', 'Sunset platter', 'Bluetooth sound'] },
  { id: 'aurelia', name: 'Aurelia', type: 'Motor yacht', destinationId: 'sydney', location: 'Sydney Harbour, NSW', operator: 'Harbour Luxe Yachts', source: 'agency', rating: 4.94, reviews: 61, image: 'boatAurelia', specs: spec('25.6 m', 4, 8, 14, '2018'), fromPrice: 1450, about: 'An 84 ft luxury motor yacht for harbour lunches and sunset cruises past the bridge, with a crew of three and a full galley.', amenities: ['Chef on board', 'Champagne bar', 'Swim platform'] },
  { id: 'vedanta', name: 'Vedanta', type: 'Phinisi', destinationId: 'bali', location: 'Benoa Harbour, Bali', operator: 'Archipelago Expeditions', source: 'agency', rating: 4.98, reviews: 204, image: 'boatVedanta', specs: spec('32 m', 6, 14, 12, '2016'), fromPrice: 240, about: 'A hand-built teak phinisi sailing the Bali and Lombok coast, with shaded day decks and a crew of eight.', amenities: ['Lunch included', 'Kayaks', 'Snorkel gear'] },
  { id: 'giliExpress', name: 'Gili Express', type: 'Fast boat', destinationId: 'bali', location: 'Padang Bai, Bali', operator: 'Blue Wave Sea Transits', source: 'manual', rating: 4.85, reviews: 512, image: 'boatGili', specs: spec('16 m', 0, 0, 30, '2022', true), fromPrice: 85, about: 'Fast-boat transfer from Bali to the Gili Islands and Lombok, about 90 minutes door to dock.', amenities: ['Luggage included', 'Hotel pickup'] },
  { id: 'lombokSunset', name: 'Lombok Sunset Cruise', type: 'Catamaran', destinationId: 'bali', location: 'Senggigi, Lombok', operator: 'Serenity Charters Bali', source: 'agency', rating: 5.0, reviews: 47, image: 'boatLombok', specs: spec('14 m', 3, 6, 10, '2020'), fromPrice: 310, about: 'A golden-hour cruise along the Senggigi coast with canapes and an open bar.', amenities: ['Open bar', 'Canapes'] },
  { id: 'bali46', name: 'Bali 4.6', type: 'Catamaran', destinationId: 'bali', location: 'Serangan Marina, Bali', operator: 'Coral Coast Charters', source: 'pms', rating: 4.6, reviews: 32, image: 'fleetBali46', specs: spec('14 m', 4, 8, 8, '2022'), fromPrice: 360, about: ABOUT_CAT, amenities: ['Snorkel gear included'] },
  { id: 'suluLagoon', name: 'Sulu Lagoon 40', type: 'Catamaran', destinationId: 'palawan', location: 'El Nido, Palawan', operator: 'Archipelago Yachts', source: 'pms', rating: 4.9, reviews: 73, image: 'boatLagoonAnchored', specs: spec('11.7 m', 4, 8, 10, '2020'), fromPrice: 420, about: ABOUT_CAT, amenities: ['Island hopping', 'Kayaks', 'Lunch included'] },
  { id: 'mutiara', name: 'Mutiara', type: 'Motor yacht', destinationId: 'palawan', location: 'Coron, Palawan', operator: 'Archipelago Yachts', source: 'pms', rating: 4.8, reviews: 29, image: 'fleetSuperyacht', specs: spec('38 m', 5, 10, 12, '2017'), fromPrice: 690, about: 'A superyacht for private day charters around the Coron wrecks and lagoons.', amenities: ['Chef on board', 'Jet ski'] },
  { id: 'islandHopper', name: 'Island Hopper', type: 'Fast boat', destinationId: 'palawan', location: 'El Nido, Palawan', operator: 'Palawan Sea Transits', source: 'manual', rating: 4.6, reviews: 318, image: 'boatGili', specs: spec('12 m', 0, 0, 20, '2021'), fromPrice: 180, about: 'Shared island-hopping tours A and C, with lunch on the beach.', amenities: ['Lunch included'] },
  { id: 'moanaNui', name: 'Moana Nui', type: 'Catamaran', destinationId: 'tahiti', location: 'Papeete, Tahiti', operator: 'Papeete Coastal Cruise', source: 'agency', rating: 4.8, reviews: 41, image: 'fleetLagoon', specs: spec('13 m', 4, 8, 8, '2019'), fromPrice: 390, about: ABOUT_CAT, amenities: ['Snorkel gear included'] },
  { id: 'teva', name: 'Teva', type: 'Sailing yacht', destinationId: 'tahiti', location: 'Moorea, Tahiti', operator: 'Papeete Coastal Cruise', source: 'agency', rating: 4.7, reviews: 22, image: 'boatLombok', specs: spec('12 m', 3, 6, 6, '2015'), fromPrice: 350, about: 'A classic sloop for sunset sails across the Sea of the Moon.', amenities: ['Sunset platter'] },
  { id: 'yasawa', name: 'Yasawa Breeze', type: 'Catamaran', destinationId: 'fiji', location: 'Port Denarau, Fiji', operator: 'South Seas Sailing', source: 'pms', rating: 4.9, reviews: 96, image: 'fleetLagoon', specs: spec('13.5 m', 4, 10, 12, '2021'), fromPrice: 290, about: ABOUT_CAT, amenities: ['Snorkel gear included'] },
  { id: 'marinaSpirit', name: 'Marina Spirit', type: 'Motor yacht', destinationId: 'singapore', location: 'Sentosa Cove, Singapore', operator: 'Lion City Yachting', source: 'agency', rating: 4.7, reviews: 54, image: 'boatAurelia', specs: spec('22 m', 3, 6, 12, '2019'), fromPrice: 520, about: 'Southern Islands cruises with a swim stop at Lazarus Island.', amenities: ['Swim platform'] },
  { id: 'oceanPearl', name: 'Ocean Pearl', type: 'Motor yacht', destinationId: 'maldives', location: 'Male, Maldives', operator: 'Atoll Voyages', source: 'pms', rating: 4.95, reviews: 37, image: 'fleetSuperyacht', specs: spec('30 m', 5, 10, 10, '2020'), fromPrice: 880, about: 'Sandbank picnics and manta snorkelling in North Male Atoll.', amenities: ['Chef on board', 'Dive kit'] },
  { id: 'andamanStar', name: 'Andaman Star', type: 'Sailing yacht', destinationId: 'phuket', location: 'Chalong Bay, Phuket', operator: 'Andaman Sail Co.', source: 'pms', rating: 4.8, reviews: 66, image: 'boatBlueHorizon', specs: spec('15 m', 3, 6, 10, '2018'), fromPrice: 270, about: 'Phang Nga Bay day sails past the limestone karsts.', amenities: ['Lunch included', 'Kayaks'] },
];

export const boatById = (id: string) => BOATS.find((b) => b.id === id)!;
export const destById = (id: string) => DESTINATIONS.find((d) => d.id === id);

// Departure slots per boat: [time, label, hours, pricePerGuest].
const SLOTS: Record<string, [string, string, number, number][]> = {
  lagoon380: [['08:00', 'Half day', 4, 240], ['13:30', 'Sunset', 3.5, 310], ['17:00', 'Private charter', 3, 520]],
  blueHorizon: [['13:30', 'Sunset', 3.5, 330]],
  aurelia: [['10:00', 'Harbour lunch', 4, 980], ['18:00', 'Sunset', 3, 1450]],
  vedanta: [['08:00', 'Full day', 8, 240], ['13:30', 'Afternoon sail', 4, 240]],
  giliExpress: [['09:15', 'Transfer', 1.5, 85], ['11:45', 'Transfer', 1.5, 85], ['15:00', 'Transfer', 1.5, 85]],
  lombokSunset: [['16:30', 'Sunset', 3, 310]],
  bali46: [['09:00', 'Day sail', 7, 360]],
  suluLagoon: [['08:00', 'Island hopping', 8, 420]],
  mutiara: [['09:00', 'Private day', 8, 690]],
  islandHopper: [['08:30', 'Tour A', 7, 180], ['09:00', 'Tour C', 7, 180]],
  moanaNui: [['09:00', 'Lagoon day', 6, 390]],
  teva: [['17:00', 'Sunset', 2.5, 350]],
  yasawa: [['08:30', 'Day sail', 8, 290]],
  marinaSpirit: [['10:00', 'Southern Islands', 5, 520]],
  oceanPearl: [['09:00', 'Sandbank day', 7, 880]],
  andamanStar: [['08:30', 'Phang Nga day', 8, 270]],
};

// Deterministic "already booked" level so calendars look lived-in but never change between runs.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 100;
}

// Exact seat counts the demo relies on (booked seats): date|time per boat.
const FIXED: Record<string, number> = {
  'lagoon380|2026-10-18|08:00': 4,
  'lagoon380|2026-10-18|13:30': 8, // 2 left: the last-seat race
  'lagoon380|2026-10-18|17:00': 10,
  'lagoon380|2026-10-19|13:30': 6,
  'blueHorizon|2026-10-18|13:30': 5,
  'aurelia|2026-10-16|18:00': 12,
  'islandHopper|2026-10-16|08:30': 20,
  'islandHopper|2026-10-16|09:00': 20,
  'vedanta|2026-10-18|08:00': 6,
  'vedanta|2026-10-18|13:30': 4,
  'giliExpress|2026-10-18|09:15': 16,
  'lombokSunset|2026-10-18|16:30': 6,
  'moanaNui|2026-10-18|09:00': 8,
  'teva|2026-10-18|17:00': 6,
  'moanaNui|2026-10-19|09:00': 7,
  'teva|2026-10-19|17:00': 6,
  'moanaNui|2026-10-20|09:00': 2,
  'teva|2026-10-20|17:00': 1,
  'moanaNui|2026-10-21|09:00': 0,
};

export const RACE_DEPARTURE = 'lagoon380|2026-10-18|13:30';
export const DAYS_AHEAD = 60;

function buildDepartures(): Departure[] {
  const out: Departure[] = [];
  for (const boat of BOATS) {
    for (let i = 0; i <= DAYS_AHEAD; i++) {
      const date = addDays(TODAY, i);
      for (const [time, label, hours, price] of SLOTS[boat.id] ?? []) {
        const id = `${boat.id}|${date}|${time}`;
        const cap = boat.specs.maxGuests;
        const h = hash(id);
        const booked = id in FIXED ? FIXED[id] : h < 14 ? cap : Math.floor((cap * h * 0.8) / 100);
        out.push({ id, boatId: boat.id, date, time, label, hours, capacity: cap, booked, pricePerGuest: price });
      }
    }
  }
  return out;
}

export const SEED_BOOKINGS: Booking[] = [
  { id: 'TDP-26-1213-4H9X', departureId: 'aurelia|2026-12-13|18:00', seats: 2, total: 2900, source: 'app', createdAt: Date.UTC(2026, 8, 28, 9, 12), status: 'confirmed' },
  { id: 'TDP-26-1106-2M8P', departureId: 'vedanta|2026-11-06|08:00', seats: 4, total: 960, source: 'app', createdAt: Date.UTC(2026, 8, 20, 14, 3), status: 'weather-cancelled' },
];

export function seedInventory(): InventoryState {
  const s = createInventory(buildDepartures(), { bali46: true });
  const departures = { ...s.departures };
  const v = departures['vedanta|2026-11-06|08:00'];
  departures[v.id] = { ...v, cancelled: true, booked: 0 };
  return { ...s, departures, bookings: Object.fromEntries(SEED_BOOKINGS.map((b) => [b.id, b])) };
}

export const SEED_NOTICES: Notice[] = [
  { id: 'n-weather', kind: 'weather', title: 'Weather cancellation - Vedanta', body: 'Strong winds forecast for the Lombok Strait on Thu 6 Nov. Your trip is cancelled and A$960 is refunded to Visa 4242.', when: '2 h ago', unread: true, bookingId: 'TDP-26-1106-2M8P', boatId: 'vedanta' },
  { id: 'n-seat', kind: 'seat', title: 'A seat opened on Tahiti, Sun 19 Oct', body: 'Moana Nui, Papeete Coastal Cruise - 1 spot available on the catamaran.', when: '12 min ago', unread: true, boatId: 'moanaNui' },
  { id: 'n-paid', kind: 'payment', title: 'Charter payment cleared', body: 'Aurelia, Sydney Harbour sunset - A$2,900.', when: '28 Sep', bookingId: 'TDP-26-1213-4H9X' },
];

export const USER = { name: 'Olivia Hart', first: 'Olivia', email: 'olivia.hart@gmail.com', phone: '+61 412 555 019', since: 2025, card: 'Visa 4242' };

export const FEEDS = [
  { source: 'pms' as const, boats: 142, lag: 8 },
  { source: 'agency' as const, boats: 58, lag: 21 },
  { source: 'manual' as const, boats: 6, lag: 0 },
];
