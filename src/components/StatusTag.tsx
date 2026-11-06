import type { Booking } from '../logic/inventory';
import { Tag } from './Card';

export function StatusTag({ b }: { b: Booking }) {
  if (b.status === 'cancelled') return <Tag label="Cancelled" tone="neutral" />;
  if (b.status === 'weather-cancelled') return <Tag label="Weather cancelled" tone="warning" icon="alert-triangle" />;
  return <Tag label="Confirmed" tone="success" icon="check" />;
}
