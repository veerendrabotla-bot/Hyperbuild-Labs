
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Search, LogIn, LayoutDashboard } from 'lucide-react';
import { COMPANY_NAME } from '../constants';
import Button from './Button';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const triggerSearch = () => window.dispatchEvent(new Event('open-search'));

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/portfolio' },
    { name: 'Demo', path: '/demo' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Track', path: '/track' },
    { name: 'Blog', path: '/blog' },
  ];

  const handleDashboardRedirect = () => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/partner/dashboard');
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
    }`} role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-auto mr-2 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2"><Rocket className="text-white w-5 h-5" /></div>
            )}
            <span className="font-bold text-xl tracking-tight text-slate-900">{settings.company_name || COMPANY_NAME}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-5 items-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path} 
                className={({ isActive }) => `text-xs font-bold uppercase tracking-widest transition-colors hover:text-brand-600 px-1 py-1 ${isActive ? 'text-brand-600' : 'text-slate-600'}`}
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {/* Simplified Auth Section */}
            {user ? (
               <button 
                onClick={handleDashboardRedirect}
                className="flex items-center text-[10px] font-black text-brand-600 bg-brand-50 px-4 py-2 rounded-full hover:bg-brand-100 transition-all uppercase tracking-widest border border-brand-100"
               >
                 <LayoutDashboard size={14} className="mr-2" /> Dashboard
               </button>
            ) : (
              <button 
                onClick={() => navigate('/partner/login')} 
                className="text-[10px] font-black text-white bg-slate-900 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 flex items-center gap-1.5"
              >
                <LogIn size={14}/> Staff Login
              </button>
            )}

            <button onClick={triggerSearch} className="text-slate-500 hover:text-brand-600 p-2 rounded-full hover:bg-slate-100 transition-colors ml-2"><Search size={18} /></button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-4">
            <button onClick={triggerSearch} className="text-slate-600"><Search size={22} /></button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-2xl absolute top-full left-0 w-full border-t p-6 space-y-6 animate-slideDown">
            <div className="space-y-1 flex flex-col">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.name} 
                  to={link.path} 
                  className="block py-3 rounded-md text-sm font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            <div className="pt-4 space-y-3">
               {!user ? (
                  <Button onClick={() => navigate('/partner/login')} className="w-full py-4 uppercase font-black tracking-widest text-xs">Staff Secure Portal</Button>
               ) : (
                 <Button onClick={handleDashboardRedirect} className="w-full py-4 uppercase font-black tracking-widest text-xs">Go to Dashboard</Button>
               )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
