
import React from 'react';
import { CheckCircle2, Lock, Plus } from 'lucide-react';

interface WeeklyCalendarProps {
  availableSlots: string[];
  bookings?: any[];
  onToggleSlot?: (slot: string) => void;
  onBookSlot?: (slot: string) => void;
  mode?: 'view' | 'manage';
}

export const WeeklyCalendar = ({ 
  availableSlots, 
  bookings = [], 
  onToggleSlot, 
  onBookSlot, 
  mode = 'view' 
}: WeeklyCalendarProps) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
      <div className="grid grid-cols-8 border-b border-slate-50 bg-slate-50/50">
        <div className="p-4 border-r border-slate-50" />
        {days.map(day => (
          <div key={day} className="p-4 text-center border-r border-slate-50 last:border-r-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{day.substring(0, 3)}</span>
          </div>
        ))}
      </div>
      <div className="max-h-[450px] overflow-y-auto no-scrollbar">
        {times.map(time => (
          <div key={time} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0 group">
            <div className="p-4 flex items-center justify-center border-r border-slate-50 bg-slate-50/20">
              <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{time}</span>
            </div>
            {days.map(day => {
              const slot = `${day} ${time}`;
              const isAvailable = availableSlots.includes(slot);
              const isBooked = bookings.some((b: any) => b.time === slot && b.status === 'upcoming');
              
              if (mode === 'manage') {
                return (
                  <button
                    key={day}
                    onClick={() => onToggleSlot?.(slot)}
                    className={`p-2 border-r border-slate-100 last:border-r-0 min-h-[60px] transition-all flex items-center justify-center group/cell ${
                      isAvailable ? 'bg-sky-50' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {isAvailable ? (
                      <div className="w-full h-full bg-sky-500 rounded-xl flex items-center justify-center text-white scale-95 hover:scale-100 transition-transform">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-100 scale-100 group-hover/cell:scale-110 transition-transform" />
                    )}
                  </button>
                );
              }

              return (
                <div key={day} className="p-2 border-r border-slate-100 last:border-r-0 min-h-[60px] flex items-center justify-center">
                  {isBooked ? (
                    <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                      <Lock size={12} />
                    </div>
                  ) : isAvailable ? (
                    <button
                      onClick={() => onBookSlot?.(slot)}
                      className="w-full h-full bg-emerald-50 hover:bg-emerald-500 rounded-xl flex items-center justify-center text-emerald-600 hover:text-white transition-all scale-95 hover:scale-100 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
