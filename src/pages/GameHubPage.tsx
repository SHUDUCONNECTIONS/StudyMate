
import React from 'react';
import { motion } from 'motion/react';
import { Zap, History, Sparkles, ChevronRight } from 'lucide-react';

export const GameHubPage = ({ onSelect }: { onSelect: (game: 'zen' | 'zip' | 'word') => void }) => {
  return (
    <div className="max-w-4xl mx-auto py-2 md:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 px-2">
        {[
          { id: 'zen', title: 'Zen Slasher', desc: 'Reaction', icon: Zap, color: 'bg-emerald-400', shadow: 'shadow-[4px_4px_0px_0px_#000]' },
          { id: 'zip', title: 'Zip Quest', desc: 'Speedrun', icon: History, color: 'bg-brand-orange', shadow: 'shadow-[4px_4px_0px_0px_#2DD4BF]' },
          { id: 'word', title: 'Daily Word', desc: 'Mastery', icon: Sparkles, color: 'bg-brand-blue', shadow: 'shadow-[4px_4px_0px_0px_#FFD23F]' }
        ].map(game => (
          <motion.div 
            key={game.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(game.id as any)}
            className={`group cursor-pointer bg-white p-4 md:p-6 border-[3px] border-black rounded-[1.25rem] md:rounded-[1.5rem] ${game.shadow} hover:shadow-[8px_8px_0px_0px_#000] transition-all`}
          >
             <div className={`w-10 h-10 md:w-14 md:h-14 ${game.color} text-white rounded-[0.75rem] md:rounded-[1rem] border-[3px] border-black flex items-center justify-center mb-3 md:mb-6 shadow-[2px_2px_0px_0px_#000] group-hover:rotate-6 transition-transform`}>
                <game.icon size={20} />
             </div>
             <h3 className="text-lg md:text-2xl font-display font-black text-brand-dark mb-1 md:mb-2 uppercase italic tracking-tighter leading-none">{game.title}</h3>
             <p className="text-[7.5px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{game.desc}</p>
             <div className="mt-4 md:mt-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] md:text-[9px] font-black uppercase text-brand-dark">Play</span>
                <div className="w-6 h-6 md:w-8 md:h-8 bg-black text-white rounded-full flex items-center justify-center border-2 border-black">
                   <ChevronRight size={14} />
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
