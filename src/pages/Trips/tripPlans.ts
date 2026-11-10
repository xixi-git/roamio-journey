import { initialTrips } from '../../features/trips/model';
import type { Trip, TripPlan } from '../../features/trips/types';

const STORAGE_KEY = 'roamio.trip-plans.v1';

export function readTripPlans(): TripPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const value: unknown = JSON.parse(stored);
      return Array.isArray(value) ? value as TripPlan[] : [];
    }
    const initial = initialTrips.map(fromHomeTrip);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

export function writeTripPlans(plans: TripPlan[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  window.dispatchEvent(new Event('roamio:trip-plans-changed'));
}

function fromHomeTrip(trip: Trip): TripPlan {
  return {
    id: trip.id ?? createId(), city: trip.city, country: trip.country, countryCode: trip.countryCode,
    lane: trip.lane, start: trip.start, end: trip.end, image: trip.image, alt: trip.alt,
    coordinates: trip.coordinates, coverImage: `https://images.unsplash.com/${trip.image}?auto=format&fit=crop&w=1400&q=85`,
    summary: trip.summary ?? '', budget: trip.budget ?? null, tags: trip.tags,
    inspirations: (trip.inspirations ?? []).map((inspiration) => ({ ...inspiration, kind: inspiration.kind ?? 'place' })),
    itinerary: trip.itinerary ?? getDateRange(trip.start, trip.end).map((date, index) => ({
      date, title: `Day ${index + 1}`, morning: '', afternoon: '', evening: '', notes: '',
    })), updatedAt: new Date().toISOString(),
  };
}

export function toHomeTrip(plan: TripPlan): Trip {
  const imageUrl = plan.coverImage.trim();
  const imageId = imageUrl.includes('images.unsplash.com/')
    ? imageUrl.split('images.unsplash.com/')[1].split(/[?#]/)[0]
    : plan.image;
  return {
    id: plan.id, city: plan.city, country: plan.country, countryCode: plan.countryCode, start: plan.start, end: plan.end,
    lane: plan.lane, image: imageId || plan.image, alt: plan.alt || `${plan.city} travel`, tags: plan.tags,
    coordinates: plan.coordinates ?? { lat: 0, lon: 0 },
    inspirations: plan.inspirations.map(({ id, locationName, reason, imageUrl: inspirationImage }) => ({ id, locationName, reason, imageUrl: inspirationImage })),
    budget: plan.budget ?? undefined, summary: plan.summary, itinerary: plan.itinerary,
  };
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDateRange(start: string, end: string) {
  if (!start || !end) return [];
  const first = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime()) || last < first) return [];
  const dates: string[] = [];
  for (const day = new Date(first); day <= last && dates.length < 60; day.setDate(day.getDate() + 1)) {
    dates.push(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

export function formatDate(date: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T12:00:00`));
}

export function formatPlanRange(start: string, end: string) {
  const date = (value: string) => new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  return start && end ? `${date(start)} – ${date(end)}` : 'Dates not set';
}

export function createDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 30);
  const end = new Date(start);
  end.setDate(end.getDate() + 5);
  const toIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { start: toIso(start), end: toIso(end) };
}

