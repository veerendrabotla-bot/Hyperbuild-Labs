import { GOOGLE_ANALYTICS_ID } from "../constants";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize GA4
export const initGA = () => {
  if (!GOOGLE_ANALYTICS_ID || GOOGLE_ANALYTICS_ID.includes('placeholder')) return;
  
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  script.id = 'ga-script';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GOOGLE_ANALYTICS_ID, {
    page_path: window.location.hash.replace('#', '') || '/',
  });
};

// Track Pageview
export const logPageView = (path: string) => {
  if (!window.gtag) return;
  window.gtag('config', GOOGLE_ANALYTICS_ID, {
    page_path: path,
  });
};

// Track Custom Event
export const logEvent = (action: string, category: string, label: string) => {
  if (!window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};