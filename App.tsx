
import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
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
import TrackProject from './pages/TrackProject';
import SearchOverlay from './components/SearchOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AnalyticsTracker from './components/AnalyticsTracker';
import LoadingScreen from './components/ui/LoadingScreen';

const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <AnalyticsTracker />
              <div className="flex flex-col min-h-screen">
                <SearchOverlay />
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/portfolio/:id" element={<ProjectDetails />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/track" element={<TrackProject />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                  </Route>

                  <Route path="/admin/login" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  <Route path="/admin/dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    </Suspense>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </SiteSettingsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
