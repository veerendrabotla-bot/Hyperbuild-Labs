import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="inline-flex items-center">
              {!isFirst && (
                <ChevronRight className="w-4 h-4 text-slate-400 mx-1" aria-hidden="true" />
              )}
              {isLast ? (
                <span 
                  className="text-sm font-medium text-slate-500 truncate max-w-[150px] sm:max-w-xs md:max-w-sm" 
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path || '#'}
                  className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
                >
                  {isFirst && <Home className="w-4 h-4 mr-2" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;