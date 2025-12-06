import React from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { COMPANY_NAME } from '../constants';
import { Shield, Lock, Eye, Database, Globe, Cookie, Mail, Download, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import ScrollReveal from '../components/ScrollReveal';

const PrivacyPolicy: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO title="Privacy Policy" description={`Privacy Policy for ${COMPANY_NAME}`} />
      
      {/* Hero Section */}
      <div className="bg-secondary-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs 
            items={[{ label: 'Home', path: '/' }, { label: 'Privacy Policy' }]} 
            className="text-slate-400 mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              We believe data privacy is a fundamental human right. Here is exactly how we protect, use, and manage your data.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
              <Shield size={16} className="text-brand-400" />
              <span>Last Updated: October 24, 2024</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span>Version 2.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation (Sticky) */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Table of Contents</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'collection', label: '1. Information Collection', icon: Database },
                    { id: 'usage', label: '2. How We Use Data', icon: Eye },
                    { id: 'cookies', label: '3. Cookies & Tracking', icon: Cookie },
                    { id: 'third-party', label: '4. Third Party Sharing', icon: Globe },
                    { id: 'rights', label: '5. Your GDPR Rights', icon: Lock },
                    { id: 'contact', label: 'Contact Us', icon: Mail },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors group"
                    >
                      <item.icon size={16} className="mr-3 text-slate-400 group-hover:text-brand-500" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
                <h4 className="font-bold text-brand-900 mb-2">Need a PDF copy?</h4>
                <p className="text-xs text-brand-700 mb-4">Download the full legal document for your records.</p>
                <Button variant="outline" size="sm" className="w-full bg-white" leftIcon={<Download size={14}/>}>
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <ScrollReveal>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
                  <p className="lead text-xl text-slate-700">
                    At <strong className="text-brand-600">{COMPANY_NAME}</strong>, accessible from our website, one of our main priorities is the privacy of our visitors. 
                    This Privacy Policy document contains types of information that is collected and recorded by {COMPANY_NAME} 
                    and how we use it.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <section id="collection" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                      <Database size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">1. Information We Collect</h2>
                  </div>
                  <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Direct Information</h4>
                      <p className="text-sm text-slate-600">Name, email address, phone number, and company name provided via our contact forms.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Project Details</h4>
                      <p className="text-sm text-slate-600">Specific business requirements, budget ranges, and timeline expectations.</p>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <section id="usage" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
                      <Eye size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">2. How We Use Your Information</h2>
                  </div>
                  <p>We use the information we collect in various ways, including to:</p>
                  <ul className="marker:text-brand-500">
                    <li>Provide, operate, and maintain our website.</li>
                    <li>Improve, personalize, and expand our website.</li>
                    <li>Understand and analyze how you use our website.</li>
                    <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
                    <li>Send you emails (e.g., project proposals, newsletters).</li>
                  </ul>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <section id="cookies" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mr-4">
                      <Cookie size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">3. Cookies and Web Beacons</h2>
                  </div>
                  <p>
                    Like any other website, {COMPANY_NAME} uses 'cookies'. These cookies are used to store information including 
                    visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is 
                    used to optimize the users' experience by customizing our web page content based on visitors' browser type 
                    and/or other information.
                  </p>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <section id="third-party" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
                      <Globe size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">4. Third Party Privacy Policies</h2>
                  </div>
                  <p>
                    {COMPANY_NAME}'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you 
                    to consult the respective Privacy Policies of these third-party ad servers for more detailed information. 
                    It may include their practices and instructions about how to opt-out of certain options.
                  </p>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.5}>
                <section id="rights" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mr-4">
                      <Lock size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">5. GDPR Data Protection Rights</h2>
                  </div>
                  <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                  <div className="space-y-4 not-prose my-6">
                    {['The right to access', 'The right to rectification', 'The right to erasure', 'The right to restrict processing', 'The right to object to processing'].map((right, i) => (
                      <div key={i} className="flex items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <Shield className="w-5 h-5 text-brand-500 mr-3" />
                        <span className="text-slate-700 font-medium">{right}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>

              <section id="contact" className="mt-16 pt-8 border-t border-slate-200">
                <div className="bg-secondary-900 rounded-2xl p-8 md:p-12 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Have questions about your data?</h3>
                  <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                    If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact our Data Protection Officer.
                  </p>
                  <Button onClick={() => window.location.href = '/#/contact'} size="lg" rightIcon={<ArrowRight size={18}/>}>
                    Contact Privacy Team
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;