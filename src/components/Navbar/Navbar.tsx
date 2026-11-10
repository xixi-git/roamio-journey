import { Link, NavLink } from 'react-router';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/trips', label: 'My Trips', end: false },
  { to: '/explore', label: 'Explore', end: true },
  { to: '/shared', label: 'Shared Trips', end: true },
  { to: '/stats', label: 'Stats', end: true },
];

export default function Navbar() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link className="site-brand" to="/" aria-label="Roamio home">
          RO<span>A</span>MIO
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : undefined}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
