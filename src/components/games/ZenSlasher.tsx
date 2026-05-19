
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Smile, Zap, Trophy, Brain } from 'lucide-react';

interface GameItem { id: number; x: number; y: number; vx: number; vy: number; type: 'vibe' | 'stress'; word: string; sliced: boolean; }

export const ZenSlasher = ({ onClose }: { onClose: () => void }) => {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<GameItem[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  const vibes = ["Joy", "Peace", "Love", "Zen", "Calm", "Hope", "Kind"];
  const stressors = ["Stress", "Burnout", "Worry", "Fear", "Doubt", "Anger"];

  useEffect(() => {
    const saved = localStorage.getItem('sm_leaderboard_zen');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  const saveToLeaderboard = (finalScore: number) => {
    const name = prompt("Enter your Name for the Leaderboard:", "Player");
    if (!name) return;
    const newEntry = { name, score: finalScore };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
    setLeaderboard(updated);
    localStorage.setItem('sm_leaderboard_zen', JSON.stringify(updated));
  };

  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (isGameOver) return;
      setItems(prev => prev.map(item => ({
        ...item,
        x: item.x + item.vx,
        y: item.y + item.vy,
        vy: item.vy + 0.1,
      })).filter(item => item.y < 500));
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isGameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) return;
      const stressProbability = Math.min(0.2 + (score / 1000), 0.6);
      const isVibe = Math.random() > stressProbability;
      const word = isVibe ? vibes[Math.floor(Math.random() * vibes.length)] : stressors[Math.floor(Math.random() * stressors.length)];
      const type: 'vibe' | 'stress' = isVibe ? 'vibe' : 'stress';
      const newItem: GameItem = {
        id: Date.now(),
        x: 50 + (Math.random() - 0.5) * 80, 
        y: 400,
        vx: (Math.random() - 0.5) * 3,
        vy: -9 - Math.random() * 4,
        type,
        word,
        sliced: false
      };
      setItems(prev => [...prev, newItem]);
    }, 1100);
    return () => clearInterval(interval);
  }, [isGameOver, score]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isGameOver || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const trailId = Date.now();
    setTrail(prev => [...prev.slice(-10), { x, y, id: trailId }]);
    setTimeout(() => setTrail(prev => prev.filter(t => t.id !== trailId)), 200);

    setItems(prev => prev.map(item => {
      if (item.sliced) return item;
      const pixelX = (item.x / 100) * rect.width;
      const pixelY = item.y;
      const d = Math.sqrt(Math.pow(x - pixelX, 2) + Math.pow(y - pixelY, 2));
      if (d < 45) {
        if (item.type === 'stress') {
          setIsGameOver(true);
          const fScore = score;
          setTimeout(() => saveToLeaderboard(fScore), 500);
        } else {
          setScore(s => s + 10);
        }
        return { ...item, sliced: true };
      }
      return item;
    }));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, y: 50 }} 
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000]"
      >
        <div className="bg-brand-teal p-3 md:p-6 border-b-4 border-black flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display font-black uppercase italic text-white text-lg md:text-2xl leading-none tracking-tighter">Zen Slasher</h3>
            <p className="text-[8px] md:text-[10px] font-black uppercase text-white/80 tracking-widest mt-0.5">Slice vibes • Avoid stress</p>
          </div>
          <div className="bg-black text-white px-3 md:px-6 py-1.5 md:py-3 rounded-[1rem] md:rounded-2xl font-display font-black text-xl md:text-3xl italic shadow-[3px_3px_0px_0px_#FFD23F]">
            {score}
          </div>
        </div>

        <div ref={gameRef} className="h-64 sm:h-80 md:h-[500px] relative bg-slate-900 overflow-hidden cursor-none touch-none shrink-0" onMouseMove={handleMouseMove} onTouchMove={(e) => {
          if (isGameOver || !gameRef.current) return;
          const rect = gameRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          const trailId = Date.now();
          setTrail(prev => [...prev.slice(-10), { x, y, id: trailId }]);
          setTimeout(() => setTrail(prev => prev.filter(t => t.id !== trailId)), 200);

          setItems(prev => prev.map(item => {
            if (item.sliced) return item;
            const pixelX = (item.x / 100) * rect.width;
            const pixelY = item.y;
            const d = Math.sqrt(Math.pow(x - pixelX, 2) + Math.pow(y - pixelY, 2));
            if (d < 45) {
              if (item.type === 'stress') {
                setIsGameOver(true);
                const fScore = score;
                setTimeout(() => saveToLeaderboard(fScore), 500);
              } else {
                setScore(s => s + 10);
              }
              return { ...item, sliced: true };
            }
            return item;
          }));
        }}>
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            <polyline points={trail.map(t => `${t.x},${t.y}`).join(' ')} fill="none" stroke="#2DD4BF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="opacity-50" />
          </svg>

          {!isGameOver ? (
            items.map(item => (
              <motion.div key={item.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${item.x}%`, top: `${item.y}px` }}>
                {!item.sliced ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className={`p-4 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col items-center gap-1 ${item.type === 'vibe' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                    {item.type === 'vibe' ? <Smile className="text-white" /> : <Zap className="text-white" />}
                    <span className="text-[8px] font-black uppercase text-white tracking-widest">{item.word}</span>
                  </motion.div>
                ) : (
                  <div className="flex gap-4">
                    <motion.div initial={{ x: 0 }} animate={{ x: -50, y: 50, opacity: 0, rotate: -45 }} className={`w-8 h-8 rounded-full ${item.type === 'vibe' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <motion.div initial={{ x: 0 }} animate={{ x: 50, y: 50, opacity: 0, rotate: 45 }} className={`w-8 h-8 rounded-full ${item.type === 'vibe' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-sm">
              <div className="w-24 h-24 bg-red-500 text-white rounded-[32px] flex items-center justify-center mb-6 border-4 border-black shadow-[8px_8px_0px_0px_#000] animate-bounce">
                <Brain size={48} />
              </div>
              <h4 className="text-5xl font-display font-black uppercase italic text-white mb-2 tracking-tighter">Stress Overload!</h4>
              <p className="text-brand-teal font-black text-xl mb-8 uppercase">You sliced {score} pure vibes.</p>
              
              <div className="w-full max-w-sm bg-black/40 p-6 rounded-3xl border-2 border-white/10 mb-8">
                <h5 className="flex items-center gap-2 text-brand-yellow font-black uppercase text-xs mb-4"><Trophy size={14} /> Vibe Champions</h5>
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="text-[10px] font-black text-white/60 uppercase group-first:text-brand-teal">{i + 1}. {entry.name}</span>
                      <span className="text-xs font-display font-black text-white italic">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { setIsGameOver(false); setScore(0); setItems([]); }} className="btn-primary w-full max-w-sm py-6 text-xl">Try Again</button>
            </div>
          )}
          <div className="absolute w-4 h-4 bg-white rounded-full border-2 border-black pointer-events-none mix-blend-difference" style={{ left: trail.length > 0 ? trail[trail.length-1].x : -100, top: trail.length > 0 ? trail[trail.length-1].y : -100, transform: 'translate(-50%, -50%)' }} />
        </div>
        <div className="p-6 bg-slate-50 flex justify-center">
          <button onClick={onClose} className="text-sm font-black uppercase text-slate-400 hover:text-black tracking-widest transition-all">Back to Library</button>
        </div>
      </motion.div>
    </div>
  );
};
