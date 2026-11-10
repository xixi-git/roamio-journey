import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import './Home.css';
import Account from './components/Account/Account';
import Calendar from './components/Calendar/Calendar';
import Future from './components/Future/Future';
import History from './components/History/History';
import HomeMap from './components/Map/Map';
import { type Trip } from '../../features/trips/types';
import { readTripPlans, toHomeTrip } from '../Trips/tripPlans';


export default function Home() {
  const [trips, setTrips] = useState<Trip[]>(() => readTripPlans().map(toHomeTrip));

  useEffect(() => {
    const refreshTrips = () => setTrips(readTripPlans().map(toHomeTrip));
    window.addEventListener('roamio:trip-plans-changed', refreshTrips);
    window.addEventListener('storage', refreshTrips);
    return () => {
      window.removeEventListener('roamio:trip-plans-changed', refreshTrips);
      window.removeEventListener('storage', refreshTrips);
    };
  }, []);

  return (
    <main className="Roamio-home">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <Link className="Roamio-logo" to="/" aria-label="Roamio home">RO<span>A</span>MIO</Link>
          <nav className="dashboard-nav" aria-label="Main navigation">
            <NavLink to="/" className={({ isActive }) => isActive ? 'selected' : undefined}>Home</NavLink><Link to="/trips">My Trips</Link><Link to="/explore">Explore</Link><Link to="/shared">Shared Trips</Link><Link to="/stats">Stats</Link>
          </nav>
          <div className="dashboard-actions"><Link className="plan-button" to="/trips/new">Plan a new trip</Link></div>
        </header>

        <div className="dashboard-grid">
          <Account />

          <Calendar trips={trips} />

          <Future trips={trips} />

          <History trips={trips} />

          <HomeMap trips={trips} />
        </div>
        <div className="dashboard-footer"><span>ROAMIO · MAKE ROOM FOR THE WORLD</span><span>YOUR TRAVEL YEAR, AT A GLANCE</span></div>
      </div>
    </main>
  );
}
