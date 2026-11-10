import type { Trip } from './types';

export const initialTrips: Trip[] = [
  { id: 'seed-vienna', city: 'Vienna', country: 'Austria', countryCode: 'AT', start: '2026-01-01', end: '2026-01-05', lane: 0, image: 'photo-1516550893923-42d28e5677af', alt: 'Vienna city view', tags: ['Culture', 'City break'], coordinates: { lat: 48.2082, lon: 16.3738 } },
  { id: 'seed-lisbon', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', start: '2027-05-19', end: '2027-06-02', lane: 1, image: 'photo-1555881400-74d7acaacd8b', alt: 'Lisbon rooftops', tags: ['Friends', 'Coastal'], coordinates: { lat: 38.7223, lon: -9.1393 } },
  { id: 'seed-copenhagen', city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', start: '2028-06-12', end: '2028-06-17', lane: 0, image: 'photo-1513622470522-26c3c8a854bc', alt: 'Copenhagen waterfront', tags: ['Solo', 'Culture'], coordinates: { lat: 55.6761, lon: 12.5683 } },
  { id: 'seed-paris', city: 'Paris', country: 'France', countryCode: 'FR', start: '2025-07-26', end: '2025-07-28', lane: 1, image: 'photo-1502602898657-3e91760cbb34', alt: 'Eiffel Tower in Paris', tags: ['Culture', 'Food'], coordinates: { lat: 48.8566, lon: 2.3522 } },
  { id: 'seed-kyoto', city: 'Kyoto', country: 'Japan', countryCode: 'JP', start: '2026-08-10', end: '2026-08-18', lane: 0, image: 'photo-1493976040374-85c8e12f0c0e', alt: 'Kyoto street', tags: ['Solo', 'Cultural'], coordinates: { lat: 35.0116, lon: 135.7681 } },
  { id: 'seed-bali', city: 'Bali', country: 'Indonesia', countryCode: 'ID', start: '2027-09-03', end: '2027-10-31', lane: 2, image: 'photo-1537996194471-e657df975ab4', alt: 'Bali coastline', tags: ['Solo', 'Island'], coordinates: { lat: -8.4095, lon: 115.1889 } },
  { id: 'seed-istanbul', city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', start: '2026-11-17', end: '2026-11-23', lane: 1, image: 'photo-1541432901042-2d8bd64b4a9b', alt: 'Istanbul skyline', tags: ['Friends', 'Explore'], coordinates: { lat: 41.0082, lon: 28.9784 }, budget: 1234 },
  { id: 'seed-new-york', city: 'New York', country: 'United States', countryCode: 'US', start: '2027-12-08', end: '2027-12-14', lane: 0, image: 'photo-1518391846015-55a9cc003b25', alt: 'New York skyline', tags: ['Friends', 'City break'], coordinates: { lat: 40.7128, lon: -74.006 } },
];

export function parseTripDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getLocalToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTripPast(trip: Trip, today = getLocalToday()) {
  return trip.end < today;
}

export function isTripFuture(trip: Trip, today = getLocalToday()) {
  return trip.start > today;
}

export function formatTripRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' });
  return `${formatter.format(parseTripDate(start))} – ${formatter.format(parseTripDate(end))}`;
}
