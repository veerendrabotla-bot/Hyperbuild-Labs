import React, { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { Mail, Phone, MapPin, MessageCircle, Calendar, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { FAQS, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_AUTO_REPLY_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../constants';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import BookingSystem from '../components/BookingSystem';
import { useToast } from '../contexts/ToastContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { FaqItem } from '../types';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  general?: string;
}

interface FormTouched {
  name: boolean;
  email: boolean;
  phone: boolean;
  message: boolean;
}

const Contact: React.FC = () => {
  const { success, error: showError } = useToast();
  const { settings } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Web Development',
    budget: '$5k - $10k',
    timeline: 'Within 1 month',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    email: false,
    phone: false,
    message: false
  });
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
      
      if (error) {
        if (error.code === 'PGRST205') {
           console.warn("FAQs table not found in Supabase. Using static fallback data.");
        } else {
           console.error("Error fetching FAQs:", error);
        }
        setFaqs(FAQS); // Fallback to constants
      } else if (!data || data.length === 0) {
        setFaqs(FAQS);
      } else {
        setFaqs(data as FaqItem[]);
      }
    } catch (err) {
      setFaqs(FAQS);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return undefined;
      case 'phone':
        if (value.trim() && !/^\+?[\d\s-]{10,}$/.test(value.trim())) return 'Please enter a valid phone number';
        return undefined;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name as keyof FormTouched]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const phoneError = validateField('phone', formData.phone);
    const messageError = validateField('message', formData.message);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      message: messageError
    });

    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true
    });

    if (!nameError && !emailError && !messageError && !phoneError) {
      setIsSubmitting(true);
      
      try {
        const { error: supabaseError } = await supabase
          .from('leads')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              service: formData.service,
              budget: formData.budget,
              timeline: formData.timeline,
              message: formData.message,
              status: 'new'
            }
          ]);

        if (supabaseError) throw supabaseError;

        if (EMAILJS_SERVICE_ID !== 'service_placeholder') {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              from_name: formData.name,
              from_email: formData.email,
              phone_number: formData.phone,
              service: formData.service,
              budget: formData.budget,
              timeline: formData.timeline,
              message: formData.message,
              to_name: 'Admin', 
            }
          );

          if (EMAILJS_AUTO_REPLY_TEMPLATE_ID !== 'template_auto_reply_placeholder') {
            await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_AUTO_REPLY_TEMPLATE_ID,
              {
                to_name: formData.name,
                to_email: formData.email,
                service: formData.service,
              }
            );
          }
        }

        success("Message sent successfully! We'll be in touch soon.");
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err: any) {
        console.error('Error submitting form:', err);
        showError('Something went wrong. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', service: 'Web Development', budget: '$5k - $10k', timeline: 'Within 1 month', message: '' });
    setTouched({ name: false, email: false, phone: false, message: false });
    setErrors({});
  };

  const getInputClasses = (fieldName: keyof FormErrors) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200";
    const errorClasses = "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400";
    const normalClasses = "border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white";
    
    return `${baseClasses} ${errors[fieldName] && touched[fieldName] ? errorClasses : normalClasses}`;
  };

  return (
    <div className="pt-24 pb-20">
      <SEO 
        title="Contact Us" 
        description="Get in touch with HyperBuild Labs. Book a free consultation for your next web or AI project." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 mb-16 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-0">
            <div className="mb-6 md:mb-0 md:mr-8">
               <div className="flex items-center mb-2">
                  <Calendar className="w-6 h-6 mr-3 text-brand-200" aria-hidden="true" />
                  <h3 className="text-2xl font-bold">Skip the email tag.</h3>
               </div>
               <p className="text-brand-100 max-w-xl">
                 Ready to get started? Book a free 15-minute discovery call directly with our lead engineer.
               </p>
            </div>
            <button 
              onClick={() => setShowBooking(!showBooking)}
              className="flex-shrink-0 bg-white text-brand-700 hover:bg-brand-50 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
            >
               {showBooking ? 'Hide Calendar' : 'Schedule Discovery Call'}
            </button>
          </div>
          
          {showBooking && (
            <div className="mt-8 animate-fadeIn">
              <BookingSystem />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <SectionHeading 
              title="Request a Quote" 
              subtitle="Tell us about your project, budget, and timeline. We'll get back to you with a proposal."
              centered={false}
            />
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl text-center shadow-lg" role="alert">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Received!</h3>
                <p className="mb-6">Thanks for reaching out, {formData.name}. We've sent a confirmation to your email and will be in touch within 24 hours.</p>
                <button 
                  onClick={handleReset}
                  className="text-brand-600 font-bold hover:text-brand-800 underline focus:outline-none"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                {errors.general && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {errors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses('name')}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                    />
                    {errors.name && touched.name && (
                      <div className="flex items-center mt-1.5 text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1.5" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses('phone')}
                      placeholder="+1 (555) 000-0000"
                      disabled={isSubmitting}
                    />
                    {errors.phone && touched.phone && (
                      <div className="flex items-center mt-1.5 text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1.5" />
                        <span>{errors.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('email')}
                    placeholder="john@company.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && touched.email && (
                    <div className="flex items-center mt-1.5 text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1.5" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-slate-700 mb-1">Service Interested In</label>
                  <select 
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
                  >
                    <option>Web Development</option>
                    <option>AI Solutions / Chatbot</option>
                    <option>E-commerce</option>
                    <option>Automation</option>
                    <option>Branding & Design</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">Estimated Budget</label>
                    <select 
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option>&lt; $1k</option>
                      <option>$1k - $5k</option>
                      <option>$5k - $10k</option>
                      <option>$10k - $25k</option>
                      <option>$25k+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-slate-700 mb-1">Timeline</label>
                    <select 
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option>ASAP</option>
                      <option>Within 1 month</option>
                      <option>1-3 months</option>
                      <option>3 months+</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Project Details</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('message')}
                    placeholder="Tell us a bit about your project goals..."
                    disabled={isSubmitting}
                  ></textarea>
                  {errors.message && touched.message && (
                    <div className="flex items-center mt-1.5 text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1.5" />
                      <span>{errors.message}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col justify-start">
            <div className="bg-secondary-900 text-white p-8 rounded-2xl mb-12 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                 <a href={settings.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-2 -ml-2 hover:bg-white/5">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">WhatsApp Us</p>
                      <p className="font-semibold">{settings.contact_phone}</p>
                    </div>
                 </a>
                 <div className="flex items-center p-2 -ml-2">
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mr-4">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email Us</p>
                      <p className="font-semibold">{settings.contact_email}</p>
                    </div>
                 </div>
                 <div className="flex items-center p-2 -ml-2">
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mr-4">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Visit Us</p>
                      <p className="font-semibold">{settings.contact_address}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={faq.id || idx} className="border-b border-slate-200 pb-2">
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex justify-between items-center py-4 text-left focus:outline-none focus:text-brand-600 group"
                    >
                      <h4 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors pr-4">{faq.question}</h4>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-brand-500' : ''}`} 
                      />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
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