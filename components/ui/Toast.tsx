import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-slate-800 shadow-lg',
    error: 'bg-white border-l-4 border-red-500 text-slate-800 shadow-lg',
    info: 'bg-slate-800 text-white shadow-xl',
    warning: 'bg-white border-l-4 border-yellow-500 text-slate-800 shadow-lg',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-w-[320px] max-w-md p-4 rounded-lg flex items-start gap-3 mb-3 relative overflow-hidden pointer-events-auto ${styles[type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;