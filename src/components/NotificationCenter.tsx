
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, ShieldCheck } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  userId: string;
  onMarkRead: (userId: string) => void;
}

export const NotificationCenter = ({ notifications, userId, onMarkRead }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const userNotifs = notifications.filter((n: any) => n.userId === userId);
  const unreadCount = userNotifs.filter((n: any) => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) onMarkRead(userId); }} 
        className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-[-60px] sm:right-0 mt-2 w-[280px] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[400px]"
            >
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Notifications</h4>
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-sky-100 text-sky-600 rounded-full text-[8px] font-bold">{unreadCount} New</span>}
              </div>
              <div className="overflow-y-auto no-scrollbar flex-1">
                {userNotifs.length === 0 ? (
                  <div className="p-8 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                    No notifications
                  </div>
                ) : (
                  userNotifs.map((n: any) => (
                    <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-sky-50/30' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                          n.type === 'booking' ? 'bg-emerald-100 text-emerald-600' : 
                          n.type === 'registration' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                        }`}>
                          {n.type === 'booking' ? <Calendar size={14} /> : n.type === 'registration' ? <ShieldCheck size={14} /> : <Bell size={14} />}
                        </div>
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-tight ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[8px] font-black text-slate-300 mt-2 uppercase">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
