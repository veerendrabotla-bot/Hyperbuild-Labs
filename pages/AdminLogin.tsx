
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import SEO from '../components/SEO';
import { Rocket, Lock, Mail, AlertCircle, ArrowLeft, WifiOff, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Input from '../components/ui/Input';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();
  const { settings } = useSiteSettings();

  // If already recognized as admin, redirect immediately
  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setIsNetworkError(false);

    try {
      await login(email, password);
      
      const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const role = freshUser?.user_metadata?.role;
      
      if (role === 'admin') {
        success('Root access granted');
        navigate('/admin/dashboard');
      } else {
        navigate('/partner/dashboard');
      }
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      if (err.message === 'NETWORK_UNREACHABLE' || err.message === 'Failed to fetch') {
        setIsNetworkError(true);
        setError("Backend Unreachable: The agency infrastructure node cannot reach Supabase. Verify credentials and project status.");
      } else {
        setError(err.message === 'Invalid login credentials' ? 'Invalid credentials' : err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/admin/dashboard?reset=true`,
      });
      if (error) throw error;
      success('Reset link dispatched');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900 flex flex-col items-center justify-center px-4 relative">
      <SEO title="Admin Portal" description="Restricted Infrastructure Access" />
      
      <Link 
        to="/" 
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors bg-white/5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Return to Public Node
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-white/10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-100 shadow-inner">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-3" />
            ) : (
              <Rocket className="text-brand-600 w-10 h-10" />
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Root Access' : 'Secure Reset'}
          </h1>
          <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Agency OS Virtual Terminal' : 'Verification Sequence'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
              <Input 
                label="Root Email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-5 w-5" />}
                placeholder="admin@agency.sh"
              />

              <div>
                <Input
                  label="Security Key"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="h-5 w-5" />}
                  placeholder="••••••••"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-black uppercase tracking-widest"
                  >
                    Forgot Key?
                  </button>
                </div>
              </div>

              {error && (
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isNetworkError ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center">
                    {isNetworkError ? <WifiOff size={16} className="mr-2 text-orange-600 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 text-red-600 flex-shrink-0" />}
                    <span className={`text-xs font-bold ${isNetworkError ? 'text-orange-700' : 'text-red-700'}`}>{error}</span>
                  </div>
                  {isNetworkError && (
                    <button 
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-[9px] font-black uppercase tracking-widest text-brand-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <RefreshCcw size={10} /> Retry Handshake
                    </button>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-brand-500/20" 
                isLoading={isSubmitting}
              >
                Unlock OS
              </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
             <Input 
                label="Email Endpoint" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-5 w-5" />}
              />

              {error && (
                <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full py-4 font-black uppercase tracking-widest" isLoading={isSubmitting}>
                Dispatch Verification
              </Button>

              <button 
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <ArrowLeft size={14} className="mr-2" /> Return to Login
              </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
