import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3 } from 'lucide-react';
import { formatTripRange, type Trip } from '../../trips';


export default function HomeMap({ trips }: { trips: Trip[] }) {
  const [active, setActive] = useState(0);
  const previousTrips = trips;
  console.log(trips)
  const go = (amount: number) => {
    if (previousTrips.length) setActive((current) => (current + amount + previousTrips.length) % previousTrips.length);
  };
  const selectedIndex = previousTrips.length ? active % previousTrips.length : 0;

  return (
    <section className="home-panel previous-panel" aria-label="Previous trips">
      <div className="panel-heading">
        <h2><Clock3 />Previous trips</h2>
        <button className="pill-button" type="button" onClick={() => go(1)}>See all</button>
      </div>
      <div className="trip-stack" aria-live="polite">
        {previousTrips.length ? previousTrips.map((trip, index) => {
          const offset = (index - selectedIndex + previousTrips.length) % previousTrips.length;
          return (
            <button
              className="trip-card"
              data-pos={offset < 4 ? offset : 'hidden'}
              type="button"
              key={`${trip.city}-${trip.start}`}
              aria-label={`${trip.city}, ${trip.country}, ${formatTripRange(trip.start, trip.end)}`}
              aria-current={selectedIndex === index}
              tabIndex={selectedIndex === index ? 0 : -1}
              onClick={() => offset === 0 ? go(1) : setActive(index)}
            >
              <img src={`https://images.unsplash.com/${trip.image}?auto=format&fit=crop&w=900&q=85`} alt={trip.alt} />
              <span className="trip-card-content">
                <span className="trip-card-name">{trip.city.toUpperCase()}</span>
                <span className="trip-card-date">{formatTripRange(trip.start, trip.end)}</span>
                <span className="trip-card-open"><ArrowUpRight /></span>
                <span className="trip-card-tags">{trip.tags.map((tag) => <span key={tag}>{tag}</span>)}</span>
              </span>
            </button>
          );
        }) : <p className="previous-empty">Your completed trips will appear here.</p>}
      </div>
      <div className="trip-controls">
        <button type="button" aria-label="Previous trip" onClick={() => go(-1)}><ArrowLeft /></button>
        {previousTrips.map((trip, index) => <button key={`${trip.city}-${trip.start}`} className={index === selectedIndex ? 'current' : ''} type="button" aria-label={`Show ${trip.city}`} onClick={() => setActive(index)} />)}
        <button type="button" aria-label="Next trip" onClick={() => go(1)}><ArrowRight /></button>
      </div>
    </section>
  );
}