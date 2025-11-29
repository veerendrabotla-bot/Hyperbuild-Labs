import React, { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { PORTFOLIO } from '../constants';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';
import { Loader2 } from 'lucide-react';

const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'AI Solutions', 'Web Development', 'E-commerce', 'Automation'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase error:", error);
          setProjects(PORTFOLIO);
        } else {
          // Map DB snake_case to frontend camelCase
          const mappedProjects = (data || []).map((p: any) => ({
            ...p,
            techStack: p.tech_stack || [],
            results: p.results || []
          }));
          
          // Use Supabase data if available, otherwise fall back to static
          setProjects(mappedProjects.length > 0 ? [...mappedProjects, ...PORTFOLIO] : PORTFOLIO);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setProjects(PORTFOLIO);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'All') return true;
    
    // Mapping button labels to project categories/content
    if (activeFilter === 'AI Solutions') return project.category?.includes('AI') || project.title?.includes('AI');
    if (activeFilter === 'Web Development') return project.category?.includes('Web') || project.category?.includes('SaaS');
    if (activeFilter === 'E-commerce') return project.category?.includes('Ecommerce') || project.category?.includes('E-com');
    if (activeFilter === 'Automation') return project.category?.includes('Automation');
    
    return true;
  });

  return (
    <div className="pt-24 pb-20">
       <SEO 
         title="Portfolio & Case Studies" 
         description="View our success stories. Case studies of high-performance websites, AI tools, and automation systems built for modern businesses." 
       />
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <Breadcrumbs 
           items={[{ label: 'Home', path: '/' }, { label: 'Portfolio' }]} 
           className="mb-8"
         />

         <SectionHeading 
           title="Our Work" 
           subtitle="We don't just promise results; we deliver them. Explore our recent case studies."
         />
         
         {/* Functional Filters */}
         <div className="flex flex-wrap gap-2 mb-12 justify-center">
           {filters.map((filter, i) => (
             <button 
               key={i}
               onClick={() => setActiveFilter(filter)}
               className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                 activeFilter === filter 
                   ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' 
                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
               }`}
             >
               {filter}
             </button>
           ))}
         </div>

         {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No projects found for this category.
                </div>
              )}
           </div>
         )}
       </div>
    </div>
  );
};

export default Portfolio;