import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { SERVICES, PORTFOLIO, TESTIMONIALS } from '../constants';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const featuredServices = SERVICES.slice(0, 3);
  const featuredProjects = PORTFOLIO.slice(0, 2);

  return (
    <div className="flex flex-col w-full">
      <SEO 
        title="AI & Web Development Agency" 
        description={`${settings.company_name} is a premier AI and Web Development agency. We build enterprise-grade websites, e-commerce platforms, and custom AI automation systems.`} 
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50 to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal delay={0.1}>
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold tracking-wide uppercase">
              🚀 The Future of Digital Agencies
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              {settings.hero_title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              {settings.hero_subtitle}
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/contact')} rightIcon={<ArrowRight size={18} />}>
                Book Free Consultation
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo')} leftIcon={<PlayCircle size={18} />}>
                View Live Demos
              </Button>
            </div>
          </ScrollReveal>
          
          {/* Social Proof Strip */}
          <ScrollReveal delay={0.6}>
            <div className="mt-16 pt-8 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by 50+ Modern Businesses</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                {['Stripe', 'Spotify', 'Slack', 'Intercom', 'Framer'].map((logo, i) => (
                  <span key={i} className="text-xl font-bold text-slate-800">{logo}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Comprehensive Digital Solutions" 
            subtitle="Everything you need to scale, automated and optimized."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service, idx) => (
              <ScrollReveal key={service.id} delay={idx * 0.1}>
                <ServiceCard service={service} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center">
            <Button variant="secondary" onClick={() => navigate('/services')}>
              Explore All Services
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary-900 text-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Industry Leaders Choose Us</h2>
                <p className="text-slate-300 text-lg mb-8">
                  We don't just build websites; we build revenue-generating systems. Our AI-first approach ensures you stay ahead of the competition.
                </p>
                <ul className="space-y-4">
                  {[
                    'Proprietary AI Integration Framework',
                    'Mobile-First, Conversion-Optimized Design',
                    'Lightning Fast Performance (90+ Google Score)',
                    '24/7 Ongoing Support & Maintenance'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle2 className="text-brand-400 mr-3 w-6 h-6" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8" onClick={() => navigate('/about')}>Learn About Our Process</Button>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative">
                <div className="bg-slate-800 rounded-2xl p-2 shadow-2xl border border-slate-700">
                  <img src="https://picsum.photos/id/1/600/400" alt="Dashboard Preview" className="rounded-xl w-full h-auto" />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-lg shadow-xl max-w-xs">
                  <div className="flex items-center mb-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                     <span className="font-bold text-sm">System Status: Optimized</span>
                  </div>
                  <p className="text-xs text-slate-600">Your digital infrastructure is running at peak performance.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Featured Work" 
            subtitle="A glimpse into the digital products we've crafted."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {featuredProjects.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 0.1}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center">
             <Button variant="outline" onClick={() => navigate('/portfolio')}>
               View Full Portfolio
             </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <SectionHeading title="Client Success Stories" centered />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {TESTIMONIALS.map((t, idx) => (
               <ScrollReveal key={t.id} delay={idx * 0.1}>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-full">
                   <div className="flex items-center mb-6">
                     <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
                     <div>
                       <h4 className="font-bold text-slate-900">{t.name}</h4>
                       <p className="text-sm text-slate-500">{t.role}, {t.company}</p>
                     </div>
                   </div>
                   <p className="text-slate-600 italic">"{t.content}"</p>
                 </div>
               </ScrollReveal>
             ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-600 text-white text-center">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-brand-100 text-xl mb-10">
              Stop losing leads to outdated tech. Get a custom strategy plan today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
                 Get Your Free Quote
               </Button>
               <a href={settings.whatsapp_link} target="_blank" rel="noopener noreferrer">
                  <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-600 font-bold py-3.5 px-8 rounded-lg transition-colors w-full sm:w-auto">
                    Chat on WhatsApp
                  </button>
               </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Home;
