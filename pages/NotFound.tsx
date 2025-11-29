import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SEO from '../components/SEO';
import { Rocket, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Rocket className="w-12 h-12 text-brand-600 transform -rotate-45" />
          <div className="absolute top-0 right-0 w-6 h-6 bg-red-400 rounded-full animate-ping"></div>
        </div>
        
        <h1 className="text-8xl font-black text-slate-900 mb-2 opacity-10">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-4 -mt-16 relative z-10">Lost in Space?</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you are looking for seems to have drifted into a black hole. Let's get you back to mission control.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} leftIcon={<Home size={18} />}>
            Back Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;