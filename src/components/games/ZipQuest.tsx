
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export const ZipQuest = ({
  onClose, playerName, leaderboard = [], onSaveScore,
}: {
  onClose: () => void;
  playerName?: string;
  leaderboard?: { name: string; score: number }[];
  onSaveScore?: (score: number) => void;
}) => {
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [input, setInput] = useState('');

  const words = ["focus", "calm", "zen", "joy", "peace", "mindful", "steady", "clarity", "power", "spirit", "glow", "kind", "pure", "vibe", "deep", "soft", "light", "bold", "free", "open", "heal", "grow", "rise", "soul", "love", "hope", "faith", "true", "real", "here", "now", "just", "stay", "well", "good", "life", "path", "goal", "dream", "idea", "know", "see", "hear", "feel", "try", "act", "be", "do"];

  const saveScore = (l: number) => {
    onSaveScore?.(l);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 0.1)), 100);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsGameOver(true);
      saveScore(level);
    }
  }, [isActive, timeLeft, level]);

  const startGame = () => {
    setLevel(1);
    setTimeLeft(5.0);
    setTargetWord(words[0]);
    setInput('');
    setIsActive(true);
    setIsGameOver(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setInput(val);
    if (val === targetWord) {
      if (level >= 50) {
        setIsActive(false);
        alert("COMPLETED ALL 50 LEVELS!");
        saveScore(50);
        return;
      }
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setInput('');
      setTargetWord(words[nextLevel % words.length]);
      setTimeLeft(Math.max(1.5, 5.0 - (nextLevel * 0.1)));
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] max-h-[90vh] flex flex-col">
        <div className="bg-brand-orange p-4 md:p-6 border-b-4 border-black flex items-center justify-between text-white shrink-0">
          <h3 className="font-display font-black uppercase text-xl md:text-2xl italic tracking-tighter">Zip Quest</h3>
          <div className="font-black italic text-lg md:text-2xl leading-none">LVL {level}</div>
        </div>
        <div className="p-6 md:p-12 text-center overflow-y-auto">
          {!isActive && !isGameOver ? (
            <div>
              <p className="font-bold text-slate-500 mb-6 md:mb-8 uppercase tracking-widest text-[9px] md:text-xs">Type words fast!</p>
              <button onClick={startGame} className="btn-primary w-full py-4 text-xl">Start Race</button>
            </div>
          ) : isGameOver ? (
            <div>
              <h2 className="text-2xl md:text-4xl font-display font-black text-brand-dark mb-4 uppercase italic leading-none">Timed Out!</h2>
              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl mb-8">
                 <h4 className="text-[9px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 justify-center leading-none tracking-widest"><Trophy size={14}/> Zip Legends</h4>
                 {leaderboard.map((e, i) => (
                   <div key={i} className="flex justify-between text-[10px] font-bold uppercase mb-1">
                     <span>{i+1}. {e.name}</span>
                     <span>LVL {e.score}</span>
                   </div>
                 ))}
              </div>
              <button onClick={startGame} className="btn-primary w-full py-4">Retry</button>
            </div>
          ) : (
            <div>
              <div className="w-full bg-slate-100 h-2 md:h-4 rounded-full overflow-hidden mb-6 md:mb-8 border-2 border-black">
                <motion.div className="h-full bg-brand-orange" initial={{ width: "100%" }} animate={{ width: `${(timeLeft / (5.0 - (level*0.1))) * 100}%` }} />
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black text-brand-dark mb-8 md:mb-12 uppercase italic tracking-tighter break-all">{targetWord}</h1>
              <input autoFocus value={input} onChange={handleInput} className="w-full text-center bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-3xl text-2xl md:text-3xl font-black border-4 border-black outline-none focus:bg-white transition-all shadow-[3px_3px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000]" placeholder="Type..." />
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 text-center border-t-4 border-black/5">
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 hover:text-black transition-all">Back to Games</button>
        </div>
      </motion.div>
    </div>
  );
};
