export type Trip = {
  city: string;
  country: string;
  countryCode: string;
  start: string;
  end: string;
  lane: number;
  image: string;
  alt: string;
  tags: string[];
  coordinates: { lat: number; lon: number };
};

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

export function formatTripRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' });
  return `${formatter.format(parseTripDate(start))} – ${formatter.format(parseTripDate(end))}`;
}
