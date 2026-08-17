import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-sm shadow-lg border ${
                t.type === 'success' ? 'bg-techverse-olive/20 border-techverse-olive text-techverse-green' :
                t.type === 'error' ? 'bg-red-100 border-red-500 text-red-900' :
                'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-techverse-green" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              
              <span className="flex-1 font-medium">{t.message}</span>
              
              <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
