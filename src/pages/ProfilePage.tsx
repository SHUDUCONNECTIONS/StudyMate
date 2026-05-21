
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserIcon, ShieldCheck, LogOut, Check } from 'lucide-react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

const AVATAR_SEEDS = [
  'Thabo', 'Lerato', 'Pieter', 'Sarah', 'Jerome', 'Mandy',
  'Ravi', 'Ananya', 'Sipho', 'Nomsa', 'Dylan', 'Priya',
  'Zanele', 'Marcus', 'Aisha', 'Johan',
];

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

export const ProfilePage = ({ user, onUpdate, onLogout }: ProfilePageProps) => {
  const [formData, setFormData] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const selectedSeed = formData.avatarSeed || formData.name;
  const previewAvatar = avatarUrl(selectedSeed);

  const handlePickSeed = (seed: string) => {
    setFormData({ ...formData, avatarSeed: seed });
    setShowPicker(false);
  };

  const handleSubmit = () => {
    const updatedUser = { ...formData, avatar: avatarUrl(selectedSeed) };
    onUpdate(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto pb-20">
      <div className="yandasm-pop-card bg-white p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
          <div className="relative group shrink-0">
            <div className="p-1 bg-white border-2 border-black rounded-[2.5rem] rotate-[-5deg] shadow-[6px_6px_0px_0px_#FFD23F]">
              <img src={previewAvatar} className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2.2rem] object-cover" />
            </div>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="absolute -bottom-3 -right-3 w-9 h-9 bg-brand-yellow border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
              title="Change avatar"
            >
              ✏️
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left w-full">
            <h2 className="text-3xl lg:text-4xl font-display font-black text-brand-dark uppercase tracking-tighter italic">{formData.name || user.name}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
               <span className="px-4 py-1.5 bg-brand-blue text-white text-[10px] font-black uppercase rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">{user.role}</span>
               <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-200">{user.email}</span>
            </div>
          </div>
        </div>

        {showPicker && (
          <div className="mb-10 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Choose Your Avatar</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATAR_SEEDS.map(seed => (
                <button
                  key={seed}
                  onClick={() => handlePickSeed(seed)}
                  className={`relative rounded-2xl border-2 p-0.5 transition-all hover:scale-110 ${
                    selectedSeed === seed
                      ? 'border-brand-blue shadow-[3px_3px_0px_0px_#5B89BD]'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title={seed}
                >
                  <img src={avatarUrl(seed)} className="w-full aspect-square rounded-xl object-cover" />
                  {selectedSeed === seed && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-blue border-2 border-white rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <p className="text-[9px] font-black uppercase text-slate-400 shrink-0">Custom seed:</p>
              <input
                placeholder="Type any word…"
                className="flex-1 bg-white p-2.5 rounded-xl border-2 border-slate-200 outline-none focus:border-brand-blue text-xs font-bold transition-colors"
                onKeyDown={e => {
                  if (e.key === 'Enter') handlePickSeed((e.target as HTMLInputElement).value.trim() || selectedSeed);
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
           <div className="md:col-span-12 space-y-8">
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <UserIcon size={12} /> Identity Context
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <p className="text-[9px] font-black uppercase text-slate-400">Full Name</p>
                     <input
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-blue transition-colors font-bold text-sm"
                     />
                   </div>
                </div>
              </div>

              {user.role === 'counsellor' && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={12} /> Professional Scope
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-slate-400">Primary Specialty</p>
                      <input 
                        value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-blue transition-colors font-bold text-sm"
                        placeholder="e.g. Trauma Specialist"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-slate-400">Meeting Link</p>
                      <input 
                        value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-blue transition-colors font-bold text-sm"
                        placeholder="Video meeting URL"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t-2 border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <button onClick={onLogout} className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-2">
                   <LogOut size={14} /> Finish Journey
                </button>
                <button 
                  onClick={handleSubmit}
                  className="w-full sm:w-auto btn-pop-blue py-4 px-12 text-[11px]"
                >
                  {saved ? <span className="flex items-center gap-2"><Check size={16} /> Identity Updated</span> : 'Save Identity'}
                </button>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
