import React from 'react';
import { Service } from '../types';
import { ArrowRight, Zap } from 'lucide-react';
import { getIconComponent } from '../utils/iconMap';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Determine which icon to render:
  // 1. If 'icon' (component) exists (static data), use it.
  // 2. If 'icon_name' (string) exists (DB data), resolve it using utility.
  // 3. Fallback to Zap.
  const Icon = service.icon || getIconComponent(service.icon_name);
  
  return (
    <div className="group bg-white rounded-xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out border border-slate-100 hover:border-brand-200/50 relative overflow-hidden cursor-pointer">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
      
      <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-brand-500/30 group-hover:scale-110">
        <Icon size={24} />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors duration-300">{service.title}</h3>
      <p className="text-slate-600 mb-4 line-clamp-3 group-hover:text-slate-700 transition-colors duration-300">{service.description}</p>
      
      <ul className="space-y-2 mb-6">
        {service.features && service.features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-2 group-hover:bg-brand-500 transition-colors duration-300"></span>
            {feature}
          </li>
        ))}
      </ul>
      
      <div className="flex items-center text-brand-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
        Learn More <ArrowRight className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default ServiceCard;