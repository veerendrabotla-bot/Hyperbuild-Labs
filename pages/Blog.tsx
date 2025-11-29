import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { BLOG_POSTS } from '../constants';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

const Blog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-20 bg-white">
      <SEO 
        title="Insights & Blog" 
        description="Read the latest insights on AI agents, web development trends, and business automation strategies from the experts at HyperBuild Labs." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Insights & News" 
          subtitle="Thoughts on technology, AI, and the future of business." 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, idx) => (
            <ScrollReveal key={post.id} delay={idx * 0.1}>
              <div 
                className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center">
                       <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-2">
                         <User size={12} />
                       </div>
                       <span className="text-xs font-medium text-slate-700">{post.author}</span>
                    </div>
                    <span className="text-brand-600 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                      Read More <ArrowRight size={14} className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;