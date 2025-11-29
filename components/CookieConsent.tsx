import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { Cookie, X, ShieldCheck } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('hyperbuild_cookie_consent');
    if (!consent) {
      // Small delay for better UX (don't show immediately on load)
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hyperbuild_cookie_consent', 'accepted');
    setIsVisible(false);
    // Here you would typically trigger analytics scripts
  };

  const handleDecline = () => {
    localStorage.setItem('hyperbuild_cookie_consent', 'declined');
    setIsVisible(false);
    // Here you would ensure non-essential scripts are blocked
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
          role="region"
          aria-label="Cookie Consent"
        >
          <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-2xl border border-slate-200 p-6 md:flex items-center justify-between gap-6 ring-1 ring-slate-900/5">
            <div className="flex items-start gap-4 mb-6 md:mb-0">
               <div className="bg-brand-100 p-3 rounded-full text-brand-600 flex-shrink-0">
                 <Cookie size={24} />
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 mb-1 flex items-center">
                   We value your privacy <ShieldCheck size={16} className="ml-2 text-green-500" />
                 </h4>
                 <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                   We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                   By clicking "Accept All", you consent to our use of cookies in accordance with our 
                   <a href="#" className="text-brand-600 hover:text-brand-700 underline ml-1 font-medium">Privacy Policy</a>.
                 </p>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button 
                onClick={handleDecline}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
              >
                Reject Non-Essential
              </button>
              <Button onClick={handleAccept} size="md" className="whitespace-nowrap shadow-xl shadow-brand-500/20">
                Accept All Cookies
              </Button>
            </div>
            
            <button 
              onClick={handleDecline}
              className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 md:hidden bg-slate-100 rounded-full"
              aria-label="Close cookie banner"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;