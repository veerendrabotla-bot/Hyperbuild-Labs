import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import { PORTFOLIO } from '../constants';
import SEO from '../components/SEO';

const Portfolio: React.FC = () => {
  return (
    <div className="pt-24 pb-20">
       <SEO 
         title="Portfolio & Case Studies" 
         description="View our success stories. Case studies of high-performance websites, AI tools, and automation systems built for modern businesses." 
       />
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <SectionHeading 
           title="Our Work" 
           subtitle="We don't just promise results; we deliver them. Explore our recent case studies."
         />
         
         {/* Filter Tabs (Visual Only for now) */}
         <div className="flex flex-wrap gap-2 mb-12 justify-center">
           {['All', 'AI Solutions', 'Web Development', 'E-commerce', 'Automation'].map((filter, i) => (
             <button 
               key={i}
               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               {filter}
             </button>
           ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PORTFOLIO.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
         </div>
       </div>
    </div>
  );
};

export default Portfolio;