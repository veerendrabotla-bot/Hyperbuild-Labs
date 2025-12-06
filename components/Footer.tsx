import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const { success, error: showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') { // Unique violation
           showError('You are already subscribed!');
        } else {
           throw error;
        }
      } else {
        setSubscribed(true);
        success('Successfully subscribed to newsletter!');
        setEmail('');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback for demo mode if DB missing
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-secondary-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div 
              className="flex items-center mb-6 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-8 w-auto mr-2 object-contain brightness-0 invert" />
              ) : (
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2">
                  <Rocket className="text-white w-5 h-5" />
                </div>
              )}
              <span className="font-bold text-xl text-white tracking-tight">
                {settings.company_name}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Transforming businesses with next-generation AI solutions, web development, and automation systems. Build the future with us.
            </p>
            <div className="flex space-x-4">
              <a href={settings.social_twitter || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href={settings.social_linkedin || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href={settings.social_instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">AI Chatbots & Agents</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Web Development</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">E-commerce Solutions</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Business Automation</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Branding & SEO</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/portfolio" className="hover:text-brand-400 transition-colors">Portfolio</Link></li>
              <li><Link to="/blog" className="hover:text-brand-400 transition-colors">Insights & Blog</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-400 transition-colors">Pricing</Link></li>
              <li><Link to="/demo" className="hover:text-brand-400 transition-colors">Live Demos</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest AI trends and agency news delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center text-green-400 text-sm">
                <CheckCircle2 size={16} className="mr-2" /> Subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-1 top-1 p-1.5 bg-brand-600 rounded-md text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-800">
               <h5 className="text-white font-semibold text-sm mb-3">Contact</h5>
               <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center"><MapPin size={12} className="mr-2 text-brand-500"/> {settings.contact_address}</li>
                  <li className="flex items-center"><Phone size={12} className="mr-2 text-brand-500"/> {settings.contact_phone}</li>
                  <li className="flex items-center"><Mail size={12} className="mr-2 text-brand-500"/> {settings.contact_email}</li>
               </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/admin/login" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;