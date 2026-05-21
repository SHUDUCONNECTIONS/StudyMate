
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, MessageSquare, Clock } from 'lucide-react';
import { User, Booking } from '../types';

interface SessionsPageProps {
  user: User;
  users: User[];
  bookings: Booking[];
  onJoinSession: (booking: Booking) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const SessionsPage = ({ user, users, bookings, onJoinSession }: SessionsPageProps) => {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const myUpcoming = useMemo(() =>
    bookings.filter(b =>
      (user.role === 'learner' ? b.learnerId === user.id : b.counsellorId === user.id) &&
      b.status === 'upcoming'
    ), [bookings, user]);

  const calendarSessions = useMemo(() =>
    myUpcoming.filter(b => DAYS.some(d => b.time.startsWith(d))),
    [myUpcoming]);

  const specialSessions = useMemo(() =>
    myUpcoming.filter(b => !DAYS.some(d => b.time.startsWith(d))),
    [myUpcoming]);

  const getSession = (day: string, time: string) =>
    calendarSessions.find(b => b.time === `${day} ${time}`);

  const getCounterpart = (b: Booking) => {
    const id = user.role === 'learner' ? b.counsellorId : b.learnerId;
    return users.find(u => u.id === id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20 space-y-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-teal/10 border-2 border-brand-teal rounded-2xl text-brand-teal">
          <Calendar size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-display font-black text-brand-dark uppercase tracking-tighter italic">My Sessions</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">All scheduled & active sessions</p>
        </div>
        <div className="ml-auto px-4 py-2 bg-brand-yellow border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[10px] font-black uppercase tracking-widest">{myUpcoming.length} Active</span>
        </div>
      </div>

      {/* Active / special sessions (Now, Direct Chat) */}
      {specialSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black uppercase text-xs text-brand-dark tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse" /> Active Now
          </h3>
          <div className="flex flex-wrap gap-4">
            {specialSessions.map(b => {
              const cp = getCounterpart(b);
              return (
                <div
                  key={b.id}
                  className="yandasm-pop-card bg-brand-teal/5 border-2 border-black flex items-center gap-4 p-5 cursor-pointer hover:bg-brand-teal/10 transition-all"
                  onClick={() => onJoinSession(b)}
                >
                  {cp && <img src={cp.avatar} className="w-12 h-12 rounded-xl border-2 border-black shrink-0" alt="" />}
                  <div className="min-w-0">
                    <p className="font-display font-black text-sm uppercase truncate">
                      {b.anonymous && user.role === 'counsellor' ? 'Anonymous' : (cp?.name || 'Session')}
                    </p>
                    <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <Clock size={8} /> {b.time}
                    </p>
                  </div>
                  <button className="btn-pop-teal py-2 px-4 text-[10px] shrink-0 flex items-center gap-1">
                    <MessageSquare size={12} /> Open
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly calendar */}
      <div className="bg-white rounded-[2rem] border-2 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">

        {/* Day headers */}
        <div className="grid grid-cols-8 bg-brand-dark border-b-2 border-black">
          <div className="p-4 border-r-2 border-white/10">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Time</span>
          </div>
          {DAYS.map(day => (
            <div
              key={day}
              className={`p-4 text-center border-r-2 border-white/10 last:border-r-0 ${day === todayName ? 'bg-brand-teal/30' : ''}`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${day === todayName ? 'text-brand-yellow' : 'text-white/60'}`}>
                {day.substring(0, 3)}
              </span>
              {day === todayName && (
                <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="overflow-y-auto max-h-[560px] no-scrollbar">
          {TIMES.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">
              <div className="p-3 flex items-center justify-center border-r border-slate-100 bg-slate-50/60">
                <span className="text-[10px] font-black text-slate-400 tabular-nums">{time}</span>
              </div>
              {DAYS.map(day => {
                const session = getSession(day, time);
                const cp = session ? getCounterpart(session) : null;
                const isToday = day === todayName;
                return (
                  <div
                    key={day}
                    className={`p-1.5 border-r border-slate-100 last:border-r-0 min-h-[60px] flex items-center justify-center ${isToday ? 'bg-brand-teal/5' : ''}`}
                  >
                    {session ? (
                      <button
                        onClick={() => onJoinSession(session)}
                        className="w-full h-full min-h-[48px] bg-brand-blue text-white rounded-xl p-2 flex flex-col items-start justify-between hover:bg-sky-600 transition-all text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                      >
                        <div className="flex items-center gap-1 w-full min-w-0">
                          {cp && (
                            <img src={cp.avatar} className="w-4 h-4 rounded-sm shrink-0" alt="" />
                          )}
                          <span className="text-[9px] font-black uppercase truncate leading-tight">
                            {session.anonymous && user.role === 'counsellor'
                              ? 'Anon'
                              : (cp?.name?.split(' ')[0] || 'Session')}
                          </span>
                        </div>
                        <span className="text-[7px] font-black opacity-50 uppercase mt-1">Open</span>
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

      {/* Empty state */}
      {myUpcoming.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
            <Calendar size={36} className="text-slate-300" />
          </div>
          <p className="font-black text-slate-300 uppercase tracking-[0.3em] text-xs">No sessions scheduled yet</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-blue rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Booked session</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-teal/30 rounded-md border border-brand-teal/30" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today</span>
        </div>
      </div>
    </motion.div>
  );
};
