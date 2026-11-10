import { useMemo } from 'react';
import { Edit } from 'lucide-react';
import { Link } from 'react-router';
import { isTripFuture, formatTripRange } from '../../../../features/trips/model';
import type { Trip } from '../../../../features/trips/types';


export default function HomeFuture({ trips }: { trips: Trip[] }) {
  const nextTrip = useMemo(() => {
      return trips.filter((trip) => isTripFuture(trip)).sort((a, b) => a.start.localeCompare(b.start))[0];
    }, [trips]);
  if (!nextTrip) return <section className="home-panel future-panel future-empty"><p>Plan a trip and it will show up here.</p><Link to="/trips/new">Plan a new trip</Link></section>;
  const inspirations = nextTrip.inspirations ?? [];
  return (
    <section className="home-panel future-panel">
        <div className="future-title"><div><h2>{`${nextTrip.city}, ${nextTrip.country}`}</h2><span>{formatTripRange(nextTrip.start, nextTrip.end)}{nextTrip.budget ? ` · $${nextTrip.budget}` : ""}</span></div><Link aria-label="Edit trip" to={`/trips/${nextTrip.id}/edit`}><Edit /></Link></div>
        <div className="future-meta">
            <div className="avatars">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=90&q=75" alt="Jenna"/>
                <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=90&q=75" alt="Trip companion"/>
            </div>
            <div className="interest-tags">
                {
                    nextTrip.tags.length ? nextTrip.tags.map((tag) => {
                        return <span key={tag}>{tag}</span>
                    }):<span>Montmartre</span>
                }
            </div>
        </div>
        <div className="future-photos">
            <div className="mini-map">
                {
                    inspirations[1]?.imageUrl ?
                    <img src={inspirations[1].imageUrl} alt={inspirations[1].locationName || 'A saved inspiration'}/>
                    :
                    <svg viewBox="0 0 150 165" aria-hidden="true"><path d="M-5 45 58 30l24 18 30-13 44 16M-8 91l51-20 30 17 30-17 47 22M12 168l18-52 23-21 32 23 17-28 26-7M26-8l16 42-18 30 25 29-13 38M104-8 91 32l18 24-17 32 17 29-7 56"/><path className="route" d="M41 70c16 3 16-22 29-22s7 30 23 30 12-27 31-22"/><circle cx="41" cy="70" r="4"/><circle cx="93" cy="78" r="4"/><circle cx="124" cy="56" r="4"/></svg>
                }
            </div>
            <div className="stay-photo">
                <img src={inspirations[0]?.imageUrl || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=85'} alt={inspirations[0]?.locationName || 'A place to look forward to'}/>
                <span>{inspirations[0]?.locationName || 'A reason to go'}{inspirations[0]?.reason && <><br/>{inspirations[0].reason}</>}</span>
            </div>
        </div>
    </section>
  );
}
