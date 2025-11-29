import React from 'react';
import SectionHeading from '../components/SectionHeading';
import PriceCard from '../components/PriceCard';
import { PRICING } from '../constants';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-20 bg-slate-50">
      <SEO 
        title="Pricing Packages" 
        description="Transparent pricing packages for web development and AI solutions. Choose from Starter, Growth, or Enterprise plans tailored to your needs." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Transparent Pricing" 
          subtitle="Choose the package that fits your business stage. No hidden fees."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING.map((tier, idx) => (
            <PriceCard 
              key={idx} 
              tier={tier} 
              onCtaClick={() => navigate('/contact')} 
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4">Looking for a custom maintenance plan or specific AI integration?</p>
          <button 
            onClick={() => navigate('/contact')}
            className="text-brand-600 font-bold hover:text-brand-700 underline underline-offset-4"
          >
            Contact our sales team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;