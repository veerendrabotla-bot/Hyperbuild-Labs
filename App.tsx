import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Demo from './pages/Demo';
import ProjectDetails from './pages/ProjectDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CookieConsent from './components/CookieConsent';
import SearchOverlay from './components/SearchOverlay';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

// Scroll to top wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <SearchOverlay />
              <Routes>
                {/* Public Routes with Navbar/Footer */}
                <Route path="/" element={<><Navbar /><main className="flex-grow"><Home /></main><Footer /><CookieConsent /></>} />
                <Route path="/services" element={<><Navbar /><main className="flex-grow"><Services /></main><Footer /><CookieConsent /></>} />
                <Route path="/portfolio" element={<><Navbar /><main className="flex-grow"><Portfolio /></main><Footer /><CookieConsent /></>} />
                <Route path="/portfolio/:id" element={<><Navbar /><main className="flex-grow"><ProjectDetails /></main><Footer /><CookieConsent /></>} />
                <Route path="/pricing" element={<><Navbar /><main className="flex-grow"><Pricing /></main><Footer /><CookieConsent /></>} />
                <Route path="/about" element={<><Navbar /><main className="flex-grow"><About /></main><Footer /><CookieConsent /></>} />
                <Route path="/contact" element={<><Navbar /><main className="flex-grow"><Contact /></main><Footer /><CookieConsent /></>} />
                <Route path="/demo" element={<><Navbar /><main className="flex-grow"><Demo /></main><Footer /><CookieConsent /></>} />
                <Route path="/blog" element={<><Navbar /><main className="flex-grow"><Blog /></main><Footer /><CookieConsent /></>} />
                <Route path="/blog/:id" element={<><Navbar /><main className="flex-grow"><BlogPost /></main><Footer /><CookieConsent /></>} />
                
                {/* Legal Routes */}
                <Route path="/privacy" element={<><Navbar /><main className="flex-grow"><PrivacyPolicy /></main><Footer /><CookieConsent /></>} />
                <Route path="/terms" element={<><Navbar /><main className="flex-grow"><TermsOfService /></main><Footer /><CookieConsent /></>} />

                {/* Admin Routes (No Navbar/Footer) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </SiteSettingsProvider>
    </ToastProvider>
  );
};

export default App;
