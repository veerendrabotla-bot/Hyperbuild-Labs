import React from 'react';
import { PricingTier } from '../types';
import { Check } from 'lucide-react';
import Button from './Button';

interface PriceCardProps {
  tier: PricingTier;
  onCtaClick: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ tier, onCtaClick }) => {
  return (
    <div className={`relative flex flex-col p-8 rounded-2xl ${
      tier.recommended 
        ? 'bg-secondary-900 text-white shadow-2xl scale-105 border-2 border-brand-500 z-10' 
        : 'bg-white text-slate-900 shadow-xl border border-slate-200'
    }`}>
      {tier.recommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-2 ${tier.recommended ? 'text-white' : 'text-slate-900'}`}>
          {tier.name}
        </h3>
        <div className="flex items-baseline mb-2">
          <span className={`text-4xl font-extrabold ${tier.recommended ? 'text-white' : 'text-slate-900'}`}>
            {tier.price}
          </span>
          {tier.price !== 'Custom' && <span className={`ml-2 text-sm ${tier.recommended ? 'text-slate-400' : 'text-slate-500'}`}>/project</span>}
        </div>
        <p className={`text-sm ${tier.recommended ? 'text-slate-300' : 'text-slate-500'}`}>
          {tier.description}
        </p>
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${tier.recommended ? 'text-brand-400' : 'text-brand-600'}`} />
              <span className={`text-sm ${tier.recommended ? 'text-slate-300' : 'text-slate-600'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        variant={tier.recommended ? 'primary' : 'outline'} 
        className="w-full"
        onClick={onCtaClick}
      >
        Choose {tier.name}
      </Button>
    </div>
  );
};

export default PriceCard;