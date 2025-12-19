
import React from 'react';
import { Service } from '../types';
import { ArrowRight, Zap } from 'lucide-react';
import { getIconComponent } from '../utils/iconMap';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const Icon = service.icon || getIconComponent(service.icon_name);
  
  return (
    <div className="group bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 transition-all duration-500 border border-slate-100 hover:border-brand-200 relative overflow-hidden flex flex-col h-full z-10">
      {/* Decorative Gradient Background Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-brand-500/30 group-hover:scale-110 relative z-10">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors duration-300 relative z-10">
        {service.title}
      </h3>
      
      <p className="text-slate-600 mb-6 line-clamp-3 group-hover:text-slate-700 transition-colors duration-300 leading-relaxed relative z-10">
        {service.description}
      </p>
      
      <div className="space-y-3 mb-8 flex-grow relative z-10">
        {service.features && service.features.map((feature, idx) => (
          <div key={idx} className="flex items-center text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors duration-300">
            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3 group-hover:scale-125 group-hover:bg-brand-500 transition-all"></div>
            {feature}
          </div>
        ))}
      </div>
      
      <div className="flex items-center text-brand-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300 relative z-10">
        Learn More 
        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default ServiceCard;
