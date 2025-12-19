
import React from 'react';
import { PricingTier } from '../types';
import { Check } from 'lucide-react';
import Button from './Button';

interface PriceCardProps {
  tier: PricingTier;
  onCtaClick: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ tier, onCtaClick }) => {
  const getSymbol = (c: string | undefined) => c === 'INR' ? '₹' : '$';
  
  // Format price display: Only show symbol if price is numeric
  const isNumericPrice = !isNaN(Number(tier.price.replace(/[^0-9.]/g, '')));
  const displayPrice = isNumericPrice ? `${getSymbol(tier.currency)}${tier.price}` : tier.price;

  return (
    <div className={`relative flex flex-col p-8 rounded-2xl transition-all duration-500 ${
      tier.recommended 
        ? 'bg-secondary-900 text-white shadow-2xl scale-105 border-2 border-brand-500 z-10' 
        : 'bg-white text-slate-900 shadow-xl border border-slate-200 hover:border-brand-300'
    }`}>
      {tier.recommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-brand-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            Recommended Solution
          </span>
        </div>
      )}

      <div className="mb-8">
        <h3 className={`text-xl font-black mb-4 uppercase tracking-tight ${tier.recommended ? 'text-white' : 'text-slate-900'}`}>
          {tier.name}
        </h3>
        <div className="flex items-baseline mb-3">
          <span className={`text-5xl font-black tracking-tighter ${tier.recommended ? 'text-brand-400' : 'text-slate-900'}`}>
            {displayPrice}
          </span>
          {isNumericPrice && <span className={`ml-2 text-xs font-bold uppercase tracking-widest ${tier.recommended ? 'text-slate-400' : 'text-slate-500'}`}>/ project</span>}
        </div>
        <p className={`text-sm leading-relaxed font-medium ${tier.recommended ? 'text-slate-300' : 'text-slate-500'}`}>
          {tier.description}
        </p>
      </div>

      <div className="flex-1 mb-10">
        <div className={`h-px w-full mb-8 ${tier.recommended ? 'bg-white/10' : 'bg-slate-100'}`}></div>
        <ul className="space-y-4">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div className={`mt-1 p-0.5 rounded-full mr-3 flex-shrink-0 ${tier.recommended ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                <Check size={14} strokeWidth={3} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-tight ${tier.recommended ? 'text-slate-200' : 'text-slate-600'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        variant={tier.recommended ? 'primary' : 'outline'} 
        className={`w-full py-4 font-black text-sm uppercase tracking-widest shadow-xl transition-transform active:scale-95 ${tier.recommended ? 'shadow-brand-500/30' : ''}`}
        onClick={onCtaClick}
      >
        Select {tier.name}
      </Button>
    </div>
  );
};

export default PriceCard;
