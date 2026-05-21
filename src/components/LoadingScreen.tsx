
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { YandasmLogo } from './YandasmLogo';

export const LoadingScreen = ({ message = "Aligning your workspace..." }: { message?: string }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "Take a deep breath. You're doing great.",
    "Hydration is the best fuel for the brain.",
    "A 5-minute walk can clear an hour's worth of stress.",
    "Your progress is valid, no matter the pace.",
    "Small steps lead to big destinations.",
    "The sun will rise again tomorrow.",
    "You are not alone in this journey.",
    "Kindness starts with how you treat yourself."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-lavender/5 backdrop-blur-xl flex flex-col items-center justify-center p-6 cursor-wait">
      <div className="relative mb-12">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 border-8 border-brand-lavender/20 rounded-[40px] absolute inset-0"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 border-8 border-brand-teal/20 rounded-[40px] absolute inset-0"
        />
        <div className="w-32 h-32 flex items-center justify-center bg-white rounded-[40px] shadow-2xl border-4 border-black z-10 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <YandasmLogo className="w-24 h-24" />
          </motion.div>
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-brand-teal"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </div>
      
      <motion.h2 
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-black text-brand-dark uppercase tracking-tighter italic mb-2"
      >
        {message}
      </motion.h2>

      <div className="h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p 
            key={tipIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center max-w-xs"
          >
            Wellness Tip: {tips[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
