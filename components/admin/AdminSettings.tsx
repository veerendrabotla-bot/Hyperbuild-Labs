import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../Button';
import { ShieldCheck, Loader2, QrCode } from 'lucide-react';
import * as QRCode from 'qrcode';

const AdminSettings: React.FC = () => {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'enrolling' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const startEnrollment = async () => {
    setLoading(true);
    setStatus('enrolling');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setEnrollmentId(data.id);
      setSecret(data.totp.secret);
      
      // Generate QR Code
      const qr = await QRCode.toDataURL(data.totp.uri);
      setQrCodeUrl(qr);
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Failed to start enrollment');
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: enrollmentId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: enrollmentId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setStatus('success');
      setMessage('Two-Factor Authentication (2FA) has been successfully enabled!');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-brand-100 p-3 rounded-full mr-4">
            <ShieldCheck className="text-brand-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
            <p className="text-slate-500 text-sm">Manage your account security and 2FA.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-semibold text-slate-800 mb-4">Two-Factor Authentication (2FA)</h3>
          
          {status === 'idle' && (
            <div>
              <p className="text-slate-600 text-sm mb-6">
                Protect your admin account by adding an extra layer of security. When enabled, you'll need to enter a code from your authenticator app (like Google Authenticator) to log in.
              </p>
              <Button onClick={startEnrollment} leftIcon={<QrCode size={18} />}>
                Enable 2FA
              </Button>
            </div>
          )}

          {status === 'enrolling' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                 {qrCodeUrl ? (
                   <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                 ) : (
                   <Loader2 className="animate-spin w-8 h-8 text-brand-600 mx-auto" />
                 )}
                 <p className="text-xs text-slate-500 mt-4 break-all font-mono bg-white p-2 rounded border border-slate-200 inline-block">
                   Secret: {secret}
                 </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter the 6-digit code from your app
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-center tracking-widest text-lg"
                    maxLength={6}
                  />
                  <Button onClick={verifyEnrollment} isLoading={loading}>
                    Verify
                  </Button>
                </div>
              </div>
              {message && <p className="text-red-500 text-sm">{message}</p>}
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-bold">{message}</p>
              <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
                Done
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center mb-4">
               <p className="font-bold mb-2">Error</p>
               <p className="text-sm">{message}</p>
               <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;