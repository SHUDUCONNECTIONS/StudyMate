
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { WeeklyCalendar } from './WeeklyCalendar';
import { User } from '../types';

interface CounsellorAvailabilityViewProps {
  user: User;
  onClose: () => void;
  onUpdateAvailability: (slots: string[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Returns false if the slot string ("Monday 10:00") is already in the past this week
const isSlotFuture = (slot: string): boolean => {
  const parts  = slot.trim().split(' ');
  if (parts.length !== 2) return false;
  const dayIdx = DAYS.indexOf(parts[0]);
  if (dayIdx === -1) return false;
  const [h, m] = parts[1].split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return false;

  const now  = new Date();
  const dow  = now.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const d    = new Date(now);
  d.setDate(now.getDate() + diff + dayIdx);
  d.setHours(h, m, 0, 0);
  return d > now;
};

export const CounsellorAvailabilityView = ({ user, onClose, onUpdateAvailability }: CounsellorAvailabilityViewProps) => {
  // Strip past slots on init and whenever we update
  const futureOnly = useMemo(
    () => (user.availableSlots || []).filter(isSlotFuture),
    [user.availableSlots]
  );
  const [slots, setSlots] = useState<string[]>(futureOnly);

  const handleToggleSlot = (slot: string) => {
    const updated = slots.includes(slot)
      ? slots.filter(s => s !== slot)
      : [...slots, slot].sort();
    setSlots(updated);
    onUpdateAvailability(updated);
  };

  const handleSave = () => {
    // Save only future slots
    const clean = slots.filter(isSlotFuture);
    onUpdateAvailability(clean);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl yandasm-card bg-white p-8 lg:p-12 max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Set Availability</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Click a slot to toggle · Past slots are disabled</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
        </div>

        <div className="overflow-hidden flex-1 rounded-[2.5rem]">
          <WeeklyCalendar
            availableSlots={slots}
            onToggleSlot={handleToggleSlot}
            mode="manage"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-500 rounded-full" />
              <span className="text-[10px] font-black uppercase text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-200" />
              <span className="text-[10px] font-black uppercase text-slate-400">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200 opacity-50" />
              <span className="text-[10px] font-black uppercase text-slate-400">Past (locked)</span>
            </div>
            <div className="h-4 w-px bg-slate-100 hidden sm:block" />
            <p className="text-xs font-black uppercase text-sky-600 italic">{slots.length} slots active</p>
          </div>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
