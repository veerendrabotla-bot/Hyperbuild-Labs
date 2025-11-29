import React from 'react';
import { Project } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link 
      to={`/portfolio/${project.id}`}
      className="group relative block bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/50"
      aria-label={`View case study for ${project.title}`}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" aria-hidden="true">
          {/* Visual button only - using span to avoid invalid HTML of button inside a link */}
          <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Case Study <ArrowUpRight className="ml-2 w-4 h-4" />
          </span>
        </div>
        <div className="absolute top-4 left-4">
           <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
             {project.category}
           </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{project.title}</h3>
        <p className="text-slate-600 mb-4 text-sm line-clamp-2">{project.description}</p>
        
        <div className="mb-4">
            <span className="text-sm font-semibold text-brand-600">Impact: </span>
            <span className="text-sm text-slate-700 font-medium">{project.impact}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 3).map((tech, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;