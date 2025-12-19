
import React, { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { Mail, Phone, MapPin, Calendar, CheckCircle2, ChevronDown, DollarSign, IndianRupee } from 'lucide-react';
import { FAQS, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../constants';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import BookingSystem from '../components/BookingSystem';
import { useToast } from '../contexts/ToastContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { FaqItem } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  customBudget?: string;
}

const Contact: React.FC = () => {
  const { success, error: showError } = useToast();
  const { settings } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Web Development',
    budget: '$5k - $10k (₹4L - ₹8L)',
    timeline: 'Within 1 month',
    message: ''
  });

  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [customBudgetAmount, setCustomBudgetAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
      if (!error && data) setFaqs(data as FaqItem[]);
      else setFaqs(FAQS);
    } catch (err) { setFaqs(FAQS); }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.message) newErrors.message = 'Required';
    if (isCustomBudget && (!customBudgetAmount || isNaN(Number(customBudgetAmount)))) {
      newErrors.customBudget = 'Enter a valid amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    const finalBudget = isCustomBudget 
      ? `${currency === 'USD' ? '$' : '₹'}${customBudgetAmount} (Custom)` 
      : formData.budget;

    const submissionData = {
      ...formData,
      budget: finalBudget
    };

    try {
      const { error } = await supabase.from('leads').insert([submissionData]);
      if (error) throw error;

      if (EMAILJS_SERVICE_ID !== 'service_placeholder') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
          ...submissionData, 
          to_name: 'Admin',
          budget: finalBudget 
        });
      }

      success("Project brief received! Our engineering team will review it.");
      setSubmitted(true);
    } catch (err) { showError('Submission failed. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50">
      <SEO title="Get a Quote" description="Contact HyperBuild Labs for AI and Web Development quotes." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-brand-600 rounded-2xl p-10 mb-16 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="mb-6 md:mb-0 relative z-10">
             <h3 className="text-3xl font-black flex items-center gap-3"><Calendar size={32}/> Strategy Consultation</h3>
             <p className="text-brand-100 font-medium max-w-md mt-2">Book a high-level technical discovery session with our architects.</p>
           </div>
           <Button variant="secondary" size="lg" onClick={() => setShowBooking(!showBooking)} className="relative z-10 px-10 shadow-xl">
             {showBooking ? 'Close Calendar' : 'Check Availability'}
           </Button>
        </div>

        {showBooking && <div className="mb-16 animate-fadeIn"><BookingSystem /></div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="animate-fadeIn">
            <SectionHeading title="Initiate Project" subtitle="Provide your requirements and budget range." centered={false} />
            {submitted ? (
              <Card className="text-center py-20 bg-white shadow-xl rounded-3xl border-brand-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Brief Received!</h3>
                <p className="text-slate-500 mt-3 max-w-xs mx-auto">We will get back to you with a roadmap within 12-24 hours.</p>
                <Button variant="ghost" className="mt-8 font-black" onClick={() => setSubmitted(false)}>Send Another Brief</Button>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} placeholder="John Doe" />
                  <Input label="Work Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} placeholder="john@company.com" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Service Category</label>
                    <select className="w-full p-3.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium transition-all" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                      <option>AI Chatbots / Agents</option>
                      <option>Web Development</option>
                      <option>Business Automation</option>
                      <option>Full Branding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Budget (Multi-Currency Support)</label>
                    <select 
                      className="w-full p-3.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium transition-all" 
                      value={isCustomBudget ? 'custom' : formData.budget} 
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setIsCustomBudget(true);
                        } else {
                          setIsCustomBudget(false);
                          setFormData({...formData, budget: e.target.value});
                        }
                      }}
                    >
                      <option value="$1k - $5k (₹80k - ₹4L)">$1k - $5k (₹80k - ₹4L)</option>
                      <option value="$5k - $10k (₹4L - ₹8L)">$5k - $10k (₹4L - ₹8L)</option>
                      <option value="$10k - $25k (₹8L - ₹20L)">$10k - $25k (₹8L - ₹20L)</option>
                      <option value="$25k+ (₹20L+)">$25k+ (₹20L+)</option>
                      <option value="custom">Input custom amount...</option>
                    </select>
                  </div>
                </div>

                {isCustomBudget && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-brand-300 animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Custom Budget Allocation</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input 
                          type="number" 
                          placeholder="Amount" 
                          value={customBudgetAmount} 
                          onChange={e => setCustomBudgetAmount(e.target.value)}
                          error={errors.customBudget}
                          icon={currency === 'USD' ? <DollarSign size={16}/> : <IndianRupee size={16}/>}
                        />
                      </div>
                      <div className="flex bg-white rounded-lg p-1 border border-slate-200 h-[46px]">
                        <button 
                          type="button" 
                          onClick={() => setCurrency('USD')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          USD
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setCurrency('INR')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'INR' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          INR
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Project Scope</label>
                  <textarea className="w-full p-4 border border-slate-200 rounded-xl h-40 focus:ring-2 focus:ring-brand-500 outline-none font-medium placeholder:text-slate-400" placeholder="Describe the technical problem we are solving..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>

                <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-brand-500/20" isLoading={isSubmitting}>Submit Project Brief</Button>
              </form>
            )}
          </div>

          <div className="space-y-8">
             <div className="bg-secondary-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="text-2xl font-black mb-6">Global Operations</h3>
               <p className="text-slate-400 mb-8 text-sm leading-relaxed">We support compliant invoicing in <strong>USD ($)</strong> and <strong>INR (₹)</strong> via Stripe and Razorpay.</p>
               <div className="space-y-6">
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-3 bg-white/5 rounded-xl text-brand-400 group-hover/item:bg-brand-500 group-hover/item:text-white transition-all"><Mail size={20}/></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-black">Email</p><p className="font-bold">{settings.contact_email}</p></div>
                 </div>
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-3 bg-white/5 rounded-xl text-brand-400 group-hover/item:bg-brand-500 group-hover/item:text-white transition-all"><Phone size={20}/></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-black">Hotline</p><p className="font-bold">{settings.contact_phone}</p></div>
                 </div>
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-3 bg-white/5 rounded-xl text-brand-400 group-hover/item:bg-brand-500 group-hover/item:text-white transition-all"><MapPin size={20}/></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-black">Headquarters</p><p className="font-bold">{settings.contact_address}</p></div>
               </div>
             </div>
           </div>

             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Engagement FAQs</h3>
                <div className="space-y-2">
                  {faqs.slice(0, 5).map((faq, i) => (
                    <div key={i} className="border-b border-slate-50 last:border-0">
                      <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full flex justify-between py-4 text-left font-bold text-slate-700 hover:text-brand-600 transition-colors">
                        {faq.question}
                        <ChevronDown className={`transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180 text-brand-500' : 'text-slate-300'}`} />
                      </button>
                      {openFaqIndex === i && <p className="text-sm text-slate-500 pb-4 leading-relaxed animate-slideDown">{faq.answer}</p>}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
