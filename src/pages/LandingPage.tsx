
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { YandasmLogo } from '../components/YandasmLogo';
import landingImage from '../assets/images/landing_cartoon_vibe_1779177918990.png';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden font-sans">
      {/* Dynamic Floating Symbols */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute z-10 pointer-events-none opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {['✨', '💙', '🌈', '🧠', '⚡️', '🌸'][i]}
        </motion.div>
      ))}

      <nav className="relative z-30 flex items-center justify-between px-8 lg:px-16 py-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white border-2 border-black rounded-2xl rotate-[-3deg] shadow-[4px_4px_0px_0px_#FFD23F] animate-wiggle">
            <YandasmLogo className="w-16 h-16" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-display font-black text-brand-dark tracking-tighter uppercase leading-none">Yandasm</h1>
            <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mt-1 italic">Mental Wellness</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <button className="hidden md:block text-xs font-black uppercase tracking-widest hover:text-brand-orange transition-colors">Resources</button>
           <button onClick={onGetStarted} className="btn-pop-primary py-3 px-8 font-display text-lg">Log In</button>
        </div>
      </nav>

      <main className="relative z-20 max-w-7xl mx-auto px-8 lg:px-16 pt-8 lg:pt-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-block bg-brand-pink text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border-2 border-black shadow-[4px_4px_0px_0px_#000] mb-4">
            Mental Health Matters
          </div>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-brand-dark leading-[0.85] tracking-tighter uppercase italic text-pop-outline text-white">
            Level Up <br /> 
            <span className="text-brand-teal">Your</span> <br /> 
            Vibe.
          </h2>
          <p className="text-lg lg:text-2xl font-bold text-brand-dark/70 max-w-lg leading-snug">
            Counselling that actually gets you. Verified care, AI support, and a community that listens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
            <button onClick={onGetStarted} className="btn-pop-teal text-xl py-5 px-10 group">
              Start Now <ArrowRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <div className="flex items-center gap-4 py-8 border-t-2 border-black/5">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/notionists/svg?seed=student${i}&backgroundColor=ffd5dc`} className="w-14 h-14 rounded-2xl border-2 border-black shadow-md rotate-[5deg]" />
                ))}
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest">Wellness Community</p>
                <div className="flex gap-1 mt-1">
                   {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-brand-yellow fill-brand-yellow" />)}
                </div>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative"
        >
          <div className="yandasm-pop-card p-4 bg-white border-4 border-black rotate-3 shadow-[12px_12px_0px_0px_#FFD23F] group">
             <img 
               src={landingImage}
               className="w-full h-[550px] object-cover rounded-[2rem] border-2 border-black" 
               alt="Student Wellness Vibe"
             />
             <div className="absolute -bottom-8 -right-8 yandasm-pop-card bg-brand-pink text-brand-dark p-6 rotate-[-6deg] animate-wiggle border-4">
                <p className="text-3xl font-display font-black uppercase italic tracking-tighter">Real Talk. 💬</p>
             </div>
          </div>
          
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-blue rounded-full border-4 border-black -z-10 shadow-[8px_8px_0px_0px_#000]" />
        </motion.div>
      </main>

      <div className="py-20 bg-brand-dark text-white border-t-4 border-black mt-20 relative z-20">
         <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center md:text-left">
            <h3 className="text-3xl font-display font-black uppercase italic text-brand-yellow">Emergency? We're here.</h3>
            <p className="text-brand-yellow/60 font-black uppercase tracking-widest mt-2">Available 24/7 across all campuses</p>
         </div>
      </div>
    </div>
  );
};
