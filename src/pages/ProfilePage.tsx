
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserIcon, Edit, ShieldCheck, Mail, LogOut, Check } from 'lucide-react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export const ProfilePage = ({ user, onUpdate, onLogout }: ProfilePageProps) => {
  const [formData, setFormData] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const AVATAR_SEEDS = [
    'Thabo', 'Lerato', // Black
    'Pieter', 'Sarah', // White
    'Jerome', 'Mandy', // Coloured
    'Ravi', 'Ananya'   // Indian
  ];

  const handleSubmit = () => {
    const updatedUser = { 
      ...formData, 
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${formData.avatarSeed || formData.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` 
    };
    onUpdate(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto pb-20">
      <div className="yandasm-pop-card bg-white p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
          <div className="p-1 bg-white border-2 border-black rounded-[2.5rem] rotate-[-5deg] shadow-[6px_6px_0px_0px_#FFD23F] shrink-0">
            <img src={user.avatar} className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2.2rem] object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left w-full">
            <h2 className="text-3xl lg:text-4xl font-display font-black text-brand-dark uppercase tracking-tighter italic">{user.name}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
               <span className="px-4 py-1.5 bg-brand-blue text-white text-[10px] font-black uppercase rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">{user.role}</span>
               <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-200">{user.email}</span>
            </div>
          </div>
        </div>

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
                   <div className="space-y-4">
                     <p className="text-[9px] font-black uppercase text-slate-400">Avatar Persona</p>
                     <select 
                       value={formData.avatarSeed} onChange={e => setFormData({...formData, avatarSeed: e.target.value})}
                       className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-blue transition-colors font-bold text-sm uppercase"
                     >
                       {AVATAR_SEEDS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
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
