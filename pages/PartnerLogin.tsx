
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { Lock, Mail, AlertCircle, UserPlus, Zap, Loader2, WifiOff, RefreshCcw } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setIsNetworkError(false);

    try {
      await login(email, password);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Session verification failed.");

      const { data: memberData, error: dbError } = await supabase
        .from('team_members')
        .select('role, is_approved')
        .eq('id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      const role = memberData?.role || user.user_metadata?.role;
      const isApproved = memberData?.is_approved ?? user.user_metadata?.is_approved;

      if (role === 'admin') {
        success('Admin session verified');
        navigate('/admin/dashboard');
        return;
      }

      if (!isApproved) {
        await supabase.auth.signOut();
        setError("Your account is pending review. You will receive an email once the admin activates your access.");
        return;
      }

      success('Partner dashboard unlocked');
      navigate('/partner/dashboard');
      
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      
      if (err.message === 'NETWORK_UNREACHABLE' || err.message === 'Failed to fetch') {
        setIsNetworkError(true);
        setError("Backend Unreachable: The system cannot contact the database. This usually means the Supabase project is paused or your internet is blocked.");
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20 pb-20">
      <SEO title="Staff Portal" description="Secure access for agency staff and partners." />
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Zap className="text-brand-600 w-8 h-8" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Staff Secure Portal</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Identity Verification Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Authorized Email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            icon={<Mail className="h-5 w-5" />} 
          />
          <Input 
            label="Secret Key" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            icon={<Lock className="h-5 w-5" />} 
          />

          {error && (
            <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${isNetworkError ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-start">
                {isNetworkError ? <WifiOff size={18} className="mr-2 text-orange-600 flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />}
                <span className={`text-xs font-bold ${isNetworkError ? 'text-orange-700' : 'text-red-700'}`}>{error}</span>
              </div>
              
              {isNetworkError && (
                <div className="bg-white/50 p-3 rounded-lg border border-orange-200">
                  <p className="text-[10px] font-black text-orange-800 uppercase mb-2">Troubleshooting Steps:</p>
                  <ul className="text-[10px] space-y-1 text-orange-700 font-medium list-disc ml-4">
                    <li>Check if your Supabase project is active/unpaused.</li>
                    <li>Verify the SUPABASE_URL in constants.tsx.</li>
                    <li>Disable Ad-blockers or strict Firewalls.</li>
                    <li>Check your internet connection.</li>
                  </ul>
                  <button 
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700"
                  >
                    <RefreshCcw size={12} /> Force Reload Node
                  </button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-brand-500/20" isLoading={isSubmitting}>
            Unlock Dashboard
          </Button>
          
          <div className="pt-6 border-t border-slate-50 mt-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">New Growth Partner?</p>
            <Link to="/partner/register" className="w-full flex items-center justify-center gap-2 py-3 bg-brand-50 text-brand-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-100 transition-all border border-brand-100">
              <UserPlus size={14}/> Apply for Partner Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerLogin;
