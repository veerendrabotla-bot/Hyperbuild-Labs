
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const PartnerRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await register(email, password, name);
      setSuccess(true);
      show('Application submitted for review', 'success');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 size={40} className="text-green-600" />
           </div>
           <h1 className="text-2xl font-black text-slate-900">Application Received!</h1>
           <p className="text-slate-500 mt-4 leading-relaxed font-medium">
             Your account is currently <strong>pending admin approval</strong>. We will notify you via email once your partner access is activated.
           </p>
           <Link to="/" className="mt-8 inline-flex items-center text-brand-600 font-bold hover:underline">
             Back to Homepage <ArrowRight size={16} className="ml-2"/>
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20 pb-20">
      <SEO title="Join Partner Program" description="Apply to become a Growth Partner." />
      
      <div className="max-w-xl w-full grid grid-cols-1 gap-8">
        <div className="text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             <Zap size={12} fill="currentColor"/> Partner Ecosystem
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Become a Growth Partner</h1>
           <p className="text-slate-500 mt-2 font-medium">Refer high-ticket clients and earn recurring commissions.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
          <form onSubmit={handleRegister} className="space-y-6">
            <Input label="Full Identity Name" value={name} onChange={e => setName(e.target.value)} required icon={<User className="h-5 w-5" />} placeholder="John Doe" />
            <Input label="Professional Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required icon={<Mail className="h-5 w-5" />} placeholder="john@company.com" />
            <Input label="Security Key (Password)" type="password" value={password} onChange={e => setPassword(e.target.value)} required icon={<Lock className="h-5 w-5" />} placeholder="••••••••" />

            {error && (
              <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center">
                <AlertCircle size={14} className="mr-2 flex-shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full py-4 text-lg font-black" isLoading={isSubmitting}>Submit Application</Button>
            
            <p className="text-center text-xs text-slate-400 font-medium">
              Already have an approved account? <Link to="/partner/login" className="text-brand-600 font-bold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <BenefitCard icon={<Zap size={18}/>} title="High Payouts" desc="Up to 20% on closed deals." />
           <BenefitCard icon={<CheckCircle2 size={18}/>} title="Transparency" desc="Real-time deal tracking." />
           <BenefitCard icon={<UserPlus size={18}/>} title="Resources" desc="Pitch decks and assets." />
        </div>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
    <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">{icon}</div>
    <h4 className="font-black text-slate-900 text-sm mb-1">{title}</h4>
    <p className="text-xs text-slate-500 font-medium">{desc}</p>
  </div>
);

export default PartnerRegister;
