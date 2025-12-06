import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Loading Application...</p>
    </div>
  );
};

export default LoadingScreen;