import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ImagePlus, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { createId, createDefaultDates, formatDate, getDateRange, readTripPlans, writeTripPlans } from './tripPlans';
import type { ItineraryDay, PlanInspiration, TripPlan } from '../../features/trips/types';
import './trips.css';

const blankInspiration = (): PlanInspiration => ({ id: createId(), kind: 'place', locationName: '', reason: '', imageUrl: '' });
type LocationResult = { id: number; name: string; country: string; country_code: string; latitude: number; longitude: number; admin1?: string };

function createDraft(): TripPlan {
  const dates = createDefaultDates();
  const itinerary = getDateRange(dates.start, dates.end).map((date, index) => ({
    date, title: index === 0 ? 'Arrival & settle in' : index === 5 ? 'A slow goodbye' : `Day ${index + 1}`,
    morning: '', afternoon: '', evening: '', notes: '',
  }));
  return {
    id: createId(), city: '', country: '', countryCode: '', lane: 0, start: dates.start, end: dates.end,
    image: 'photo-1500530855697-b586d89ba3ee', alt: 'A landscape for this trip',
    coverImage: '', summary: '', budget: null, tags: [], inspirations: [blankInspiration()], itinerary,
    updatedAt: new Date().toISOString(),
  };
}

function syncItinerary(days: ItineraryDay[], start: string, end: string) {
  return getDateRange(start, end).map((date, index) => days[index]
    ? { ...days[index], date }
    : { date, title: `Day ${index + 1}`, morning: '', afternoon: '', evening: '', notes: '' });
}

export default function TripPlanForm() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(planId);
  const [draft, setDraft] = useState<TripPlan>(() => createDraft());
  const [placeSelected, setPlaceSelected] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!planId) return;
    const plan = readTripPlans().find((item) => item.id === planId);
    if (plan) {
      setDraft(plan);
      setPlaceSelected(Boolean(plan.coordinates));
    }
    else setNotFound(true);
  }, [planId]);

  useEffect(() => {
    const query = draft.city.trim();
    if (query.length < 2 || placeSelected) {
      setLocationResults([]);
      setSearchingLocations(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingLocations(true);
      const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
      if (/^[a-z]{2}$/i.test(draft.countryCode)) params.set('countryCode', draft.countryCode.toUpperCase());
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Location search failed');
        const result = await response.json() as { results?: LocationResult[] };
        setLocationResults(result.results ?? []);
      } catch {
        if (!controller.signal.aborted) setLocationResults([]);
      } finally {
        if (!controller.signal.aborted) setSearchingLocations(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft.city, draft.countryCode, placeSelected]);

  const days = useMemo(() => getDateRange(draft.start, draft.end), [draft.start, draft.end]);
  const setField = <K extends keyof TripPlan>(key: K, value: TripPlan[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const updateDates = (key: 'start' | 'end', value: string) => setDraft((current) => {
    const next = { ...current, [key]: value };
    return { ...next, itinerary: syncItinerary(current.itinerary, next.start, next.end) };
  });

  const updateDay = <K extends keyof ItineraryDay>(index: number, key: K, value: ItineraryDay[K]) => setDraft((current) => ({
    ...current,
    itinerary: current.itinerary.map((day, dayIndex) => dayIndex === index ? { ...day, [key]: value } : day),
  }));

  const updateInspiration = <K extends keyof PlanInspiration>(id: string, key: K, value: PlanInspiration[K]) => setDraft((current) => ({
    ...current,
    inspirations: current.inspirations.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!draft.coordinates) {
      setError('请选择一个城市搜索结果，自动填写城市坐标后再保存。');
      return;
    }
    if (new Date(`${draft.end}T12:00:00`) < new Date(`${draft.start}T12:00:00`)) {
      setError('结束日期需要在开始日期之后。');
      return;
    }
    const plan = {
      ...draft,
      city: draft.city.trim(),
      country: draft.country.trim(),
      countryCode: draft.countryCode.trim().toUpperCase(),
      tags: draft.tags.map((tag) => tag.trim()).filter(Boolean),
      inspirations: draft.inspirations.filter((item) => item.locationName.trim() || item.reason.trim() || item.imageUrl.trim()),
      itinerary: syncItinerary(draft.itinerary, draft.start, draft.end),
      updatedAt: new Date().toISOString(),
    };
    const plans = readTripPlans();
    writeTripPlans(editing
      ? plans.map((item) => item.id === plan.id ? plan : item)
      : [plan, ...plans]);
    navigate(`/trips/${plan.id}`);
  };

  if (notFound) {
    return <div className="trip-page"><div className="trip-empty"><h1>Trip not found</h1><p>This plan may have been removed.</p><Link className="trip-button" to="/trips">Back to My Trips</Link></div></div>;
  }

  return (
    <div className="trip-page">
      <div className="trip-page-inner">
        <Link className="trip-back" to={editing && planId ? `/trips/${planId}` : '/trips'}><ArrowLeft />{editing ? 'Back to trip' : 'My Trips'}</Link>
        <header className="trip-page-heading">
          <span className="trip-eyebrow"><Sparkles />MAKE SPACE FOR WHAT MOVES YOU</span>
          <h1>{editing ? 'Edit your trip' : 'A trip worth looking forward to.'}</h1>
          <p>Start with the places and moments you’re excited about. The day-by-day plan can come together at your own pace.</p>
        </header>

        <form className="trip-form" onSubmit={submit}>
          <section className="trip-form-section">
            <div className="trip-section-heading"><span>01</span><div><h2>The destination</h2><p>Give this trip a place, a time, and a little context.</p></div></div>
            <div className="trip-field-grid">
              <div className="trip-field trip-location-field"><label htmlFor="trip-city"><span>City or region <small>Select a search result to set coordinates</small></span></label><input id="trip-city" required role="combobox" aria-autocomplete="list" aria-expanded={locationResults.length > 0 || searchingLocations} autoComplete="off" value={draft.city} onChange={(event) => { setField('city', event.target.value); setField('country', ''); setField('countryCode', ''); setField('coordinates', undefined); setPlaceSelected(false); }} placeholder="Search a city, e.g. Kyoto" />
                {draft.city.trim().length >= 2 && !placeSelected && <div className="location-results" role="listbox">{searchingLocations && <p className="location-search-status">Searching places…</p>}{locationResults.map((location) => <button type="button" role="option" aria-selected="false" key={location.id} onClick={() => { setField('city', location.name); setField('country', location.country); setField('countryCode', location.country_code.toUpperCase()); setField('coordinates', { lat: location.latitude, lon: location.longitude }); setPlaceSelected(true); setLocationResults([]); }}><MapPin /><span><strong>{location.name}</strong><small>{[location.admin1, location.country].filter(Boolean).join(', ')}</small></span></button>)}{!searchingLocations && !locationResults.length && <p className="location-search-status">No matching places found.</p>}<small className="location-attribution">Place coordinates by Open-Meteo · GeoNames</small></div>}
              </div>
              <label className="trip-field"><span>Country</span><input required value={draft.country} onChange={(event) => setField('country', event.target.value)} placeholder="e.g. Japan" /></label>
              <label className="trip-field"><span>Country code <small>ISO 2-letter code</small></span><input maxLength={2} value={draft.countryCode} onChange={(event) => setField('countryCode', event.target.value.toUpperCase())} placeholder="JP" /></label>
              <label className="trip-field"><span>Trip style <small>Separate with commas</small></span><input value={draft.tags.join(', ')} onChange={(event) => setField('tags', event.target.value.split(','))} placeholder="Food, slow travel, culture" /></label>
              <label className="trip-field"><span>Departure</span><input required type="date" value={draft.start} onChange={(event) => updateDates('start', event.target.value)} /></label>
              <label className="trip-field"><span>Return</span><input required type="date" min={draft.start} value={draft.end} onChange={(event) => updateDates('end', event.target.value)} /></label>
              <label className="trip-field"><span>Estimated budget <small>USD</small></span><input min="0" type="number" value={draft.budget ?? ''} onChange={(event) => setField('budget', event.target.value ? Number(event.target.value) : null)} placeholder="Optional" /></label>
              <label className="trip-field"><span>Cover image URL <small>Optional · Unsplash recommended</small></span><input type="url" value={draft.coverImage} onChange={(event) => setField('coverImage', event.target.value)} placeholder="https://images.unsplash.com/…" /></label>
              <label className="trip-field trip-field-wide"><span>What are you hoping this trip feels like?</span><textarea rows={3} value={draft.summary} onChange={(event) => setField('summary', event.target.value)} placeholder="A quiet week of neighborhood walks, good coffee, and time near the water…" /></label>
            </div>
          </section>

          <section className="trip-form-section inspiration-section">
            <div className="trip-section-heading"><span>02</span><div><h2>Reasons to go</h2><p>Save the places, routes, meals, and little moments you don’t want to forget.</p></div></div>
            <div className="inspiration-list">
              {draft.inspirations.map((item, index) => (
                <article className="inspiration-editor" key={item.id}>
                  <div className="inspiration-editor-top"><span>INSPIRATION {String(index + 1).padStart(2, '0')}</span><button className="icon-button" type="button" aria-label="Remove inspiration" onClick={() => setField('inspirations', draft.inspirations.filter((entry) => entry.id !== item.id))}><Trash2 /></button></div>
                  <div className="trip-field-grid">
                    <label className="trip-field"><span>What is it?</span><select value={item.kind} onChange={(event) => updateInspiration(item.id, 'kind', event.target.value as PlanInspiration['kind'])}><option value="place">Must-see place</option><option value="route">Route or walk</option><option value="food">Food to try</option><option value="moment">A moment to make</option></select></label>
                    <label className="trip-field"><span>Place or idea</span><input value={item.locationName} onChange={(event) => updateInspiration(item.id, 'locationName', event.target.value)} placeholder="Fushimi Inari at sunrise" /></label>
                    <label className="trip-field trip-field-wide"><span>Why does this matter to you?</span><textarea rows={2} value={item.reason} onChange={(event) => updateInspiration(item.id, 'reason', event.target.value)} placeholder="The quiet before the crowds arrive, and a view across the city…" /></label>
                    <label className="trip-field trip-field-wide"><span>Image URL <small>Optional</small></span><span className="trip-input-with-icon"><ImagePlus /><input type="url" value={item.imageUrl} onChange={(event) => updateInspiration(item.id, 'imageUrl', event.target.value)} placeholder="Add a photo that brings this idea to life" /></span></label>
                  </div>
                </article>
              ))}
            </div>
            <button className="trip-add-button" type="button" onClick={() => setField('inspirations', [...draft.inspirations, blankInspiration()])}><Plus />Add an inspiration</button>
          </section>

          <section className="trip-form-section itinerary-section">
            <div className="trip-section-heading"><span>03</span><div><h2>A gentle outline</h2><p>{days.length} days generated from your dates. Add detail now or leave it open for later.</p></div></div>
            <div className="itinerary-editor-list">
              {draft.itinerary.map((day, index) => (
                <details className="itinerary-editor" key={day.date} open={index === 0}>
                  <summary><span className="itinerary-day-number">{String(index + 1).padStart(2, '0')}</span><span className="itinerary-day-date">{formatDate(day.date)}</span><strong>{day.title || `Day ${index + 1}`}</strong><span className="itinerary-chevron">+</span></summary>
                  <div className="itinerary-fields">
                    <label className="trip-field trip-field-wide"><span>Day title</span><input value={day.title} onChange={(event) => updateDay(index, 'title', event.target.value)} placeholder={`Day ${index + 1}`} /></label>
                    <label className="trip-field"><span>Morning</span><textarea rows={2} value={day.morning} onChange={(event) => updateDay(index, 'morning', event.target.value)} placeholder="Coffee, first stop…" /></label>
                    <label className="trip-field"><span>Afternoon</span><textarea rows={2} value={day.afternoon} onChange={(event) => updateDay(index, 'afternoon', event.target.value)} placeholder="Explore, take a break…" /></label>
                    <label className="trip-field"><span>Evening</span><textarea rows={2} value={day.evening} onChange={(event) => updateDay(index, 'evening', event.target.value)} placeholder="Dinner, sunset…" /></label>
                    <label className="trip-field"><span>Notes</span><textarea rows={2} value={day.notes} onChange={(event) => updateDay(index, 'notes', event.target.value)} placeholder="Reservations, tickets, reminders…" /></label>
                  </div>
                </details>
              ))}
              {!days.length && <p className="trip-form-hint">Choose a valid date range to create your itinerary days.</p>}
            </div>
          </section>

          {error && <p className="trip-form-error" role="alert">{error}</p>}
          <div className="trip-form-actions"><Link className="trip-cancel" to={editing && planId ? `/trips/${planId}` : '/trips'}>Cancel</Link><button className="trip-button" type="submit">{editing ? 'Save changes' : 'Save trip plan'}</button></div>
        </form>
      </div>
    </div>
  );
}
