import React from 'react';
import SectionHeading from '../components/SectionHeading';
import { Code2, Cpu, Users } from 'lucide-react';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <div className="pt-24 pb-20">
      <SEO 
        title="About Us" 
        description="Learn about HyperBuild Labs. We combine cutting-edge design with artificial intelligence to build the digital infrastructure for market leaders." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="About HyperBuild Labs" subtitle="Building the digital infrastructure for tomorrow's market leaders." />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Mission</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We started with a simple premise: Most agencies are stuck in 2015. They build static websites that look good but don't perform. 
              <br/><br/>
              At HyperBuild, we fuse <strong>cutting-edge design</strong> with <strong>Artificial Intelligence</strong> to create digital assets that actually work for you. We don't just deliver code; we deliver automated growth engines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
               <div className="p-4 bg-brand-50 rounded-lg">
                 <h4 className="font-bold text-brand-800 mb-2">Innovation First</h4>
                 <p className="text-sm text-slate-600">We use the latest tech stack (React, AI, Cloud) to ensure longevity.</p>
               </div>
               <div className="p-4 bg-brand-50 rounded-lg">
                 <h4 className="font-bold text-brand-800 mb-2">Transparent Process</h4>
                 <p className="text-sm text-slate-600">No jargon. Clear timelines. Fixed pricing models.</p>
               </div>
            </div>
          </div>
          <div className="relative h-96">
            <img 
              src="https://picsum.photos/id/60/800/600" 
              alt="Team working" 
              className="w-full h-full object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-secondary-900 rounded-3xl p-12 text-center text-white">
          <h3 className="text-2xl font-bold mb-8">Our Technology Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <Code2 className="w-10 h-10 text-brand-400 mb-3" />
              <span className="font-semibold">React & Next.js</span>
            </div>
            <div className="flex flex-col items-center">
              <Cpu className="w-10 h-10 text-brand-400 mb-3" />
              <span className="font-semibold">OpenAI & Python</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-10 h-10 text-brand-400 mb-3" />
              <span className="font-semibold">Tailwind CSS</span>
            </div>
            <div className="flex flex-col items-center">
              <Code2 className="w-10 h-10 text-brand-400 mb-3" />
              <span className="font-semibold">Node.js / Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;