
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { Lock, Mail, AlertCircle, UserPlus, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Perform Auth Login
      await login(email, password);
      
      // 2. Fetch fresh user data
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Authentication verification failed.");

      // 3. CHECK DATABASE FOR SOURCE OF TRUTH (The team_members table)
      const { data: memberData, error: dbError } = await supabase
        .from('team_members')
        .select('role, is_approved')
        .eq('id', user.id)
        .maybeSingle(); // maybeSingle doesn't error on 0 rows

      if (dbError) {
        console.error("Database check failed:", dbError.message, dbError.details);
        // If we can't check the DB, fallback to user metadata for safety
        const metaRole = user.user_metadata?.role;
        const metaApproved = user.user_metadata?.is_approved === true;
        
        if (metaRole === 'admin') { navigate('/admin/dashboard'); return; }
        if (!metaApproved) {
          await supabase.auth.signOut();
          setError(`Security sync error: ${dbError.message}. Contact admin.`);
          return;
        }
      }

      // 4. Resolve Identity
      const role = memberData?.role || user.user_metadata?.role;
      const isApproved = memberData?.is_approved ?? user.user_metadata?.is_approved;

      // 5. Admin Redirect
      if (role === 'admin') {
        success('Admin session verified');
        navigate('/admin/dashboard');
        return;
      }

      // 6. Employee/Partner Approval Check
      if (!isApproved) {
        await supabase.auth.signOut();
        setError("Your account is pending review. You will receive an email once the admin activates your access.");
        return;
      }

      success('Partner dashboard unlocked');
      navigate('/partner/dashboard');
      
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      setError(err.message || 'Invalid credentials');
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
            <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-4 rounded-xl border border-red-100 flex items-start justify-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" /> 
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-lg font-black uppercase tracking-widest" isLoading={isSubmitting}>
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
