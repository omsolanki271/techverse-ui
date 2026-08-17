import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InitialLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800); // Wait a bit after reaching 100%
          return 100;
        }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-techverse-green flex flex-col items-center justify-center text-techverse-eggshell overflow-hidden"
    >
      <div className="relative w-full max-w-md px-8">
        
        {/* Brand */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black tracking-tighter mb-2">
            TECH<span className="text-techverse-olive">VERSE</span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-sm font-medium tracking-wide uppercase"
          >
            Ideas shaping tomorrow
          </motion.p>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full h-[2px] bg-techverse-eggshell/20 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-techverse-olive"
            style={{ width: `${progress}%` }}
            layout
          />
        </div>

        {/* Progress Text */}
        <div className="mt-4 flex justify-between items-center text-xs font-medium opacity-60">
          <span>Loading</span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InitialLoader;
