
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Download, X, ArrowRight, Phone, Mail
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Booking, Message } from '../types';

interface AdminPageProps {
  users: User[];
  onApprove: (userId: string, approved: boolean) => void;
  bookings: Booking[];
  messages: Message[];
  onDownloadPDF: (user: User) => void;
}

export const AdminPage = ({ users, onApprove, bookings, messages, onDownloadPDF }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'students' | 'chats'>('pending');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  
  const pending = users.filter((u: any) => u.role === 'counsellor' && u.status === 'pending');
  const allCounsellors = users.filter((u: any) => u.role === 'counsellor');
  const allLearners = users.filter((u: any) => u.role === 'learner');

  const chatSessions = useMemo(() => {
    return (bookings || []).map((b: any) => {
      const learner = users.find((u: any) => u.id === b.learnerId);
      const counsellor = users.find((u: any) => u.id === b.counsellorId);
      const sessionMessages = (messages || []).filter((m: any) => (m as any).sessionId === b.id);
      return { ...b, learner, counsellor, messageCount: sessionMessages.length };
    }).sort((a: any, b: any) => b.id.localeCompare(a.id));
  }, [bookings, users, messages]);

  const selectedChatMessages = useMemo(() => {
    if (!selectedChatId) return [];
    return (messages || []).filter((m: any) => (m as any).sessionId === selectedChatId);
  }, [selectedChatId, messages]);

  const selectedBooking = useMemo(() => {
    return (bookings || []).find((b: any) => b.id === selectedChatId);
  }, [selectedChatId, bookings]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-2">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-brand-blue/10 border-2 border-brand-blue rounded-xl text-brand-blue">
             <Shield size={24} />
           </div>
           <h2 className="text-2xl lg:text-3xl font-display font-black text-brand-dark uppercase tracking-tighter italic">Admin Oversight</h2>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          {['pending', 'all', 'students', 'chats'].map((tab: any) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedChatId(null); }} 
              className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'}`}
            >
              {tab === 'pending' ? `Pending (${pending.length})` : 
               tab === 'all' ? `Counsellors (${allCounsellors.length})` : 
               tab === 'students' ? `Students (${allLearners.length})` :
               `Chats (${bookings.length})`}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {activeTab === 'pending' && (
          pending.length === 0 ? (
            <div className="yandasm-card p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs border-dashed border-2 rounded-[2rem]">Queue Clear</div>
          ) : (
            pending.map((u: any) => (
              <div key={u.id} className="yandasm-card bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-[2rem]">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-start gap-4">
                     <div className="p-1 bg-white border-2 border-black rounded-2xl rotate-3">
                       <img src={u.avatar} className="w-16 h-16 rounded-xl" />
                     </div>
                     <div>
                       <p className="font-display font-black text-brand-dark uppercase text-lg italic">{u.name}</p>
                       <p className="text-[10px] font-black text-brand-blue uppercase mt-1 bg-brand-blue/5 px-3 py-1 rounded-full inline-block tracking-widest">{u.specialty}</p>
                       <div className="flex flex-wrap items-center gap-3 mt-4">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgaW50cnlkZWZpbmVkCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iaiA8PCAvVHlwZSAvUGFnZXMgL0NvdW50IDEgL0tpZHMgWzMgMCBSXSA+PiBlbmRvYmoKMyAwIG9iaiA8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiA+PiBlbmRvYmoKNCAwIG9iaiA8PCAvTGVuZ3RoIDY1ID4+IHN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZAooU3R1ZHlNYXRlIENvdW5zZWxsb3IgQ1YgLSBEZW1vIFBERikgVmoKRVQKamYKZW5kc3RyZWFtIGVuZG9iagp0cmFpbGVyIDw8IC9Sb290IDEgMCBSID4+CiUlRU9G';
                              link.download = u.cvFileName || 'counselor_qualifications.pdf';
                              link.click();
                            }}
                            className="btn-pop text-[10px] py-2 px-4 flex items-center gap-2 border-2"
                          >
                             <Download size={14} /> Download CV
                          </button>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-3 shrink-0">
                     <button onClick={() => onApprove(u.id, false)} className="px-6 py-2 text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-colors">Reject</button>
                     <button onClick={() => onApprove(u.id, true)} className="btn-pop-teal py-3 px-8 text-[10px]">Approve Entry</button>
                   </div>
                 </div>
              </div>
            ))
          )
        )}

        {activeTab === 'all' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              {allCounsellors.map((c: any) => (
                <div key={c.id} className="yandasm-card bg-white p-6 border-2 border-black flex items-center justify-between shadow-[4px_4px_0px_0px_#000] rounded-3xl">
                   <div className="flex items-center gap-4">
                      <div className="p-1 bg-white border-2 border-black rounded-xl">
                        <img src={c.avatar} className="w-12 h-12 rounded-lg" />
                      </div>
                      <div>
                        <p className="font-display font-black uppercase text-sm italic">{c.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${c.status === 'approved' ? 'text-emerald-500' : 'text-slate-400'}`}>{c.status}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => onApprove(c.id, c.status !== 'approved')}
                     className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline"
                   >
                     {c.status === 'approved' ? 'Suspend' : 'Approve'}
                   </button>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'students' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              {allLearners.map((l: any) => (
                <div key={l.id} className="yandasm-card bg-white p-6 border-2 border-black flex items-center justify-between shadow-[4px_4px_0px_0px_#000] rounded-3xl">
                   <div className="flex items-center gap-4">
                      <div className="p-1 bg-white border-2 border-black rounded-xl">
                        <img src={l.avatar} className="w-12 h-12 rounded-lg" />
                      </div>
                      <div>
                        <p className="font-display font-black uppercase text-sm italic">{l.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Grade {l.year} • {l.department || 'General'}</p>
                        <button 
                          onClick={() => setSelectedStudent(l)}
                          className="text-[8px] font-black uppercase text-brand-teal hover:underline mt-1"
                        >
                          View POPIA Details
                        </button>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onDownloadPDF(l)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all active:scale-95"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                        <span className={`text-[8px] font-black uppercase ${l.popiaConsent ? 'text-emerald-500' : 'text-red-400'} tracking-widest`}>
                          {l.popiaConsent ? 'POPIA SECURE' : 'POPIA PENDING'}
                        </span>
                      </div>
                      <Shield size={12} className={l.popiaConsent ? 'text-emerald-500' : 'text-red-400'} />
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* POPIA Student Details Modal */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-2xl yandasm-card bg-white p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-display font-black text-brand-dark uppercase italic tracking-tighter">POPIA Compliance Record</h3>
                    <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Learner Identity</p>
                          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                             <p className="font-bold text-slate-800">{selectedStudent.name}</p>
                             <p className="text-xs font-bold text-slate-400 mt-1">ID/DOB: {selectedStudent.id_or_dob || 'N/A'}</p>
                             <p className="text-xs font-bold text-slate-400">Email: {selectedStudent.email}</p>
                          </div>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Guardian Authorization</p>
                          <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl">
                             <p className="font-bold text-emerald-800">{selectedStudent.guardianName || 'Unknown'}</p>
                             <p className="text-xs font-bold text-emerald-600/60 mt-1">{selectedStudent.guardianRelationship}</p>
                             <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <Phone size={12} /> {selectedStudent.guardianContact}
                             </div>
                             <div className="mt-1 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <Mail size={12} /> {selectedStudent.guardianEmail}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">System Audit Trail</p>
                          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-2">
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="font-black text-slate-400 uppercase">Consent Status</span>
                                <span className="font-black text-emerald-500 uppercase">{selectedStudent.popiaConsent ? 'Active' : 'No'}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="font-black text-slate-400 uppercase">Signing Date</span>
                                <span className="font-black text-slate-600 uppercase">{selectedStudent.popiaDate}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="font-black text-slate-400 uppercase">IP Context</span>
                                <span className="font-black text-slate-600 uppercase">{selectedStudent.popiaLocation}</span>
                             </div>
                          </div>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Guardian Signature</p>
                          <div className="p-4 bg-white border-2 border-black rounded-2xl flex items-center justify-center">
                             {selectedStudent.popiaSignature ? (
                               <img src={selectedStudent.popiaSignature} className="max-h-32 object-contain" alt="Signature" />
                             ) : (
                               <p className="text-xs font-bold text-slate-300 py-10 uppercase italic">No Signature Found</p>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-10 pt-6 border-t-2 border-slate-100 flex justify-end gap-3">
                    <button 
                      onClick={() => onDownloadPDF(selectedStudent)}
                      className="btn-pop-teal py-3 px-8 text-xs flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download Declaration
                    </button>
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="btn-primary py-3 px-10 text-xs"
                    >
                      Close Record
                    </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {activeTab === 'chats' && !selectedChatId && (
          <div className="space-y-4 px-2">
            <h3 className="font-display font-black uppercase text-brand-dark tracking-widest mb-6 px-1">Global Interaction Oversight</h3>
            {chatSessions.length === 0 ? (
              <div className="yandasm-card p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs border-dashed border-2 rounded-[2rem]">No conversations yet</div>
            ) : (
              chatSessions.map((session: any) => (
                <div 
                  key={session.id} 
                  className="yandasm-card bg-white p-6 border-2 border-black hover:bg-slate-50 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_#000] rounded-[2rem]"
                  onClick={() => setSelectedChatId(session.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                      <img src={(session.learner as User)?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Anon'} className="w-12 h-12 rounded-xl border-2 border-black z-10 bg-white" />
                      <img src={(session.counsellor as User)?.avatar} className="w-12 h-12 rounded-xl border-2 border-black z-0 bg-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-black text-brand-dark uppercase text-sm italic">
                          {session.anonymous ? 'Anonymous' : ((session.learner as User)?.name || 'Unknown')}
                        </p>
                        <ArrowRight size={12} className="text-slate-300" />
                        <p className="font-display font-black text-brand-dark uppercase text-sm italic">
                          {(session.counsellor as User)?.name || 'Unknown'}
                        </p>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {session.time} • {session.messageCount} messages
                      </p>
                    </div>
                  </div>
                  <button className="btn-pop py-3 px-6 text-[10px] uppercase font-black border-2 bg-brand-yellow rounded-xl">Review History</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'chats' && selectedChatId && (
          <div className="space-y-6 px-2">
            <div className="flex items-center justify-between bg-white p-6 border-2 border-black rounded-[2rem] mb-8 shadow-[4px_4px_0px_0px_#000]">
              <button 
                onClick={() => setSelectedChatId(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-colors group"
              >
                <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="font-black uppercase text-[10px] tracking-widest">Back Oversight Directory</span>
              </button>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditing Session</p>
                <p className="text-xs font-black text-brand-dark uppercase tracking-tight italic">
                  ID: {selectedBooking?.id}
                </p>
              </div>
            </div>

            <div className="yandasm-card bg-slate-100/30 border-2 border-black p-6 space-y-6 max-h-[600px] overflow-y-auto no-scrollbar rounded-[2rem]">
              {selectedChatMessages.length === 0 ? (
                <div className="text-center py-20 text-slate-300 uppercase font-black text-[10px] tracking-widest border-2 border-dashed border-slate-200 rounded-2xl">
                  Transcript Empty
                </div>
              ) : (
                selectedChatMessages.map((msg: any) => {
                  const sender = users.find((u: any) => u.id === msg.senderId);
                  return (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                       <div className="flex items-center gap-2 mb-2 px-3">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sender?.name || 'System Assistant'}</span>
                          <span className="text-[8px] font-medium text-slate-300">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <div className={`max-w-[85%] p-5 rounded-[2rem] border-2 border-black shadow-[4px_4px_0px_0px_#000] ${msg.role === 'assistant' ? 'bg-white rounded-tl-none' : 'bg-brand-blue text-white rounded-tr-none'}`}>
                          <div className="markdown-body prose prose-sm max-w-none prose-slate">
                            <Markdown>
                              {msg.content}
                            </Markdown>
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
