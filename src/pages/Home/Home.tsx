import { Headphones, Settings, UserRound } from 'lucide-react';
import './Home.css';
import Calendar from './components/Calendar/Calendar';
import History from './components/History/History';
import HomeMap from './components/Map/Map';
import { isTripPast, type Trip } from './trips';

const trips: Trip[] = [
  { city: 'Vienna', country: 'Austria', countryCode: 'AT', start: '2026-01-01', end: '2026-01-05', lane: 0, image: 'photo-1516550893923-42d28e5677af', alt: 'Vienna city view', tags: ['Culture', 'City break'], coordinates: { lat: 48.2082, lon: 16.3738 } },
  { city: 'Lisbon', country: 'Portugal', countryCode: 'PT', start: '2026-05-19', end: '2026-06-02', lane: 1, image: 'photo-1555881400-74d7acaacd8b', alt: 'Lisbon rooftops', tags: ['Friends', 'Coastal'], coordinates: { lat: 38.7223, lon: -9.1393 } },
  { city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', start: '2027-06-12', end: '2027-06-17', lane: 0, image: 'photo-1513622470522-26c3c8a854bc', alt: 'Copenhagen waterfront', tags: ['Solo', 'Culture'], coordinates: { lat: 55.6761, lon: 12.5683 } },
  { city: 'Paris', country: 'France', countryCode: 'FR', start: '2025-07-26', end: '2025-07-28', lane: 1, image: 'photo-1502602898657-3e91760cbb34', alt: 'Eiffel Tower in Paris', tags: ['Culture', 'Food'], coordinates: { lat: 48.8566, lon: 2.3522 } },
  { city: 'Kyoto', country: 'Japan', countryCode: 'JP', start: '2026-08-10', end: '2026-08-18', lane: 0, image: 'photo-1493976040374-85c8e12f0c0e', alt: 'Kyoto street', tags: ['Solo', 'Cultural'], coordinates: { lat: 35.0116, lon: 135.7681 } },
  { city: 'Bali', country: 'Indonesia', countryCode: 'ID', start: '2027-09-03', end: '2027-10-31', lane: 2, image: 'photo-1537996194471-e657df975ab4', alt: 'Bali coastline', tags: ['Solo', 'Island'], coordinates: { lat: -8.4095, lon: 115.1889 } },
  { city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', start: '2026-11-17', end: '2026-11-23', lane: 1, image: 'photo-1541432901042-2d8bd64b4a9b', alt: 'Istanbul skyline', tags: ['Friends', 'Explore'], coordinates: { lat: 41.0082, lon: 28.9784 } },
  { city: 'New York', country: 'United States', countryCode: 'US', start: '2027-10-08', end: '2027-10-14', lane: 0, image: 'photo-1518391846015-55a9cc003b25', alt: 'New York skyline', tags: ['Friends', 'City break'], coordinates: { lat: 40.7128, lon: -74.006 } },
];

const previousTrips = trips.filter((trip) => isTripPast(trip)).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 5);

export default function Home() {
  return (
    <main className="Roamio-home">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <a className="Roamio-logo" href="/" aria-label="Roamio home">RO<span>A</span>MIO</a>
          <nav className="dashboard-nav" aria-label="Main navigation">
            <a className="selected" href="/">Home</a><a href="/trips">My Trips</a><a href="/explore">Explore</a><a href="/shared">Shared Trips</a><a href="/stats">Stats</a>
          </nav>
          <div className="dashboard-actions"><button className="round-action" aria-label="Help" type="button"><Headphones /></button><button className="round-action" aria-label="Settings" type="button"><Settings /></button><button className="plan-button" type="button">Plan a new trip</button></div>
        </header>

        <div className="dashboard-grid">
          <section className="home-panel account-panel">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=90" alt="Jenna Peterson in Paris" />
            <div className="account-shade" />
            <div className="account-top"><span><UserRound />Account</span><button aria-label="Account settings" type="button"><Settings /></button></div>
            <div className="account-name"><strong>JENNA PETERSON</strong><span>12,540 Miles Traveled</span></div>
          </section>

          <Calendar trips={trips} />

          <section className="home-panel paris-panel">
            <div className="paris-title"><div><h2>PARIS, FRANCE</h2><span>26 – 28 Jul · $864</span></div><button aria-label="Trip settings" type="button"><Settings /></button></div>
            <div className="paris-meta"><div className="avatars"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=90&q=75" alt="Jenna"/><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=90&q=75" alt="Trip companion"/></div><div className="interest-tags"><span>Montmartre</span><span>Louvre</span><span>Shopping</span></div></div>
            <div className="paris-photos"><div className="mini-map"><svg viewBox="0 0 150 165" aria-hidden="true"><path d="M-5 45 58 30l24 18 30-13 44 16M-8 91l51-20 30 17 30-17 47 22M12 168l18-52 23-21 32 23 17-28 26-7M26-8l16 42-18 30 25 29-13 38M104-8 91 32l18 24-17 32 17 29-7 56"/><path className="route" d="M41 70c16 3 16-22 29-22s7 30 23 30 12-27 31-22"/><circle cx="41" cy="70" r="4"/><circle cx="93" cy="78" r="4"/><circle cx="124" cy="56" r="4"/></svg></div><div className="stay-photo"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=85" alt="Bright Paris apartment near Le Marais"/><span>Ap. near Le Marais:<br/>2 nights · 2 bedrooms</span></div></div>
          </section>

          <History trips={previousTrips} />
          <HomeMap trips={trips} />
        </div>
        <div className="dashboard-footer"><span>ROAMIO · MAKE ROOM FOR THE WORLD</span><span>YOUR TRAVEL YEAR, AT A GLANCE</span></div>
      </div>
    </main>
  );
}
