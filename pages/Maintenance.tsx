import React from 'react';
import SEO from '../components/SEO';
import { Rocket, Construction, Mail, Phone } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Button from '../components/Button';

const Maintenance: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-secondary-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <SEO title="Under Maintenance" description="We are currently performing scheduled maintenance." />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-brand-500/50">
          <Construction className="w-10 h-10 text-brand-400" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          System Maintenance
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          {settings.company_name} is currently undergoing scheduled upgrades to improve your experience. 
          We'll be back online shortly.
        </p>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-semibold mb-4">Need to reach us urgently?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-slate-300">
             <div className="flex items-center justify-center">
               <Mail size={16} className="mr-2 text-brand-400" />
               {settings.contact_email}
             </div>
             <div className="flex items-center justify-center">
               <Phone size={16} className="mr-2 text-brand-400" />
               {settings.contact_phone}
             </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Admin Access? <a href="#/admin/login" className="text-brand-400 hover:underline">Login here</a>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-slate-600 text-sm flex items-center">
        <Rocket size={14} className="mr-2" /> Powered by HyperBuild Labs
      </div>
    </div>
  );
};

export default Maintenance;