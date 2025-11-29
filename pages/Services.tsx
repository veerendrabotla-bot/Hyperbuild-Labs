import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import { SERVICES } from '../constants';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';

const Services: React.FC = () => {
  const navigate = useNavigate();
  
  const categories = ['AI', 'Web', 'Automation', 'Branding'];

  return (
    <div className="pt-24 pb-20">
      <SEO 
        title="Services - AI, Web & Automation" 
        description="Explore our services: AI Chatbots, Custom Web Development, Business Automation, Branding, and E-commerce solutions designed to grow your business." 
      />

      {/* Header */}
      <div className="bg-secondary-900 text-white py-20 mb-20">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Expertise</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              From intelligent AI agents to high-conversion e-commerce stores, we provide end-to-end digital solutions.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map((category) => {
          const categoryServices = SERVICES.filter(s => s.category === category);
          if (categoryServices.length === 0) return null;

          return (
            <div key={category} className="mb-20">
              <ScrollReveal>
                <div className="flex items-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mr-4">{category} Solutions</h2>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryServices.map((service, idx) => (
                  <ScrollReveal key={service.id} delay={idx * 0.1}>
                    <ServiceCard service={service} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          );
        })}

        {/* Custom Solution CTA */}
        <ScrollReveal>
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
             <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
             <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
               We specialize in solving unique business problems with tailored software. Let's discuss your specific requirements.
             </p>
             <Button onClick={() => navigate('/contact')}>Discuss Custom Project</Button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Services;