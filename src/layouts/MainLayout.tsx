import { Outlet } from 'react-router';
import Header from '@/components/Navbar/Navbar';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="site-layout">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
