import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import Maintenance from '../pages/Maintenance';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import LoadingScreen from './ui/LoadingScreen';

const Layout: React.FC = () => {
  const { settings, loading } = useSiteSettings();
  const location = useLocation();
  const maintenanceMode = settings.maintenance_mode === 'true';
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return <LoadingScreen />;
  }

  // If maintenance mode is active and user is not in admin area, show maintenance page
  if (maintenanceMode && !isAdminRoute) {
    return <Maintenance />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
};

export default Layout;