import React, { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import PriceCard from '../components/PriceCard';
import { PRICING } from '../constants';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import { PricingTier } from '../types';
import { Loader2 } from 'lucide-react';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase.from('pricing_tiers').select('*').order('order_index', { ascending: true });
        if (error || !data || data.length === 0) {
          setPricingTiers(PRICING);
        } else {
          // Map DB snake_case to frontend if needed (types handle most)
          const mapped = data.map((t: any) => ({
            ...t,
            recommended: t.is_recommended // Map DB column to frontend prop
          }));
          setPricingTiers(mapped as PricingTier[]);
        }
      } catch (err) {
        setPricingTiers(PRICING);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

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

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <PriceCard 
                key={tier.id || idx} 
                tier={tier} 
                onCtaClick={() => navigate('/contact')} 
              />
            ))}
          </div>
        )}

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