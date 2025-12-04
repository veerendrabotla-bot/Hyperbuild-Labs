import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SEO from '../components/SEO';
import { Rocket, Lock, Mail, AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  // If already logged in, redirect to dashboard
  if (user) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Invalid login credentials') {
         setError('Invalid email or password. Please try again.');
      } else {
         setError(err.message || 'Failed to login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/admin/dashboard?reset=true`,
      });
      if (error) throw error;
      success('Password reset link sent to your email');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center px-4">
      <SEO title="Admin Login" description="Restricted Access" />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-brand-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Admin Portal' : 'Reset Password'}
          </h1>
          <p className="text-slate-500 mt-2">
            {mode === 'login' ? 'Enter your credentials to access the dashboard.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="admin@hyperbuild.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center">
                  <AlertCircle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full justify-center" 
                isLoading={isSubmitting}
              >
                Log In
              </Button>
              
              <div className="bg-slate-50 p-4 rounded-lg mt-6 text-xs text-slate-500 text-center border border-slate-100">
                <p className="flex items-center justify-center font-semibold mb-1 text-slate-700">
                  <HelpCircle size={12} className="mr-1" /> Login Issues?
                </p>
                If you are a new team member, ask the Admin to invite your email via the Supabase Dashboard so you can set your password.
              </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="admin@hyperbuild.com"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center">
                  <AlertCircle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full justify-center" 
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>

              <button 
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;