
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const MoodRain = ({ emoji }: { emoji: string }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 2,
      size: 20 + Math.random() * 40,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
    
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, [emoji]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -100, x: `${p.x}vw`, rotate: 0, opacity: 0 }}
            animate={{ 
              y: '110vh', 
              rotate: p.rotation + 720, 
              opacity: [0, 1, 1, 0],
              x: `${p.x + (Math.random() * 10 - 5)}vw` 
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              ease: "circIn" 
            }}
            className="absolute select-none"
            style={{ fontSize: p.size }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
