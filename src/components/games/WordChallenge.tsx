
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, CheckCircle2, Sparkles } from 'lucide-react';

export const WordChallenge = ({ onClose, playerName }: { onClose: () => void; playerName?: string }) => {
  const [guess, setGuess] = useState('');
  const [completed, setCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, date: string}[]>([]);

  // 365 words for each day (truncated for brevity in actual code, but theoretically mapped to day of year)
  const challengeWords = ["wellness", "balance", "kindness", "focus", "clarity", "resilience", "growth", "harmony", "strength", "wisdom"]; // Imagine 365 items
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyWord = challengeWords[dayOfYear % challengeWords.length].toLowerCase();

  useEffect(() => {
    const saved = localStorage.getItem('sm_leaderboard_word');
    if (saved) setLeaderboard(JSON.parse(saved));
    const doneToday = localStorage.getItem(`sm_word_done_${dayOfYear}`);
    if (doneToday) setCompleted(true);
  }, [dayOfYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.toLowerCase() === dailyWord) {
      setCompleted(true);
      localStorage.setItem(`sm_word_done_${dayOfYear}`, 'true');
      const name = playerName || "Scholar";
      {
        const updated = [{ name, date: today.toLocaleDateString() }, ...leaderboard].slice(0, 10);
        setLeaderboard(updated);
        localStorage.setItem('sm_leaderboard_word', JSON.stringify(updated));
      }
    } else {
      alert("Not quite! Think positive wellness vibe.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] max-h-[90vh] flex flex-col">
        <div className="bg-brand-blue p-4 md:p-6 border-b-4 border-black text-white flex justify-between items-center shrink-0">
          <h3 className="font-display font-black uppercase text-lg md:text-2xl italic tracking-tighter leading-none">Daily Word</h3>
          <History size={18} />
        </div>
        <div className="p-6 md:p-12 overflow-y-auto">
          {completed ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-4 drop-shadow-lg" />
              <h2 className="text-2xl md:text-3xl font-display font-black text-brand-dark mb-2 uppercase italic leading-none">Victory!</h2>
              <p className="text-slate-500 font-bold mb-6 italic text-[10px]">Challenge word: <span className="text-brand-blue uppercase">{dailyWord}</span></p>
              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl text-left">
                <h4 className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] leading-none">Masters Registry</h4>
                {leaderboard.map((e, i) => (
                  <div key={i} className="flex justify-between text-[10px] font-black uppercase border-b border-slate-100 py-2.5">
                    <span className="truncate mr-2">{e.name}</span>
                    <span className="text-slate-400 shrink-0">{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-center">
              <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mx-auto mb-6 border-2 border-brand-blue/30">
                <Sparkles size={28} />
              </div>
              <h4 className="text-xl md:text-2xl font-display font-black text-brand-dark mb-3 uppercase italic leading-none">What's the vibe?</h4>
              <p className="text-[9px] md:text-xs font-bold text-slate-400 mb-8 leading-snug uppercase tracking-tight">Crack today's code for a spot on the board.</p>
              <input autoFocus value={guess} onChange={e => setGuess(e.target.value)} className="w-full bg-slate-50 p-5 rounded-xl md:rounded-3xl text-center text-2xl md:text-3xl font-black border-4 border-black shadow-[3px_3px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] focus:bg-white transition-all mb-8 uppercase" placeholder="Word..." />
              <button type="submit" className="btn-primary w-full py-4 text-xl">Submit</button>
            </form>
          )}
        </div>
        <div className="p-4 bg-slate-100 text-center border-t-4 border-black/5">
           <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 hover:text-black">Back to Hub</button>
        </div>
      </motion.div>
    </div>
  );
};
