import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarDays, Compass, Edit3, MapPin, Plus, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import { getDateRange, formatPlanRange, readTripPlans } from './tripPlans';
import type { TripPlan } from '../../features/trips/types';
import './trips.css';

function planStatus(plan: TripPlan) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${plan.start}T00:00:00`);
  const end = new Date(`${plan.end}T23:59:59`);
  if (end < today) return 'Completed';
  if (start <= today) return 'In progress';
  return 'Upcoming';
}

export default function MyTrips() {
  const [plans, setPlans] = useState<TripPlan[]>(() => readTripPlans());

  useEffect(() => {
    const refresh = () => setPlans(readTripPlans());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('roamio:trip-plans-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('roamio:trip-plans-changed', refresh);
    };
  }, []);

  const upcomingCount = plans.filter((plan) => planStatus(plan) === 'Upcoming').length;

  return (
    <div className="trip-page trips-list-page">
      <div className="trip-page-inner">
        {/* <Link className="trip-back" to="/"><ArrowLeft />Home</Link> */}
        <header className="trips-list-heading">
          <div>
            <span className="trip-eyebrow"><Compass />YOUR TRAVEL NOTEBOOK</span>
            <h1>My Trips<span>.</span></h1>
            <p>Keep the plans, the reasons, and the little details that make a trip yours.</p>
          </div>
          <Link className="trip-button" to="/trips/new"><Plus />Plan a new trip</Link>
        </header>

        <div className="trips-summary">
          <div><strong>{plans.length}</strong><span>Trips saved</span></div>
          <div><strong>{upcomingCount}</strong><span>Still ahead</span></div>
          <p>Good plans make room for wonder. You can change every detail as you go.</p>
        </div>

        {plans.length ? (
          <section className="trip-card-grid" aria-label="Saved trips">
            {plans.map((plan) => {
              const status = planStatus(plan);
              const inspirations = plan.inspirations.filter((item) => item.locationName || item.imageUrl);
              const dayCount = getDateRange(plan.start, plan.end).length;
              return (
                <article className="saved-trip-card" key={plan.id}>
                  <Link className="saved-trip-image" to={`/trips/${plan.id}`} style={plan.coverImage ? { backgroundImage: `linear-gradient(180deg, transparent 35%, #18201bbb 100%), url("${plan.coverImage}")` } : undefined}>
                    {!plan.coverImage && <span className="saved-trip-image-placeholder"><MapPin /></span>}
                    <span className={`trip-status ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                    <ArrowUpRight className="saved-trip-open" />
                    <span className="saved-trip-image-title"><strong>{plan.city || 'Untitled destination'}</strong><small>{plan.country}</small></span>
                  </Link>
                  <div className="saved-trip-body">
                    <div className="saved-trip-dates"><CalendarDays />{formatPlanRange(plan.start, plan.end)}</div>
                    <div className="saved-trip-meta"><span>{dayCount} days</span>{plan.budget !== null && <span><Wallet />${plan.budget.toLocaleString()}</span>}</div>
                    {plan.summary && <p className="saved-trip-summary">{plan.summary}</p>}
                    {!!inspirations.length && <div className="saved-trip-inspirations">{inspirations.slice(0, 3).map((item) => <span key={item.id}>{item.locationName}</span>)}</div>}
                    <div className="saved-trip-tags">{plan.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <div className="saved-trip-links"><Link className="saved-trip-details" to={`/trips/${plan.id}`}>View trip <ArrowUpRight /></Link><Link className="saved-trip-edit" to={`/trips/${plan.id}/edit`}><Edit3 />Edit</Link></div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="trip-empty">
            <span className="trip-empty-icon"><Compass /></span>
            <span className="trip-eyebrow">YOUR NEXT STORY STARTS HERE</span>
            <h2>What have you been dreaming about?</h2>
            <p>Save the places you want to see and why they matter. We’ll help turn those sparks into a plan.</p>
            <Link className="trip-button" to="/trips/new"><Plus />Start a trip plan</Link>
          </section>
        )}
      </div>
    </div>
  );
}
