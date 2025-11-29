import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY_NAME } from '../constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-secondary-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div 
              className="flex items-center mb-6 cursor-pointer" 
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              aria-label={`${COMPANY_NAME} Home`}
            >
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2">
                <Rocket className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                {COMPANY_NAME}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Transforming businesses with next-generation AI solutions, web development, and automation systems. Build the future with us.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Follow us on Twitter"><Twitter size={20} aria-hidden="true" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Connect with us on LinkedIn"><Linkedin size={20} aria-hidden="true" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Follow us on Instagram"><Instagram size={20} aria-hidden="true" /></a>
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

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-brand-500 flex-shrink-0" aria-hidden="true" />
                <span>123 Innovation Dr,<br />Tech City, TC 90210</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-brand-500 flex-shrink-0" aria-hidden="true" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-brand-500 flex-shrink-0" aria-hidden="true" />
                <span>hello@{COMPANY_NAME.toLowerCase().replace(' ', '')}.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
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