import { Outlet } from 'react-router';
import { Toaster } from "@/components/ui/sonner";
import Header from '@/components/Navbar/Navbar';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="site-layout">
        <Header />
        <main className="site-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
