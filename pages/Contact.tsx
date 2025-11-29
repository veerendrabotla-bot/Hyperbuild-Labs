import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { Mail, Phone, MapPin, MessageCircle, Calendar, AlertCircle } from 'lucide-react';
import { FAQS, WHATSAPP_LINK } from '../constants';
import SEO from '../components/SEO';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface FormTouched {
  name: boolean;
  email: boolean;
  message: boolean;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Web Development',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    email: false,
    message: false
  });
  const [submitted, setSubmitted] = useState(false);

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

    // Real-time validation if the field has been touched
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const messageError = validateField('message', formData.message);

    setErrors({
      name: nameError,
      email: emailError,
      message: messageError
    });

    setTouched({
      name: true,
      email: true,
      message: true
    });

    if (!nameError && !emailError && !messageError) {
      // Simulate form submission
      console.log('Form Submitted:', formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        description="Get in touch with HyperBuild Labs. Book a free consultation for your next web or AI project. Available via form, email, or WhatsApp." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Schedule Call Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 mb-16 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
          <div className="mb-6 md:mb-0 md:mr-8">
             <div className="flex items-center mb-2">
                <Calendar className="w-6 h-6 mr-3 text-brand-200" aria-hidden="true" />
                <h3 className="text-2xl font-bold">Skip the email tag.</h3>
             </div>
             <p className="text-brand-100 max-w-xl">
               Ready to get started? Book a free 15-minute discovery call directly with our lead engineer to discuss your project feasibility.
             </p>
          </div>
          <a href="#" className="flex-shrink-0 bg-white text-brand-700 hover:bg-brand-50 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
             Schedule Discovery Call
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <div>
            <SectionHeading 
              title="Send us a Message" 
              subtitle="Fill out the form below or message us on WhatsApp for a quick response."
              centered={false}
            />
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl text-center" role="alert">
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p>Thanks for reaching out, {formData.name}. We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', service: 'Web Development', message: '' });
                    setTouched({ name: false, email: false, message: false });
                    setErrors({});
                  }}
                  className="mt-6 text-sm font-bold underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
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
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && touched.name && (
                    <div id="name-error" className="flex items-center mt-1.5 text-red-500 text-sm animate-fadeIn">
                      <AlertCircle size={14} className="mr-1.5 flex-shrink-0" />
                      <span>{errors.name}</span>
                    </div>
                  )}
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
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && touched.email && (
                    <div id="email-error" className="flex items-center mt-1.5 text-red-500 text-sm animate-fadeIn">
                      <AlertCircle size={14} className="mr-1.5 flex-shrink-0" />
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
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow bg-white"
                  >
                    <option>Web Development</option>
                    <option>AI Solutions / Chatbot</option>
                    <option>E-commerce</option>
                    <option>Automation</option>
                    <option>Branding & Design</option>
                  </select>
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
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  ></textarea>
                  {errors.message && touched.message && (
                    <div id="message-error" className="flex items-center mt-1.5 text-red-500 text-sm animate-fadeIn">
                      <AlertCircle size={14} className="mr-1.5 flex-shrink-0" />
                      <span>{errors.message}</span>
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="w-full" size="lg">Send Message</Button>
              </form>
            )}
          </div>

          {/* Contact Info & FAQ */}
          <div className="flex flex-col justify-center">
            <div className="bg-secondary-900 text-white p-8 rounded-2xl mb-12 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                 <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-2 -ml-2 hover:bg-white/5" aria-label="Chat with us on WhatsApp">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="text-white" size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">WhatsApp Us</p>
                      <p className="font-semibold">+1 (555) 123-4567</p>
                    </div>
                 </a>
                 <div className="flex items-center p-2 -ml-2">
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mr-4">
                      <Mail className="text-white" size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email Us</p>
                      <p className="font-semibold">hello@hyperbuildlabs.com</p>
                    </div>
                 </div>
                 <div className="flex items-center p-2 -ml-2">
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mr-4">
                      <MapPin className="text-white" size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Visit Us</p>
                      <p className="font-semibold">123 Innovation Dr, Tech City</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* FAQ Preview */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {FAQS.slice(0, 3).map((faq, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{faq.question}</h4>
                    <p className="text-slate-600 text-sm">{faq.answer}</p>
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