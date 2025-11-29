import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';
import { COMPANY_NAME, WHATSAPP_LINK } from '../constants';
import Button from './Button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Demo', path: '/demo' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Insights', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
    }`} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
            aria-label={`${COMPANY_NAME} Home`}
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2">
              <Rocket className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900 lg:text-slate-900'}`}>
              {COMPANY_NAME}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `
                  text-sm font-medium transition-colors hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-md px-2 py-1
                  ${isActive ? 'text-brand-600' : 'text-slate-600'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
            <Button 
              size="sm" 
              onClick={() => navigate('/contact')}
              className="ml-4"
              aria-label="Book a consultation"
            >
              Book Consultation
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-md p-1"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-xl absolute top-full left-0 w-full border-t border-slate-100">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `
                  block px-3 py-3 rounded-md text-base font-medium
                  ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-4 px-3 flex flex-col gap-3">
               <Button onClick={() => navigate('/contact')} className="w-full justify-center">
                 Book Consultation
               </Button>
               <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full" aria-label="Chat with us on WhatsApp">
                <button className="w-full justify-center border border-green-500 text-green-600 hover:bg-green-50 font-medium py-2 rounded-lg transition-colors">
                  WhatsApp Us
                </button>
               </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;