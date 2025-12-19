
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { SERVICES, PORTFOLIO, TESTIMONIALS } from '../constants';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { supabase } from '../lib/supabaseClient';
import { Service, Testimonial } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  const featuredProjects = PORTFOLIO.slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('services').select('*').limit(3).order('created_at', { ascending: true });
        if (error || !data || data.length === 0) {
          setFeaturedServices(SERVICES.slice(0, 3));
        } else {
          setFeaturedServices(data as any[]);
        }
      } catch (err) {
        setFeaturedServices(SERVICES.slice(0, 3));
      }

      try {
        const { data, error } = await supabase.from('testimonials').select('*').limit(3).order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          setTestimonials(TESTIMONIALS);
        } else {
          setTestimonials(data as Testimonial[]);
        }
      } catch (err) {
        setTestimonials(TESTIMONIALS);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      <SEO 
        title="AI & Web Development Agency" 
        description={`${settings.company_name} is a premier AI and Web Development agency. We build enterprise-grade websites, e-commerce platforms, and custom AI automation systems.`} 
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50 to-transparent" />
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-100 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal delay={0.1}>
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-widest uppercase border border-brand-100 shadow-sm">
              <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              Next-Gen Digital Solutions
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1]">
              {settings.hero_title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed font-medium">
              {settings.hero_subtitle}
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" onClick={() => navigate('/contact')} className="px-10 py-4 shadow-2xl shadow-brand-500/40" rightIcon={<ArrowRight size={20} />}>
                Launch Your Project
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo')} className="px-10 py-4 bg-white" leftIcon={<PlayCircle size={20} />}>
                Interactive Demo
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Preview - Solid Light Background */}
      <section className="py-24 bg-slate-50 relative z-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Core Expertise" 
            subtitle="Automated workflows and conversion engines built for scale."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {featuredServices.map((service, idx) => (
              <ScrollReveal key={service.id} delay={idx * 0.1}>
                <ServiceCard service={service} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center">
            <Button variant="secondary" onClick={() => navigate('/services')} className="px-8">
              Discover All Services
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us - High Contrast Dark Mode */}
      <section className="py-32 bg-secondary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Why Industry Leaders Choose Us</h2>
                <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                  We bridge the gap between complex AI logic and high-conversion user interfaces.
                </p>
                <div className="space-y-6">
                  {[
                    { title: 'Proprietary AI Framework', desc: 'Custom models trained on your business datasets.', icon: Zap },
                    { title: '90+ Google Performance', desc: 'Blazing speed for better SEO and user retention.', icon: BarChart3 },
                    { title: 'Global Delivery Model', desc: 'USA strategy combined with agile development.', icon: Globe },
                    { title: 'Enterprise Security', desc: 'Encrypted lead capture and secure cloud hosting.', icon: ShieldCheck }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start group">
                      <div className="p-3 bg-brand-500/10 rounded-xl mr-5 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white mb-1">{item.title}</h4>
                        <p className="text-slate-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-blue-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-slate-800 rounded-3xl p-3 shadow-2xl border border-slate-700">
                  <img src="https://picsum.photos/id/1/800/600" alt="Dashboard Tech" className="rounded-2xl w-full h-auto grayscale-0 hover:grayscale transition-all duration-500" />
                </div>
                {/* Float Badge */}
                <div className="absolute -bottom-8 -right-8 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl max-w-xs border border-slate-100 hidden md:block">
                  <div className="flex items-center mb-3">
                     <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                     <span className="font-black text-sm uppercase tracking-tighter">System Health: 100%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Continuous uptime monitoring and automated security patches enabled.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Success Stories" 
            subtitle="Explore how we converted business challenges into scalable digital assets."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {featuredProjects.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 0.1}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center">
             <Button variant="outline" onClick={() => navigate('/portfolio')} className="px-8 border-2">
               View Full Case Studies
             </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-brand-600 relative overflow-hidden text-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <ScrollReveal>
            <div className="max-w-4xl mx-auto px-4 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Ready to Automate Your Revenue?</h2>
              <p className="text-brand-100 text-xl mb-12 max-w-2xl mx-auto">
                Join 50+ businesses scaling with our custom AI and web architectures.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Button variant="secondary" size="lg" onClick={() => navigate('/contact')} className="px-10 py-4 shadow-xl">
                   Secure Free Consultation
                 </Button>
                 <a href={settings.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex">
                    <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-600 font-black py-4 px-10 rounded-xl transition-all w-full sm:w-auto">
                      WhatsApp Chat
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
