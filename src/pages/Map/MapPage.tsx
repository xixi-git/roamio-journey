import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowUpRight, CalendarDays, ChevronDown, Globe2, MapPin, MessageCircle, Minus, Plus, Send } from 'lucide-react';
import { Link } from 'react-router';
import { ComposableMap, Geography, Geographies, Marker } from 'react-simple-maps/core';
import { ZoomableGroup } from 'react-simple-maps/zoom';
import type { TripPlan } from '@/features/trips/types';
import { createId, readTripPlans, writeTripPlans } from '@/pages/Trips/tripPlans';
import './MapPage.css';

const GEOGRAPHY_URL = '/world/countries-110m.json';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const COUNTRY_ALIASES: Record<string, string> = {
  'united states': 'united states of america',
  'turkiye': 'turkey',
};

function normalizeCountry(value: unknown) {
  const normalized = String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return COUNTRY_ALIASES[normalized] ?? normalized;
}

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function statusOf(plan: TripPlan, today: string) {
  if (plan.end < today) return 'visited';
  if (plan.start <= today) return 'ongoing';
  return 'planned';
}

export default function MapPage() {
  const [plans, setPlans] = useState<TripPlan[]>(readTripPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 15]);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    const refreshPlans = () => setPlans(readTripPlans());
    window.addEventListener('roamio:trip-plans-changed', refreshPlans);
    window.addEventListener('storage', refreshPlans);
    return () => {
      window.removeEventListener('roamio:trip-plans-changed', refreshPlans);
      window.removeEventListener('storage', refreshPlans);
    };
  }, []);

  const today = localToday();
  const destinations = useMemo(() => plans.filter((plan) => plan.coordinates && Number.isFinite(plan.coordinates.lat) && Number.isFinite(plan.coordinates.lon)), [plans]);
  const countries = useMemo(() => [...new Map(destinations.map((plan) => [plan.countryCode, plan])).values()].sort((a, b) => a.country.localeCompare(b.country)), [destinations]);
  const visitedCount = plans.filter((plan) => statusOf(plan, today) === 'visited').length;
  const plannedCount = plans.filter((plan) => statusOf(plan, today) !== 'visited').length;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const selectedCountryName = countries.find((plan) => plan.countryCode === selectedCountry)?.country;

  const saveReflection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlan || !reflection.trim()) return;
    const now = new Date().toISOString();
    const updatedPlans = plans.map((plan) => plan.id === selectedPlan.id
      ? { ...plan, reflections: [...(plan.reflections ?? []), { id: createId(), body: reflection.trim(), createdAt: now, updatedAt: now }], updatedAt: now }
      : plan);
    writeTripPlans(updatedPlans);
    setPlans(updatedPlans);
    setReflection('');
  };

  const zoomBy = (amount: number) => setZoom((current) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((current + amount) * 10) / 10)));

  return (
    <div className="map-page">
      <div className="map-page-inner">
        <header className="map-page-header">
          <div>
            <span className="map-page-eyebrow"><Globe2 /> YOUR JOURNEY, ON THE MAP</span>
            <h1>Places you carry<span>.</span></h1>
            <p>Every trip leaves a mark. See where you’ve been, what’s ahead, and the memories in between.</p>
          </div>
          <Link className="map-plan-button" to="/trips/new">Plan a new trip <ArrowUpRight /></Link>
        </header>

        <section className="journey-map-card" aria-label="Trip map">
          <div className="journey-map-toolbar">
            <div className="journey-map-stats"><span><strong>{visitedCount}</strong> visited</span><i /><span><strong>{plannedCount}</strong> planned</span></div>
            <label className="journey-country-filter"><span className="sr-only">Highlight a country</span><select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}><option value="all">All countries</option>{countries.map((country) => <option key={country.countryCode} value={country.countryCode}>{country.country}</option>)}</select><ChevronDown /></label>
          </div>
          <ComposableMap className="journey-world-map" width={1100} height={560} projection="geoEquirectangular" role="img" aria-label="World map showing your visited and planned destinations">
            <ZoomableGroup center={center} zoom={zoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} filterZoomEvent={(event) => event.type !== 'wheel'} onMoveEnd={(position) => { setCenter(position.coordinates || [0, 15]); setZoom(position.zoom ?? 1); }}>
              <Geographies geography={GEOGRAPHY_URL}>
                {({ geographies }) => geographies.map((geography) => {
                  const matches = selectedCountry !== 'all' && normalizeCountry(geography.properties?.name) === normalizeCountry(selectedCountryName);
                  return <Geography key={geography.rsmKey} geography={geography} className={`journey-country-shape${matches ? ' highlighted' : ''}`} fill={matches ? '#a68be8' : '#f7f8f4'} stroke="#dbe3df" strokeWidth={0.65} vectorEffect="non-scaling-stroke" />;
                })}
              </Geographies>
              {destinations.map((plan) => {
                const status = statusOf(plan, today);
                const isSelected = plan.id === selectedPlanId;
                return <Marker key={plan.id} coordinates={[plan.coordinates!.lon, plan.coordinates!.lat]} className={`journey-destination ${status}${isSelected ? ' active' : ''}`} onClick={() => setSelectedPlanId(plan.id)}>
                  <g role="button" tabIndex={0} aria-label={`${plan.city}, ${plan.country}; ${status}`} onClick={() => setSelectedPlanId(plan.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedPlanId(plan.id); }}>
                    <circle className="journey-marker-halo" r={8} /><circle className="journey-marker-dot" r={3} />
                    <text x={11} y={-7}>{plan.city}</text>
                  </g>
                </Marker>;
              })}
            </ZoomableGroup>
          </ComposableMap>
          {selectedCountryName && <span className="journey-selected-country"><i />{selectedCountryName}</span>}
          <div className="journey-map-legend"><span><i className="legend-visited" />Visited</span><span><i className="legend-ongoing" />In progress</span><span><i className="legend-planned" />Planned</span><span><i className="legend-country" />Selected country</span></div>
          <div className="journey-map-zoom"><button type="button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => zoomBy(.1)}><Plus /></button><output>{Math.round(zoom * 100)}%</output><button type="button" aria-label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={() => zoomBy(-.1)}><Minus /></button></div>
          {!destinations.length && <div className="journey-map-empty"><MapPin /><strong>Your map is waiting for its first pin.</strong><span>Add a trip to see it appear here.</span><Link to="/trips/new">Create your first trip <ArrowUpRight /></Link></div>}
        </section>

        <div className="map-page-content">
          <section className="map-destinations-section">
            <div className="map-section-heading"><div><span>YOUR COLLECTION</span><h2>Trips on the map</h2></div><span>{plans.length} {plans.length === 1 ? 'trip' : 'trips'}</span></div>
            {plans.length ? <div className="map-trip-list">{[...plans].sort((a, b) => b.start.localeCompare(a.start)).map((plan) => <button type="button" key={plan.id} className={`map-trip-row${selectedPlanId === plan.id ? ' selected' : ''}`} onClick={() => setSelectedPlanId(plan.id)}>
              <span className={`map-trip-thumb ${statusOf(plan, today)}`} style={plan.coverImage ? { backgroundImage: `url("${plan.coverImage}")` } : undefined} />
              <span className="map-trip-row-copy"><strong>{plan.city}</strong><span>{plan.country} · {formatDate(plan.start)}</span></span>
              <span className={`map-trip-status ${statusOf(plan, today)}`}>{statusOf(plan, today) === 'visited' ? 'Visited' : statusOf(plan, today) === 'ongoing' ? 'In progress' : 'Planned'}</span>
            </button>)}</div> : <p className="map-list-empty">Your trips will appear here after you create a plan.</p>}
          </section>

          <aside className="map-memory-panel">
            {selectedPlan ? <>
              <div className="map-memory-heading"><span><MessageCircle /> TRIP MEMORY</span><Link to={`/trips/${selectedPlan.id}`} aria-label={`Open ${selectedPlan.city} trip details`}><ArrowUpRight /></Link></div>
              <h2>{selectedPlan.city}<span>.</span></h2>
              <p className="map-memory-meta"><MapPin />{selectedPlan.country}<i /><CalendarDays />{formatDate(selectedPlan.start)} – {formatDate(selectedPlan.end)}</p>
              {selectedPlan.summary && <p className="map-memory-summary">{selectedPlan.summary}</p>}
              <div className="map-reflections-list">{(selectedPlan.reflections ?? []).length ? selectedPlan.reflections!.map((item) => <article key={item.id}><p>{item.body}</p><time dateTime={item.createdAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}</time></article>) : <p className="map-no-reflections">No memories written yet. Save a thought from this trip.</p>}</div>
              <form className="map-reflection-form" onSubmit={saveReflection}><label htmlFor="trip-reflection">Add a thought</label><textarea id="trip-reflection" value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={2000} placeholder="What do you want to remember?" rows={3} /><div><span>{reflection.length}/2000</span><button type="submit" disabled={!reflection.trim()}><Send />Save memory</button></div></form>
            </> : <div className="map-memory-empty"><MessageCircle /><span>SELECT A PIN</span><h2>Your stories live here.</h2><p>Choose a destination on the map or in your trip list to read and write its memories.</p></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
