import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PORTFOLIO } from '../constants';
import Button from '../components/Button';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { ArrowLeft, CheckCircle, Calendar, User, Code2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      // 1. Try static constants first
      const staticProject = PORTFOLIO.find(p => p.id === id);
      if (staticProject) {
        setProject(staticProject);
        setLoading(false);
        return;
      }

      // 2. Try Supabase
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error || !data) throw new Error("Project not found");
        
        // Map DB to frontend type
        const mappedProject = {
          ...data,
          techStack: data.tech_stack || [],
          results: data.results || []
        };

        setProject(mappedProject as Project);
      } catch (err) {
        console.error("Error loading project", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h2>
        <Button onClick={() => navigate('/portfolio')}>Back to Portfolio</Button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-white">
      <SEO 
        title={`${project.title} - Case Study`} 
        description={`Read how we helped ${project.client || 'our client'} achieve ${project.impact} with ${project.category} solutions.`} 
      />

      {/* Hero Section */}
      <div className="relative h-[400px] w-full mb-12">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/800/600')}
        />
        <div className="absolute inset-0 bg-secondary-900/80 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4">
          <span className="bg-brand-500/20 border border-brand-500 text-brand-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 uppercase tracking-wider">
            {project.category} Case Study
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl">{project.title}</h1>
          <p className="text-xl text-slate-300 max-w-2xl">{project.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs 
           items={[
             { label: 'Home', path: '/' }, 
             { label: 'Portfolio', path: '/portfolio' },
             { label: project.title }
           ]} 
           className="mb-6"
        />

        <Button 
          variant="ghost" 
          onClick={() => navigate('/portfolio')} 
          className="mb-8 pl-0 hover:bg-transparent hover:text-brand-600"
          leftIcon={<ArrowLeft size={18} />}
        >
          Back to Projects
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">The Challenge</h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {project.challenge || "The client was facing significant operational bottlenecks..."}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">The Solution</h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {project.solution || "We implemented a custom architecture leveraging the latest AI models..."}
              </p>
            </div>

            <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100 mb-12">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <CheckCircle className="text-brand-600 mr-2" /> Key Results
              </h3>
              <ul className="space-y-4">
                {project.results && project.results.length > 0 ? project.results.map((result, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-slate-700">{result}</span>
                  </li>
                )) : (
                  <li className="text-slate-700">{project.impact}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Project Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-brand-500 mt-0.5 mr-3" />
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-semibold">Client</span>
                    <span className="text-slate-800 font-medium">{project.client || "Confidential"}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-brand-500 mt-0.5 mr-3" />
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-semibold">Timeline</span>
                    <span className="text-slate-800 font-medium">{project.duration || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Code2 className="w-5 h-5 text-brand-500 mt-0.5 mr-3" />
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-semibold">Tech Stack</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.techStack?.map((tech, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary-900 p-8 rounded-2xl text-white text-center">
              <h3 className="text-xl font-bold mb-2">Want results like this?</h3>
              <p className="text-slate-400 mb-6 text-sm">We can build a similar solution for your business.</p>
              <Button onClick={() => navigate('/contact')} className="w-full">
                Start Your Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;