
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Heart, MessageSquare, Clock, Shield, Star, Sparkles, PhoneCall, Check, X, Plus } from 'lucide-react';
import { User, Booking, Notification } from '../types';
import { MoodRain } from '../components/MoodRain';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { CounsellorAvailabilityView } from '../components/CounsellorAvailabilityView';

// You'll need to extract WeeklyCalendar and CounsellorAvailabilityView as well, or pass them in
// For now I'll assume they are passed as components or I'll extract them later.
// I'll extract them later for a cleaner DashboardView.

interface DashboardPageProps {
  user: User;
  users: User[];
  bookings: Booking[];
  onJoinSess: (booking: Booking) => void;
  onBook: (counsellorId: string, time: string, isAnon: boolean) => void;
  onUpdateAvailability: (slots: string[]) => void;
  onCancelBooking: (bookingId: string) => void;
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onToggleTrust: (counsellorId: string) => void;
  onStartDirectChat: (counsellorId: string) => void;
}

export const DashboardPage = ({ 
  user, users, bookings, onJoinSess, onBook, onUpdateAvailability, 
  onCancelBooking, onUpdateBooking, notifications, setNotifications, 
  onToggleTrust, onStartDirectChat
}: DashboardPageProps) => {
  const [activeMoodRain, setActiveMoodRain] = useState<string | null>(null);

  const getPeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Night';
  };

  const todayMoods = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return notifications.filter((n: any) => 
      n.userId === user.id && 
      n.type === 'mood' && 
      new Date(n.timestamp).toLocaleDateString() === todayStr
    );
  }, [notifications, user.id]);

  const weeklyMoodsByDay = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    const moodData = notifications.filter((n: any) => 
      n.userId === user.id && 
      n.type === 'mood'
    );

    return last7Days.map(dateStr => {
      const dayMoods = moodData.filter(m => new Date(m.timestamp).toLocaleDateString() === dateStr);
      return {
        date: dateStr,
        dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        moods: dayMoods
      };
    });
  }, [notifications, user.id]);

  const currentPeriod = getPeriod();
  const hasMoodForPeriod = todayMoods.some((m: any) => m.period === currentPeriod);

  const approvedCounsellors = useMemo(() => users.filter((u: any) => u.role === 'counsellor' && u.status === 'approved'), [users]);
  const trustedCounsellorIds = user.trustedCounsellors || [];
  const trustedCounsellors = approvedCounsellors.filter((c: any) => trustedCounsellorIds.includes(c.id));
  
  const handleMoodClick = (mood: any) => {
    if (hasMoodForPeriod) {
      alert(`You've already shared your ${currentPeriod} vibe! Come back later.`);
      return;
    }

    setActiveMoodRain(null);
    setTimeout(() => setActiveMoodRain(mood.emoji), 10);

    const moodNotification: any = {
      id: Date.now().toString(),
      userId: user.id,
      title: `${currentPeriod} Vibe: ${mood.emoji}`,
      message: `Yandasm noticed you're feeling ${mood.label.toLowerCase()}. Check the library for tips!`,
      type: 'mood',
      period: currentPeriod,
      read: false,
      timestamp: new Date().toISOString()
    };

    const newNotifications = [moodNotification, ...notifications];

    // Notify Trusted Counsellors
    if (trustedCounsellors.length > 0) {
      const mostTrusted = trustedCounsellors[0];
      newNotifications.unshift({
        id: (Date.now() + 1).toString(),
        userId: mostTrusted.id,
        title: `Vibe Alert: ${user.name}`,
        message: `${user.name} is feeling ${mood.label.toLowerCase()} (${mood.emoji}) this ${currentPeriod.toLowerCase()}.`,
        type: 'alert',
        read: false,
        timestamp: new Date().toISOString()
      } as any);
    }

    setNotifications(newNotifications);
  };

  const [selectedCounsellor, setSelectedCounsellor] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);

  const userBookings = useMemo(() => bookings.filter((b: any) => user.role === 'learner' ? b.learnerId === user.id : b.counsellorId === user.id), [bookings, user]);

  // For counsellors: who trusts them?
  const trustingLearners = users.filter((u: any) => u.role === 'learner' && u.trustedCounsellors?.includes(user.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-12">
      <AnimatePresence>
        {activeMoodRain && <MoodRain emoji={activeMoodRain} />}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-brand-dark tracking-tighter uppercase italic py-2">
            Welcome, <span className="text-brand-pink underline decoration-4 underline-offset-8 decoration-brand-teal">{user.name.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-500 font-bold mt-4 text-sm lg:text-base uppercase tracking-widest opacity-60">
            {user.role === 'counsellor' && user.status !== 'approved' ? 'Profile pending administrator review.' : 
             user.role === 'learner' && user.department ? `${user.department} • Grade ${user.year}` :
             'Your wellness dashboard is live.'}
          </p>
        </div>
        {user.role === 'counsellor' && user.status === 'approved' && (
          <button 
            onClick={() => setIsManagingAvailability(true)}
            className="btn-pop-teal"
          >
            <Calendar size={16} /> Manage Availability
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-10 lg:space-y-12">
          {user.role === 'learner' && trustedCounsellors.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-display font-black uppercase text-lg text-brand-dark tracking-widest flex items-center gap-3">
                  <span className="w-3 h-3 bg-brand-orange rounded-full animate-ping" /> Trusted Inner Circle
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                {trustedCounsellors.map((c: any) => (
                  <motion.div 
                    key={c.id} 
                    whileHover={{ y: -5 }}
                    className="shrink-0 w-72 yandasm-pop-card bg-white border-2 border-black p-6 flex flex-col items-center text-center group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-yellow/10 rounded-full -mr-8 -mt-8" />
                    <div className="relative mb-4">
                      <div className="p-1 bg-white border-2 border-black rounded-[2rem] rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform">
                        <img src={c.avatar} className="w-20 h-20 rounded-[1.8rem]" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-brand-orange p-2.5 rounded-full border-2 border-black text-white shadow-[3px_3px_0px_0px_#000]">
                        <Heart size={16} className="fill-white" />
                      </div>
                    </div>
                    <h4 className="font-display font-black text-brand-dark uppercase text-xl tracking-tighter truncate w-full italic">{c.name}</h4>
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6 opacity-60">{c.specialty}</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                      <button onClick={() => onStartDirectChat(c.id)} className="w-full btn-pop-blue py-4 flex items-center justify-center gap-2 text-xs font-display">
                        <MessageSquare size={16} /> Direct Message
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {user.role === 'counsellor' && trustingLearners.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-display font-black uppercase text-lg text-brand-dark tracking-widest px-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-brand-teal rounded-full animate-pulse" /> Members Who Trust You
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                {trustingLearners.map((l: any) => (
                  <motion.div 
                    key={l.id} 
                    whileHover={{ scale: 1.05 }}
                    className="shrink-0 w-64 yandasm-pop-card bg-brand-teal/5 border-2 border-black p-6 flex flex-col items-center text-center"
                  >
                    <div className="p-1 bg-white border-2 border-black rounded-2xl rotate-[-3deg] shadow-[4px_4px_0px_0px_#000] mb-4">
                      <img src={l.avatar} className="w-16 h-16 rounded-xl" />
                    </div>
                    <h4 className="font-display font-black text-brand-dark uppercase text-base tracking-tighter italic">{l.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grade {l.year} • {l.department}</p>
                    <button onClick={() => onStartDirectChat(l.id)} className="w-full btn-pop-teal py-3 flex items-center justify-center gap-2 text-xs">
                      <MessageSquare size={14} /> Start Chat
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mood Tracker */}
          <div className="yandasm-pop-card bg-white border-4 border-black overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <h3 className="font-display font-black uppercase text-xl text-brand-dark flex items-center gap-3">
                  <span className="w-4 h-4 bg-brand-pink rounded-full border-2 border-black" /> How's the vibe today?
                </h3>
                <div className="flex gap-2">
                  {['Morning', 'Afternoon', 'Night'].map(p => {
                    const mood = todayMoods.find((m: any) => m.period === p);
                    const isActive = currentPeriod === p;
                    return (
                      <div key={p} className={`px-3 py-1.5 rounded-full border-2 border-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${mood ? 'bg-emerald-400 text-white' : isActive ? 'bg-brand-yellow text-brand-dark' : 'bg-slate-100 text-slate-400 opacity-50'}`}>
                        {mood ? mood.title.split(': ')[1] : p}
                        {mood && <Check size={10} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasMoodForPeriod ? (
                <div className="p-8 border-2 border-black border-dashed rounded-3xl text-center bg-slate-50">
                   <p className="font-display font-black text-slate-400 uppercase tracking-widest text-sm italic">
                    Great! Your {currentPeriod} vibe is locked in. 
                    <br/><span className="text-[10px] opacity-60">Check back in the {currentPeriod === 'Morning' ? 'Afternoon' : currentPeriod === 'Afternoon' ? 'Night' : 'Morning'}</span>
                   </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 lg:gap-6">
                  {[
                    { emoji: '😎', label: 'Cool', color: 'hover:bg-brand-blue' },
                    { emoji: '😴', label: 'Tired', color: 'hover:bg-brand-lavender' },
                    { emoji: '🤯', label: 'Stressed', color: 'hover:bg-brand-orange' },
                    { emoji: '🥳', label: 'Hype', color: 'hover:bg-brand-yellow' },
                    { emoji: '🫠', label: 'Done', color: 'hover:bg-brand-pink' },
                    { emoji: '✨', label: 'Grateful', color: 'hover:bg-brand-teal' },
                    { emoji: '😤', label: 'Grumpy', color: 'hover:bg-red-200' },
                    { emoji: '🥺', label: 'Low', color: 'hover:bg-sky-200' },
                  ].map((mood, idx) => (
                    <motion.button 
                      key={idx}
                      whileHover={{ y: -8, scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex flex-col items-center gap-2 p-4 min-w-[90px] rounded-[2rem] border-2 border-black transition-all group ${mood.color} bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none`}
                      onClick={() => handleMoodClick(mood)}
                    >
                      <span className="text-4xl group-hover:rotate-12 transition-transform">{mood.emoji}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Mood History */}
          <div className="yandasm-pop-card bg-brand-lavender/5 border-2 border-black p-6 lg:p-8">
            <h3 className="font-display font-black uppercase text-lg text-brand-dark tracking-widest mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-brand-lavender rounded-full" /> Weekly Mood History
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {weeklyMoodsByDay.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    {['Morning', 'Afternoon', 'Night'].map(period => {
                      const mood = day.moods.find((m: any) => m.period === period);
                      return (
                        <div 
                          key={period} 
                          title={`${day.date} - ${period}`}
                          className={`h-10 w-full rounded-lg border border-black/10 flex items-center justify-center text-xl shadow-sm transition-all ${mood ? 'bg-white' : 'bg-slate-50/50 grayscale opacity-20'}`}
                        >
                          {mood ? mood.title.split(': ')[1] : ''}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-display font-black uppercase text-lg text-brand-dark tracking-widest px-2 flex items-center gap-3">
              <span className="w-3 h-3 bg-brand-pink rounded-full" /> Active Sessions
            </h3>
            {userBookings.filter((b: any) => b.status === 'upcoming').length === 0 ? (
              <div className="yandasm-pop-card bg-brand-lavender/10 border-dashed border-2 flex flex-col items-center justify-center p-12 lg:p-16 text-slate-400">
                <Calendar size={48} className="mb-4 text-brand-lavender animate-bounce" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Rest is productive too. No sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {userBookings.filter((b: any) => b.status === 'upcoming').map((b: any, idx: number) => {
                  const counterpart = users.find((u: any) => u.id === (user.role === 'learner' ? b.counsellorId : b.learnerId));
                  const colors = ['bg-brand-blue', 'bg-brand-pink', 'bg-brand-teal', 'bg-brand-yellow'];
                  const cardColor = colors[idx % colors.length];
                  return (
                    <div key={b.id} className="yandasm-pop-card flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-6 bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className={`p-1 bg-white border-2 border-black rounded-2xl ${idx % 2 === 0 ? 'rotate-3' : '-rotate-3'} shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                          <img src={counterpart?.avatar} className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-black text-brand-dark uppercase text-sm truncate">{b.anonymous && user.role === 'learner' ? 'Anonymous Session' : (b.anonymous && user.role === 'counsellor' ? 'Anonymous Learner' : counterpart?.name)}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                             <span className="text-[10px] font-black bg-brand-lavender/30 text-brand-dark px-3 py-1 rounded-full border border-black/10 uppercase flex items-center gap-1 shadow-sm">
                               <Clock size={10} /> {b.time}
                             </span>
                             {b.anonymous && (
                               <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase flex items-center gap-1 shadow-sm">
                                 <Shield size={10} /> Anon
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto flex-wrap">
                        <button onClick={() => onJoinSess(b)} className="btn-pop-primary py-2 px-6 text-[10px] flex-1 sm:flex-none">Open Room</button>
                        {user.role === 'counsellor' && !b.meetingLink && (
                          <button 
                            onClick={() => {
                              const link = prompt('Enter meeting link for this session:', user.meetingLink || '');
                              if (link) {
                                onUpdateBooking(b.id, { meetingLink: link });
                              }
                            }}
                            className="btn-pop-blue py-2 px-6 text-[10px]"
                          >
                            <Plus size={14} /> Link
                          </button>
                        )}
                        {((user.role === 'learner' && (b.meetingLink || counterpart?.meetingLink)) || (user.role === 'counsellor' && (b.meetingLink || user.meetingLink))) && (
                          <a 
                            href={b.meetingLink || (user.role === 'learner' ? counterpart?.meetingLink : user.meetingLink)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-pop-teal py-2 px-6 text-[10px]"
                          >
                            Video
                          </a>
                        )}
                        <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this session?')) {
                                onCancelBooking(b.id);
                              }
                            }}
                            className="btn-pop bg-red-400 text-white hover:bg-red-500 py-2 px-4 shadow-[2px_2px_0px_0px_#000] text-[10px]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {user.role === 'learner' && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-display font-black uppercase text-lg text-brand-dark tracking-widest flex items-center gap-3">
                  <span className="w-3 h-3 bg-brand-teal rounded-full" /> Verified Care
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {approvedCounsellors.filter((c: any) => c.specialty?.toLowerCase().includes(search.toLowerCase())).map((c: any, cid: number) => {
                  const colors = ['bg-brand-blue/5', 'bg-brand-orange/5', 'bg-brand-teal/5', 'bg-brand-lavender/5'];
                  return (
                    <div key={c.id} className={`yandasm-pop-card flex flex-col group ${colors[cid % colors.length]} hover:-translate-y-1 transition-all`}>
                      <div className="flex gap-4 items-start mb-6">
                        <div className={`p-1 bg-white border-2 border-black rounded-2xl ${cid % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'} shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                          <img src={c.avatar} className="w-16 h-16 rounded-xl object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-black text-brand-dark text-base truncate uppercase">{c.name}</p>
                          <p className="text-[10px] font-black text-brand-dark bg-white inline-block px-3 py-1 rounded-full border-2 border-black mt-2 uppercase truncate shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{c.specialty}</p>
                          <div className="flex items-center gap-1 mt-3">
                             <Star size={10} className="text-brand-yellow fill-brand-yellow" />
                             <span className="text-[10px] font-black text-brand-dark/60 uppercase">{c.rating?.toFixed(1) || 'NEW'} RATING</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedCounsellor(c)} className="flex-1 btn-pop-primary py-3 font-display">Book Session</button>
                        <button 
                          onClick={() => onToggleTrust(c.id)} 
                          className={`p-3 rounded-2xl border-2 border-black transition-all ${user.trustedCounsellors?.includes(c.id) ? 'bg-brand-orange text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-slate-400 hover:text-brand-orange shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                        >
                          <Heart size={20} className={user.trustedCounsellors?.includes(c.id) ? 'fill-current' : ''} />
                        </button>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-4 space-y-8">
          <motion.div 
            whileHover={{ scale: 1.02, rotate: 1 }}
            className="yandasm-pop-card bg-brand-orange text-white min-h-[320px] flex flex-col justify-between overflow-hidden relative p-8 border-4 border-black"
          >
            <Sparkles className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 animate-pulse" strokeWidth={1} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center rotate-6 shadow-[3px_3px_0px_0px_#000]">
                  <Heart size={24} className="text-brand-orange fill-brand-orange animate-wiggle" />
                </div>
                <p className="text-[10px] font-black uppercase text-white tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full border border-white/20">Deep Breath</p>
              </div>
              <h4 className="text-4xl font-display font-black leading-tight tracking-tighter uppercase italic text-black text-pop-outline">Vibe Check</h4>
              <p className="text-sm font-bold text-white mt-6 leading-relaxed">
                "Take a moment. You're doing better than you think. Let's do a 5-second reset together."
              </p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-full btn-pop bg-white text-black hover:bg-brand-yellow font-display text-lg py-5"
            >
              Start Reset 🧘‍♂️
            </motion.button>
          </motion.div>
          
          <div className="yandasm-pop-card bg-brand-lavender text-brand-dark p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-dark rounded-2xl flex items-center justify-center rotate-[-6deg] border-2 border-white shadow-[2px_2px_0px_0px_#000]">
                   <PhoneCall size={18} className="text-brand-lavender" />
                </div>
                <h4 className="font-display font-black uppercase text-lg tracking-widest underline decoration-brand-pink decoration-4 decoration-wavy underline-offset-4">Safety</h4>
             </div>
             <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-black rounded-3xl group hover:bg-brand-pink hover:text-white transition-all cursor-pointer">
                   <p className="text-[10px] font-black uppercase opacity-60 mb-1 group-hover:text-white/80">SA Help Line</p>
                   <p className="text-lg font-black italic">0800 456 789</p>
                </div>
                <div className="p-4 bg-white border-2 border-black rounded-3xl group hover:bg-brand-teal hover:text-white transition-all cursor-pointer">
                   <p className="text-[10px] font-black uppercase opacity-60 mb-1 group-hover:text-white/80">Student Care</p>
                   <p className="text-lg font-black italic">0800 121 314</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedCounsellor && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCounsellor(null)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl yandasm-card bg-white p-6 lg:p-12 max-h-[95vh] overflow-hidden flex flex-col">
               <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={selectedCounsellor.avatar} className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-lg" />
                    <div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Book Session</h3>
                      <p className="text-[10px] font-black uppercase text-sky-600">With {selectedCounsellor.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <button onClick={() => { onBook(selectedCounsellor.id, 'Now', false); setSelectedCounsellor(null); }} className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">
                           <PhoneCall size={14} /> Connect Now
                        </button>
                     </div>
                     <button onClick={() => setSelectedCounsellor(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={20} /></button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-hidden rounded-[2.5rem]">
                  <WeeklyCalendar 
                    availableSlots={selectedCounsellor.availableSlots || []} 
                    bookings={bookings.filter((b: any) => b.counsellorId === selectedCounsellor.id)}
                    onBookSlot={(slot: string) => { onBook(selectedCounsellor.id, slot, false); setSelectedCounsellor(null); }}
                    mode="view"
                  />
               </div>

               <div className="mt-8 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-100 rounded-full" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Reserved</span>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManagingAvailability && (
          <CounsellorAvailabilityView 
            user={user} 
            onClose={() => setIsManagingAvailability(false)} 
            onUpdateAvailability={onUpdateAvailability} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
