import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Edit3, MapPin, Trash2, Wallet } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { formatDate, formatPlanRange, getDateRange, readTripPlans, writeTripPlans } from './tripPlans';
import type { TripPlan } from '../../features/trips/types';
import './trips.css';

const inspirationLabels = { place: 'Must-see place', route: 'Route or walk', food: 'Food to try', moment: 'A moment to make' };

export default function TripDetails() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TripPlan | null>(() => readTripPlans().find((item) => item.id === planId) ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setPlan(readTripPlans().find((item) => item.id === planId) ?? null);
  }, [planId]);

  const removePlan = () => {
    if (!plan) return;
    writeTripPlans(readTripPlans().filter((item) => item.id !== plan.id));
    navigate('/trips');
  };

  if (!plan) {
    return <div className="trip-page"><div className="trip-empty"><h1>Trip not found</h1><p>This plan may have been removed.</p><Link className="trip-button" to="/trips">Back to My Trips</Link></div></div>;
  }

  const dates = getDateRange(plan.start, plan.end);
  const inspirations = plan.inspirations.filter((item) => item.locationName || item.reason || item.imageUrl);

  return (
    <div className="trip-page trip-detail-page">
      <div className="trip-page-inner">
        <div className="trip-detail-toolbar"><Link className="trip-back" to="/trips"><ArrowLeft />My Trips</Link><div className="trip-detail-actions"><button className="trip-outline-button danger" type="button" onClick={() => setConfirmDelete(true)}><Trash2 />Delete</button><Link className="trip-button" to={`/trips/${plan.id}/edit`}><Edit3 />Edit trip</Link></div></div>
        <header className="trip-detail-hero" style={plan.coverImage ? { backgroundImage: `linear-gradient(90deg, #18201bbb, #18201b2a), url("${plan.coverImage}")` } : undefined}>
          <div className="trip-detail-hero-content">
            <span className="trip-eyebrow">{plan.countryCode ? `${plan.countryCode} / ` : ''}A TRIP TO REMEMBER</span>
            <h1>{plan.city}<span>.</span></h1>
            <p><MapPin />{plan.country}</p>
            <div className="trip-detail-hero-meta"><span><CalendarDays />{formatPlanRange(plan.start, plan.end)}</span><span><Clock3 />{dates.length} days</span>{plan.budget !== null && <span><Wallet />${plan.budget.toLocaleString()} budget</span>}</div>
          </div>
          {!plan.coverImage && <div className="trip-detail-hero-orbit" aria-hidden="true" />}
        </header>

        {plan.summary && <section className="trip-detail-intro"><span className="trip-eyebrow">THE FEELING</span><p>{plan.summary}</p></section>}

        {!!plan.tags.length && <div className="trip-detail-tags">{plan.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}

        <section className="trip-detail-section">
          <div className="trip-detail-section-heading"><div><span className="trip-eyebrow">KEEP THE WHY CLOSE</span><h2>Reasons to go<span>.</span></h2></div><p>The places and moments that make this trip yours.</p></div>
          {inspirations.length ? (
            <div className="trip-inspiration-grid">
              {inspirations.map((item) => (
                <article className="trip-inspiration-card" key={item.id}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.locationName || item.reason} /> : <div className="inspiration-image-placeholder"><MapPin /></div>}
                  <div className="trip-inspiration-copy"><span>{inspirationLabels[item.kind]}</span><h3>{item.locationName || 'A place to remember'}</h3><p>{item.reason}</p></div>
                  {item.imageUrl && <a className="inspiration-image-link" href={item.imageUrl} target="_blank" rel="noreferrer" aria-label="Open inspiration image"><ArrowUpRight /></a>}
                </article>
              ))}
            </div>
          ) : <p className="trip-detail-empty-note">Add the places, routes, and flavors you’re excited to discover.</p>}
        </section>

        <section className="trip-detail-section itinerary-detail-section">
          <div className="trip-detail-section-heading"><div><span className="trip-eyebrow">ONE DAY AT A TIME</span><h2>Your itinerary<span>.</span></h2></div><p>{dates.length} days, with plenty of room to breathe.</p></div>
          <div className="trip-day-list">
            {plan.itinerary.map((day, index) => (
              <article className="trip-detail-day" key={`${day.date}-${index}`}>
                <div className="trip-detail-day-date"><span>DAY {String(index + 1).padStart(2, '0')}</span><strong>{formatDate(day.date)}</strong></div>
                <div className="trip-detail-day-content"><h3>{day.title || `Day ${index + 1}`}</h3><div className="trip-day-moments">{(['morning', 'afternoon', 'evening'] as const).map((moment) => day[moment] && <div key={moment}><span>{moment}</span><p>{day[moment]}</p></div>)}</div>{day.notes && <p className="trip-day-notes">Note · {day.notes}</p>}</div>
              </article>
            ))}
          </div>
        </section>

        {confirmDelete && <div className="trip-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmDelete(false); }}><section className="trip-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="trip-empty-icon"><Trash2 /></span><h2 id="delete-title">Delete this trip?</h2><p>The plan and its itinerary will be removed from My Trips.</p><div><button className="trip-cancel" type="button" onClick={() => setConfirmDelete(false)}>Keep trip</button><button className="trip-delete-button" type="button" onClick={removePlan}>Delete trip</button></div></section></div>}
      </div>
    </div>
  );
}
