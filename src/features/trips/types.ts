export interface TripInspiration {
  id: string;
  kind?: 'place' | 'route' | 'food' | 'moment';
  imageUrl: string; // 图片的Base64或者云端URL
  reason: string;   // 核心理由，例如：“一定要在这里看一次日落！” 或 “必须打卡的莫奈睡莲”
  locationName: string; // 具体的向往地点，如“埃菲尔铁塔下方的草坪”
}

export type Trip = {
  id?: string;
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
  inspirations?: TripInspiration[];
  budget?: number;
  summary?: string;
  itinerary?: ItineraryDay[];
};

export type InspirationKind = 'place' | 'route' | 'food' | 'moment';

export interface PlanInspiration extends TripInspiration {
  kind: InspirationKind;
}

export interface ItineraryDay {
  date: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  notes: string;
}

export interface TripPlan {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  lane: number;
  start: string;
  end: string;
  image: string;
  alt: string;
  coordinates?: { lat: number; lon: number };
  coverImage: string;
  summary: string;
  budget: number | null;
  tags: string[];
  inspirations: PlanInspiration[];
  itinerary: ItineraryDay[];
  updatedAt: string;
}

