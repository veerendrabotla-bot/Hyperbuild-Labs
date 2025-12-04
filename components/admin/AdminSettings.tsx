import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../Button';
import Input from '../ui/Input';
import { ShieldCheck, Loader2, QrCode, User, Lock, Bell, Save, CheckCircle } from 'lucide-react';
import * as QRCode from 'qrcode';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // 2FA State
  const [enrollmentId, setEnrollmentId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading2FA, setLoading2FA] = useState(false);
  const [status2FA, setStatus2FA] = useState<'idle' | 'enrolling' | 'success' | 'error'>('idle');
  const [message2FA, setMessage2FA] = useState('');

  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user metadata
      supabase.auth.getUser().then(({ data }) => {
        setProfileData({
          fullName: data.user?.user_metadata?.full_name || '',
          email: data.user?.email || ''
        });
      });
    }
  }, [user]);

  // --- 2FA LOGIC ---
  const startEnrollment = async () => {
    setLoading2FA(true);
    setStatus2FA('enrolling');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setEnrollmentId(data.id);
      setSecret(data.totp.secret);
      
      const qr = await QRCode.toDataURL(data.totp.uri);
      setQrCodeUrl(qr);
      
    } catch (err: any) {
      console.error(err);
      setStatus2FA('error');
      setMessage2FA(err.message || 'Failed to start enrollment');
    } finally {
      setLoading2FA(false);
    }
  };

  const verifyEnrollment = async () => {
    setLoading2FA(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: enrollmentId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: enrollmentId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setStatus2FA('success');
      setMessage2FA('Two-Factor Authentication (2FA) has been successfully enabled!');
    } catch (err: any) {
      console.error(err);
      setStatus2FA('error');
      setMessage2FA(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading2FA(false);
    }
  };

  // --- PROFILE LOGIC ---
  const updateProfile = async () => {
    setLoadingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
        data: { full_name: profileData.fullName }
      });

      if (error) throw error;
      success('Profile updated successfully');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- PASSWORD LOGIC ---
  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;
      success('Password updated successfully');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <User className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin Profile</h2>
            <p className="text-slate-500 text-sm">Update your personal details.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
           <Input 
             label="Full Name" 
             value={profileData.fullName} 
             onChange={e => setProfileData({...profileData, fullName: e.target.value})}
             placeholder="Admin Name"
           />
           <Input 
             label="Email Address" 
             value={profileData.email} 
             onChange={e => setProfileData({...profileData, email: e.target.value})}
             type="email"
           />
           <div className="md:col-span-2 flex justify-end">
             <Button onClick={updateProfile} isLoading={loadingProfile} leftIcon={<Save size={18}/>}>
               Save Changes
             </Button>
           </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Update */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-full">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Lock className="text-orange-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
            </div>
          </div>
          <div className="space-y-4 border-t border-slate-100 pt-6">
             <Input 
               label="New Password" 
               type="password" 
               value={passwords.newPassword}
               onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
             />
             <Input 
               label="Confirm Password" 
               type="password" 
               value={passwords.confirmPassword}
               onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
             />
             <Button 
               onClick={updatePassword} 
               isLoading={loadingPassword} 
               variant="outline" 
               className="w-full"
             >
               Update Password
             </Button>
          </div>
        </div>

        {/* 2FA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-full">
          <div className="flex items-center mb-6">
            <div className="bg-brand-100 p-3 rounded-full mr-4">
              <ShieldCheck className="text-brand-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Two-Factor Auth</h2>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {status2FA === 'idle' && (
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-6">
                  Add an extra layer of security. You'll need a code from Google Authenticator to log in.
                </p>
                <Button onClick={startEnrollment} leftIcon={<QrCode size={18} />} className="w-full">
                  Enable 2FA
                </Button>
              </div>
            )}

            {status2FA === 'enrolling' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                   {qrCodeUrl ? (
                     <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-32 h-32" />
                   ) : (
                     <Loader2 className="animate-spin w-8 h-8 text-brand-600 mx-auto" />
                   )}
                   <p className="text-[10px] text-slate-500 mt-2 break-all font-mono">
                     {secret}
                   </p>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-center tracking-widest"
                    maxLength={6}
                  />
                  <Button onClick={verifyEnrollment} isLoading={loading2FA}>Verify</Button>
                </div>
                {message2FA && <p className="text-red-500 text-xs text-center">{message2FA}</p>}
              </div>
            )}

            {status2FA === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="font-bold text-sm">{message2FA}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setStatus2FA('idle')}>Close</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Simulation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Bell className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            <p className="text-slate-500 text-sm">Manage email alerts.</p>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-6 space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <p className="font-medium text-slate-900">New Lead Alerts</p>
               <p className="text-xs text-slate-500">Get an email when a new form is submitted.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" defaultChecked />
               <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
             </label>
           </div>
           <div className="flex items-center justify-between">
             <div>
               <p className="font-medium text-slate-900">Weekly Report</p>
               <p className="text-xs text-slate-500">Receive a summary of agency performance.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" />
               <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
             </label>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;