import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView } from '../lib/analytics';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Determine the current path (hash-based routing consideration)
    const path = location.pathname + location.search;
    
    // Check if consent is granted
    const consent = localStorage.getItem('hyperbuild_cookie_consent');
    if (consent === 'accepted') {
      logPageView(path);
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;