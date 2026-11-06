import type { ImageKey } from './images';
import type { Source } from '../logic/inventory';

export type BoatType = 'Catamaran' | 'Motor yacht' | 'Phinisi' | 'Fast boat' | 'Sailing yacht';

export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  fleet: number; // boats listed across all operators
  image: ImageKey;
};

export type Boat = {
  id: string;
  name: string;
  type: BoatType;
  destinationId: string;
  location: string;
  operator: string;
  source: Source;
  rating: number;
  reviews: number;
  image: ImageKey;
  specs: { length: string; cabins: number; berths: number; maxGuests: number; year: string; skipper: boolean };
  fromPrice: number;
  about: string;
  amenities: string[];
};

export type Notice = {
  id: string;
  kind: 'weather' | 'seat' | 'reminder' | 'booking' | 'payment';
  title: string;
  body: string;
  when: string;
  unread?: boolean;
  bookingId?: string;
  boatId?: string;
};

export const SOURCE_LABEL: Record<Source, string> = { pms: 'Operator PMS', agency: 'Agency API', manual: 'Manual calendar', app: 'Tidepass' };
export const SOURCE_SHORT: Record<Source, string> = { pms: 'PMS', agency: 'Agency', manual: 'Manual', app: 'App' };
