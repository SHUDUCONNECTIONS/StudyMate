
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, PhoneCall, Smile, Shield, CheckCircle2, Send, Flag, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, Booking } from '../types';

interface ChatPageProps {
  user: User;
  users: User[];
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onSend: () => void;
  isLoading: boolean;
  session: Booking | null;
  onFinish: (bookingId: string, rating: number) => void;
  onReport: (sessionId: string, reason: string, details: string) => Promise<void>;
  scrollRef: React.RefObject<HTMLDivElement>;
  onUpdateUser?: (user: User) => void;
}

export const ChatPage = ({
  user, users, messages, chatInput, setChatInput,
  onSend, isLoading, session, onFinish, onReport, scrollRef, onUpdateUser
}: ChatPageProps) => {
  const [isRating, setIsRating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const submitReport = async () => {
    if (!reportReason || !session) return;
    setReportSending(true);
    await onReport(session.id, reportReason, reportDetails);
    setReportSending(false);
    setReportSent(true);
    setTimeout(() => {
      setIsReporting(false);
      setReportSent(false);
      setReportReason('');
      setReportDetails('');
    }, 1800);
  };


  const shareMeetingLink = () => {
    if (user.role !== 'counsellor') return;
    
    let link = user.meetingLink;
    let isNew = false;
    if (!link) {
      const generated = `https://meet.jit.si/Yandasm_${user.name.replace(/\s+/g, '_')}_${Math.random().toString(36).substring(7)}`;
      link = prompt('No permanent link found. Generate a Yandasm Room link?', generated);
      isNew = true;
    }
    
    if (link) {
      if (isNew && onUpdateUser) {
        onUpdateUser({ ...user, meetingLink: link });
      }
      setChatInput(`Join me for a video call here: ${link}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full max-w-4xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0 gap-2 md:gap-4 px-1">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-sky-900 text-white rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 border-2 border-black">
            <Lock size={14} className="text-sky-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm md:text-2xl font-display font-black text-sky-950 uppercase tracking-tighter truncate italic leading-none">
              {(session as any)?.time === 'Most Trusted Chat' ? 'Direct Support' : (session?.anonymous ? 'Private' : 'Room')}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-[7px] md:text-xs font-black text-brand-orange uppercase tracking-widest truncate">Secure sanctuary</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {user.role === 'counsellor' && (
            <button 
              onClick={shareMeetingLink}
              className="px-2 md:px-4 py-1.5 md:py-2 bg-sky-100 text-sky-600 border border-sky-200 rounded-lg text-[7px] md:text-[10px] font-black uppercase flex items-center gap-1 hover:bg-sky-200 transition-all"
            >
              <PhoneCall size={10} /> <span className="hidden sm:inline">Room</span>
            </button>
          )}
          {session && user.role === 'learner' && (
            <button
              onClick={() => setIsReporting(true)}
              className="px-2 md:px-4 py-1.5 md:py-2 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[7px] md:text-[10px] font-black uppercase flex items-center gap-1 hover:bg-red-100 transition-all"
            >
              <Flag size={10} /> <span className="hidden sm:inline">Report</span>
            </button>
          )}
          {session && (
            <button onClick={() => setIsRating(true)} className="px-3 md:px-6 py-1.5 md:py-2 bg-emerald-600 text-white border-2 border-black rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase shrink-0 shadow-[2px_2px_0px_0px_#000]">Finish</button>
          )}
        </div>
      </div>

      <div className="flex-1 yandasm-card mb-4 flex flex-col overflow-hidden bg-slate-50/30 backdrop-blur-sm border-slate-100">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto opacity-20 py-20">
              <div className="w-24 h-24 bg-slate-200 rounded-[2rem] flex items-center justify-center mb-6">
                <Smile size={48} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Secure Conduit Established</p>
              <p className="text-[10px] font-medium text-slate-400 mt-2 italic">Your conversation is private and protected.</p>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((msg: any, idx: number) => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id || idx} className="flex justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-50 border border-red-200 px-4 py-2 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const belongsToMe = msg.senderId === user.id || (msg.role === 'user' && !session);
              const sender = users.find((u: any) => u.id === msg.senderId);

              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex items-start gap-4 ${belongsToMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Participant Avatar */}
                  <div className="shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] overflow-hidden ${belongsToMe ? 'bg-brand-yellow' : 'bg-brand-lavender'}`}>
                      {session?.anonymous && !belongsToMe ? (
                        <div className="w-full h-full flex items-center justify-center bg-brand-dark text-white">
                          <Shield size={14} />
                        </div>
                      ) : (
                        <img 
                          src={sender?.avatar || (msg.role === 'assistant' ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Yandasm' : `https://api.dicebear.com/7.x/notionists/svg?seed=${msg.role}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  </div>

                  <div className={`flex flex-col max-w-[80%] lg:max-w-[70%] ${belongsToMe ? 'items-end' : 'items-start'}`}>
                    {/* Message Bubble */}
                    <div className={`relative px-6 py-4 text-xs font-black border-2 border-black transition-all ${
                      belongsToMe 
                        ? 'bg-brand-blue text-white rounded-[2rem] rounded-tr-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                        : 'bg-white text-brand-dark rounded-[2rem] rounded-tl-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    }`}>
                      <div className="markdown-body prose prose-sm prose-invert max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </Markdown>
                      </div>
                    </div>
                    
                    {/* Message Meta */}
                    <div className={`flex items-center gap-2 mt-2 px-2 ${belongsToMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] italic">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {belongsToMe && (
                        <div className="flex items-center gap-0.5">
                          <CheckCircle2 size={8} className="text-brand-teal" />
                          <CheckCircle2 size={8} className="text-brand-teal -ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl border-2 border-black bg-brand-lavender p-1 overflow-hidden shrink-0">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Yandasm" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white border-2 border-black rounded-2xl px-6 py-3 flex gap-2 items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-brand-blue rounded-full" />
                 <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-brand-pink rounded-full" />
                 <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-brand-teal rounded-full" />
              </div>
            </motion.div>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="relative">
            <input 
              type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSend()}
              placeholder="Type your message..."
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 pr-12 text-xs font-bold outline-none"
            />
            <button onClick={onSend} className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Send size={18} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRating && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="yandasm-card bg-white p-12 text-center max-w-sm">
               <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Rate Session</h3>
               <p className="text-xs font-medium text-slate-400 mb-8 uppercase">How helpful was this talk?</p>
               <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => onFinish(session?.id || '', v)} className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-xl hover:bg-yellow-100 hover:border-yellow-200 transition-all">{v} ★</button>
                  ))}
               </div>
               <button onClick={() => setIsRating(false)} className="text-[10px] font-black uppercase text-slate-400">Not now</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="yandasm-card bg-white p-8 w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_#000]"
            >
              {reportSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-brand-dark">Report Sent</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">An admin has been alerted</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-xl text-red-500"><AlertTriangle size={20} /></div>
                    <div>
                      <h3 className="text-xl font-display font-black text-brand-dark uppercase italic">Report Session</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin will be alerted immediately</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Reason</p>
                      <select
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-600 outline-none focus:border-red-400"
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                      >
                        <option value="">Select a reason…</option>
                        <option value="Inappropriate behaviour">Inappropriate behaviour</option>
                        <option value="Harassment or bullying">Harassment or bullying</option>
                        <option value="Misconduct">Misconduct</option>
                        <option value="Unsafe advice">Unsafe advice</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Additional details (optional)</p>
                      <textarea
                        className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-400 resize-none no-scrollbar"
                        placeholder="Describe what happened…"
                        value={reportDetails}
                        onChange={e => setReportDetails(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsReporting(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">
                      Cancel
                    </button>
                    <button
                      onClick={submitReport}
                      disabled={!reportReason || reportSending}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] text-[10px] font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      <Flag size={12} /> {reportSending ? 'Sending…' : 'Submit Report'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
