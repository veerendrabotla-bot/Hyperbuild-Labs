import React from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { COMPANY_NAME } from '../constants';
import { Scale, FileCheck, Copyright, CreditCard, AlertTriangle, Gavel, FileText, ArrowRight, Download } from 'lucide-react';
import Button from '../components/Button';
import ScrollReveal from '../components/ScrollReveal';

const TermsOfService: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO title="Terms of Service" description={`Terms and Conditions for ${COMPANY_NAME}`} />
      
      {/* Hero Section */}
      <div className="bg-secondary-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs 
            items={[{ label: 'Home', path: '/' }, { label: 'Terms of Service' }]} 
            className="text-slate-400 mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Please read these terms carefully before using our services. They outline the rules of engagement for our partnership.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
              <Scale size={16} className="text-brand-400" />
              <span>Effective Date: October 24, 2024</span>
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
                <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Quick Navigation</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'acceptance', label: '1. Acceptance', icon: FileCheck },
                    { id: 'services', label: '2. Services', icon: FileText },
                    { id: 'ip', label: '3. Intellectual Property', icon: Copyright },
                    { id: 'payment', label: '4. Payment Terms', icon: CreditCard },
                    { id: 'liability', label: '5. Liability', icon: AlertTriangle },
                    { id: 'law', label: '6. Governing Law', icon: Gavel },
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

              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Legal Inquiries?</h4>
                <p className="text-xs text-slate-600 mb-4">For specific legal questions regarding our contracts, please contact our legal team.</p>
                <a href="mailto:legal@hyperbuildlabs.com" className="text-brand-600 text-sm font-bold hover:underline">
                  legal@hyperbuildlabs.com
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate max-w-none">
              
              <ScrollReveal>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 border-l-4 border-l-brand-500">
                  <p className="text-lg font-medium text-slate-800 m-0 italic">
                    "By accessing and using the website of {COMPANY_NAME}, you accept and agree to be bound by the terms and provision of this agreement."
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <section id="acceptance" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 mr-4">
                      <FileCheck size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">1. Acceptance of Terms</h2>
                  </div>
                  <p>
                    By accessing and using the website of {COMPANY_NAME}, you accept and agree to be bound by the terms 
                    and provision of this agreement. In addition, when using these particular services, you shall be 
                    subject to any posted guidelines or rules applicable to such services.
                  </p>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <section id="services" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">2. Services</h2>
                  </div>
                  <p>
                    {COMPANY_NAME} provides web development, AI integration, and digital marketing services. Detailed descriptions 
                    of these services can be found on our website. We reserve the right to modify, suspend, or discontinue 
                    any service at any time without notice.
                  </p>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <section id="ip" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
                      <Copyright size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">3. Intellectual Property</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 not-prose">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-2">Agency Content</h4>
                      <p className="text-sm text-slate-600">The content, organization, graphics, design, compilation, and other matters related to the Site are protected under applicable copyrights and other proprietary rights.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-2">Client Work</h4>
                      <p className="text-sm text-slate-600">Upon full payment, intellectual property rights for custom code and designs created specifically for the Client shall be transferred to the Client.</p>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <section id="payment" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">4. Payment Terms</h2>
                  </div>
                  <ul className="bg-slate-50 p-6 rounded-xl border border-slate-200 list-none space-y-3 m-0">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Quotes are valid for 30 days from issuance.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>A deposit (typically 50%) is required before work commences.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Final payment is due upon project completion and before final deployment.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>We reserve the right to pause work if payments are not made on schedule.</span>
                    </li>
                  </ul>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.5}>
                <section id="liability" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mr-4">
                      <AlertTriangle size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">5. Limitation of Liability</h2>
                  </div>
                  <p>
                    In no event shall {COMPANY_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                    be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
                    loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of 
                    or inability to access or use the Service.
                  </p>
                </section>
              </ScrollReveal>

              <ScrollReveal delay={0.6}>
                <section id="law" className="mb-12 scroll-mt-28">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mr-4">
                      <Gavel size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0">6. Governing Law</h2>
                  </div>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
                    {COMPANY_NAME} is established, without regard to its conflict of law provisions.
                  </p>
                </section>
              </ScrollReveal>

              <section className="mt-16 pt-8 border-t border-slate-200">
                <div className="bg-brand-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl shadow-brand-500/20">
                  <h3 className="text-2xl font-bold mb-4">Ready to work with us?</h3>
                  <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
                    Now that we've got the legalities out of the way, let's build something amazing together.
                  </p>
                  <Button variant="secondary" onClick={() => window.location.href = '/#/contact'} size="lg" rightIcon={<ArrowRight size={18}/>}>
                    Start a Project
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

export default TermsOfService;