
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Download, X, Phone, Mail, UserPlus, Check, Flag, Bell
} from 'lucide-react';
import { User, Booking, Notification } from '../types';

interface AdminPageProps {
  users: User[];
  onApprove: (userId: string, approved: boolean) => void;
  onAddCounsellor: (name: string, email: string, password: string, specialty: string) => Promise<string | null>;
  bookings: Booking[];
  notifications: Notification[];
  onDownloadPDF: (user: User) => void;
}

export const AdminPage = ({ users, onApprove, onAddCounsellor, bookings, notifications, onDownloadPDF }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'students' | 'reports'>('pending');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', specialty: '' });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.password || !addForm.specialty) {
      setAddError('All fields are required.');
      return;
    }
    if (addForm.password.length < 8 || !/[A-Z]/.test(addForm.password) || !/[0-9]/.test(addForm.password)) {
      setAddError('Password must be at least 8 characters with one uppercase letter and one number.');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    const err = await onAddCounsellor(addForm.name, addForm.email, addForm.password, addForm.specialty);
    setAddLoading(false);
    if (err) { setAddError(err); return; }
    setAddSuccess(true);
    setTimeout(() => {
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', specialty: '' });
      setAddSuccess(false);
    }, 1200);
  };
  
  const pending = users.filter((u: any) => u.role === 'counsellor' && u.status === 'pending');
  const allCounsellors = users.filter((u: any) => u.role === 'counsellor');
  const allLearners = users.filter((u: any) => u.role === 'learner');
  const reports = useMemo(() =>
    (notifications || [])
      .filter(n => n.type === 'report')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [notifications]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 border-2 border-brand-blue rounded-xl text-brand-blue">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-black text-brand-dark uppercase tracking-tighter italic">Admin Oversight</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-pop-teal py-3 px-6 text-[11px] flex items-center gap-2 shrink-0"
        >
          <UserPlus size={16} /> Add Counsellor
        </button>
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          {['pending', 'all', 'students', 'reports'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'}`}
            >
              {tab === 'pending' ? `Pending (${pending.length})` :
               tab === 'all' ? `Counsellors (${allCounsellors.length})` :
               tab === 'students' ? `Students (${allLearners.length})` :
               `Reports (${reports.length})`}
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
            <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
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
                             {(selectedStudent as any).isForeign && (
                               <p className="text-xs font-bold text-sky-500 mt-1">Passport: {(selectedStudent as any).passportNo || 'N/A'}</p>
                             )}
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
                             {(selectedStudent as any).isForeign && (selectedStudent as any).guardianPassportNo && (
                               <p className="text-xs font-bold text-sky-500 mt-2">Passport: {(selectedStudent as any).guardianPassportNo}</p>
                             )}
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

        {activeTab === 'reports' && (
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="p-2 bg-red-100 rounded-xl text-red-500"><Flag size={16} /></div>
              <h3 className="font-display font-black uppercase text-brand-dark tracking-widest">Learner Reports</h3>
            </div>
            {reports.length === 0 ? (
              <div className="yandasm-card p-20 text-center border-dashed border-2 rounded-[2rem] flex flex-col items-center gap-4">
                <Bell size={32} className="text-slate-200" />
                <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">No reports filed</p>
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id} className="yandasm-card bg-white p-6 border-2 border-red-200 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)] rounded-[2rem] flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-xl text-red-500 shrink-0 mt-1"><Flag size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-brand-dark uppercase text-sm italic">{r.title}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">{r.message}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-3">
                      {new Date(r.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[8px] font-black uppercase px-3 py-1 rounded-full border ${r.read ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-red-50 text-red-500 border-red-200'}`}>
                    {r.read ? 'Read' : 'New'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Counsellor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-md yandasm-card bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-display font-black text-brand-dark uppercase italic tracking-tighter">Add Counsellor</h3>
                  <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mt-1">Pre-approved · Active immediately</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Dr. Lerato Mokoena' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'counsellor@school.ac.za' },
                  { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 chars, 1 uppercase, 1 number' },
                  { label: 'Specialty', key: 'specialty', type: 'text', placeholder: 'e.g. Academic Stress, Trauma' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                    <input
                      type={type}
                      value={addForm[key as keyof typeof addForm]}
                      onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-teal transition-colors font-bold text-sm"
                    />
                  </div>
                ))}

                {addError && (
                  <p className="text-[11px] font-black text-red-500 uppercase tracking-widest bg-red-50 p-3 rounded-xl border border-red-100">{addError}</p>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={addLoading || addSuccess}
                className="w-full btn-pop-teal py-4 mt-8 text-[11px] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {addSuccess ? <><Check size={16} /> Counsellor Added!</> : addLoading ? 'Creating Account…' : <><UserPlus size={16} /> Create & Pre-Approve</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
