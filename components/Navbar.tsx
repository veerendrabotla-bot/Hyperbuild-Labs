
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Search, Radar } from 'lucide-react';
import { COMPANY_NAME, WHATSAPP_LINK } from '../constants';
import Button from './Button';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const triggerSearch = () => {
    window.dispatchEvent(new Event('open-search'));
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Demo', path: '/demo' },
    { name: 'Insights', path: '/blog' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
    }`} role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-auto mr-2 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2">
                <Rocket className="text-white w-5 h-5" />
              </div>
            )}
            <span className={`font-bold text-xl tracking-tight text-slate-900`}>
              {settings.company_name || COMPANY_NAME}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `
                  text-sm font-medium transition-colors hover:text-brand-600 px-2 py-1
                  ${isActive ? 'text-brand-600' : 'text-slate-600'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
            
            <NavLink to="/track" className="flex items-center text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
              <Radar size={16} className="mr-1.5" /> Track Project
            </NavLink>

            <button 
              onClick={triggerSearch} 
              className="text-slate-500 hover:text-brand-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Button 
              size="sm" 
              onClick={() => navigate('/contact')}
              className="ml-2"
            >
              Get Free Quote
            </Button>
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
        <div className="lg:hidden bg-white shadow-xl absolute top-full left-0 w-full border-t">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{link.name}</NavLink>
            ))}
            <NavLink to="/track" className="flex items-center px-3 py-3 text-brand-600 font-bold"><Radar size={18} className="mr-2"/> Track Project</NavLink>
            <div className="pt-4 px-3 flex flex-col gap-3">
               <Button onClick={() => navigate('/contact')} className="w-full">Get Free Quote</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
