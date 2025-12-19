
import React, { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { PORTFOLIO } from '../constants';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';
import { Loader2, Box } from 'lucide-react';

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
          .eq('is_active', true)     // Filter: Master toggle must be ON
          .eq('is_portfolio', true)  // Filter: Must be intended for public site
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase error:", error);
          // Fallback static data filter
          setProjects(PORTFOLIO.filter(p => p.is_active && p.is_portfolio));
        } else {
          // Map DB snake_case to frontend camelCase
          const mappedProjects = (data || []).map((p: any) => ({
            ...p,
            techStack: p.tech_stack || [],
            results: p.results || []
          }));
          
          // Use Supabase data if available, otherwise fall back to static
          setProjects(mappedProjects.length > 0 ? mappedProjects : PORTFOLIO.filter(p => p.is_active && p.is_portfolio));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setProjects(PORTFOLIO.filter(p => p.is_active && p.is_portfolio));
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
    <div className="pt-24 pb-20 bg-white">
       <SEO 
         title="Engineering Projects" 
         description="View our high-performance technical projects. Case studies of enterprise-grade web apps, AI tools, and automation systems." 
       />
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <Breadcrumbs 
           items={[{ label: 'Home', path: '/' }, { label: 'Projects' }]} 
           className="mb-8"
         />

         <SectionHeading 
           title="Active Engineering Output" 
           subtitle="We don't just build websites; we architect business infrastructure. Explore our live technical projects."
         />
         
         {/* Functional Filters */}
         <div className="flex flex-wrap gap-2 mb-12 justify-center">
           {filters.map((filter, i) => (
             <button 
               key={i}
               onClick={() => setActiveFilter(filter)}
               className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                 activeFilter === filter 
                   ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30' 
                   : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
               }`}
             >
               {filter}
             </button>
           ))}
         </div>

         {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Showcase...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No active showcase projects found.</p>
                </div>
              )}
           </div>
         )}
       </div>
    </div>
  );
};

export default Portfolio;
