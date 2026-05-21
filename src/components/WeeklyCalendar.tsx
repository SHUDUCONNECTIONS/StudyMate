
import React, { useMemo } from 'react';
import { CheckCircle2, Lock, Plus } from 'lucide-react';

interface WeeklyCalendarProps {
  availableSlots: string[];
  bookings?: any[];
  onToggleSlot?: (slot: string) => void;
  onBookSlot?: (slot: string) => void;
  mode?: 'view' | 'manage';
}

const DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// Returns the 7 Date objects for Mon–Sun of the current week
const getWeekDates = (): Date[] => {
  const today = new Date();
  const dow   = today.getDay(); // 0=Sun … 6=Sat
  const diff  = dow === 0 ? -6 : 1 - dow; // shift so Monday = index 0
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const slotDateTime = (dayIdx: number, time: string, weekDates: Date[]): Date => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(weekDates[dayIdx]);
  d.setHours(h, m, 0, 0);
  return d;
};

export const WeeklyCalendar = ({
  availableSlots,
  bookings = [],
  onToggleSlot,
  onBookSlot,
  mode = 'view',
}: WeeklyCalendarProps) => {
  const weekDates = useMemo(getWeekDates, []);
  const now       = useMemo(() => new Date(), []);

  const todayStr = now.toDateString();
  const isToday  = (i: number) => weekDates[i].toDateString() === todayStr;
  const isPast   = (i: number, time: string) => slotDateTime(i, time, weekDates) < now;

  return (
    <div className="w-full bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
      {/* Day headers with actual dates */}
      <div className="grid grid-cols-8 border-b-2 border-slate-200 bg-slate-50">
        <div className="p-3 border-r-2 border-slate-200 flex items-center justify-center">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time</span>
        </div>
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={`p-3 text-center border-r-2 border-slate-200 last:border-r-0 ${isToday(i) ? 'bg-brand-teal/10' : ''}`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest ${isToday(i) ? 'text-brand-teal' : 'text-slate-500'}`}>
              {day.substring(0, 3)}
            </p>
            <p className={`text-lg font-display font-black leading-none mt-0.5 ${isToday(i) ? 'text-brand-teal' : 'text-slate-700'}`}>
              {weekDates[i].getDate()}
            </p>
            <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isToday(i) ? 'text-brand-teal/70' : 'text-slate-400'}`}>
              {weekDates[i].toLocaleDateString('en-ZA', { month: 'short' })}
            </p>
            {isToday(i) && <div className="w-1.5 h-1.5 bg-brand-teal rounded-full mx-auto mt-1" />}
          </div>
        ))}
      </div>

      {/* Time rows */}
      <div className="max-h-[450px] overflow-y-auto no-scrollbar">
        {TIMES.map(time => (
          <div key={time} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0">
            <div className="p-3 flex items-center justify-center border-r-2 border-slate-200 bg-slate-50">
              <span className="text-[10px] font-black text-slate-500 whitespace-nowrap tabular-nums">{time}</span>
            </div>
            {DAYS.map((day, i) => {
              const slot   = `${day} ${time}`;
              const past   = isPast(i, time);
              const isAvailable = availableSlots.includes(slot);
              const isBooked    = bookings.some((b: any) => b.time === slot && b.status === 'upcoming');

              if (mode === 'manage') {
                return (
                  <button
                    key={day}
                    disabled={past}
                    onClick={() => !past && onToggleSlot?.(slot)}
                    className={`p-2 border-r border-slate-200 last:border-r-0 min-h-[60px] transition-all flex items-center justify-center
                      ${past ? 'bg-slate-50/50 cursor-not-allowed' : isAvailable ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                  >
                    {past ? (
                      <div className="w-3 h-3 rounded-full bg-slate-200 opacity-50" />
                    ) : isAvailable ? (
                      <div className="w-full h-full bg-sky-500 rounded-xl flex items-center justify-center text-white scale-95 hover:scale-100 transition-transform">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors" />
                    )}
                  </button>
                );
              }

              // View mode
              return (
                <div
                  key={day}
                  className={`p-2 border-r border-slate-200 last:border-r-0 min-h-[60px] flex items-center justify-center
                    ${past ? 'bg-slate-50/30' : ''}`}
                >
                  {past ? (
                    // Past — always empty/greyed regardless of availability
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100 opacity-40" />
                  ) : isBooked ? (
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
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
