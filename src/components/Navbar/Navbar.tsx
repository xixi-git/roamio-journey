import { Link, NavLink } from 'react-router';
import { primaryNavigation } from '@/config/navigation';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link className="site-brand" to="/" aria-label="Roamio home">
          RO<span>A</span>MIO
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {primaryNavigation.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : undefined}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
