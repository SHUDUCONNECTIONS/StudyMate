
import React, { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  ChevronLeft, AlertCircle, CheckCircle2, Shield, User as UserIcon, ChevronRight
} from 'lucide-react';
import { YandasmLogo } from '../components/YandasmLogo';
import { UserRole } from '../types';

interface PopiaData {
  id_or_dob: string;
  guardianName: string;
  guardianRelationship: string;
  guardianContact: string;
  guardianEmail: string;
  popiaConsent: boolean;
  popiaSignature: string;
  popiaDate: string;
  popiaLocation: string;
}

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<string | null>;
  onRegister: (
    name: string, email: string, pass: string, role: UserRole, 
    specialty: string, department: string, year: number, 
    qualifications: string, gender: string, avatarSeed: string, 
    cvFileName: string, profilePhoto: string, finalPopia?: PopiaData
  ) => Promise<string | null>;
  onBack: () => void;
}

export const AuthPage = ({ onLogin, onRegister, onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const sigCanvas = useRef<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'learner' as UserRole, 
    specialty: '', 
    department: '', 
    year: 1, 
    qualifications: '', 
    gender: 'other' as any,
    avatarSeed: 'Thabo',
    cvFileName: '',
    profilePhoto: ''
  });

  const [popiaData, setPopiaData] = useState<PopiaData>({
    id_or_dob: '',
    guardianName: '',
    guardianRelationship: '',
    guardianContact: '',
    guardianEmail: '',
    popiaConsent: false,
    popiaSignature: '',
    popiaDate: new Date().toISOString().split('T')[0],
    popiaLocation: 'South Africa'
  });

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cvFileName: file.name });
    }
  };

  const AVATAR_SEEDS = [
    'Thabo', 'Lerato', // Black
    'Pieter', 'Sarah', // White
    'Jerome', 'Mandy', // Coloured
    'Ravi', 'Ananya'   // Indian
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4 relative font-sans">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-2xl shadow-[3px_3px_0px_0px_#000] border-2 border-black text-brand-dark hover:bg-slate-50 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest z-50"
      >
        <ChevronLeft size={16} /> <span className="hidden sm:inline">Back</span>
      </button>

      <div className="w-full max-w-md bg-white p-6 md:p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden my-6 md:my-12">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-yellow/10 rounded-full blur-3xl opacity-50" />
        <div className="text-center mb-6 md:mb-8 relative z-10">
          <YandasmLogo className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-display font-black text-brand-dark uppercase tracking-tighter leading-none italic">Yandasm</h1>
          <p className="text-[9px] md:text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mt-3 leading-none italic">Mental Wellness</p>
        </div>

        <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => { setIsLogin(true); setError(null); }} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`}>Sign In</button>
          <button onClick={() => { setIsLogin(false); setError(null); }} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`}>Register</button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold mb-4"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <>
              {!isLogin && (
                <>
                  <div className="flex justify-center gap-3 mb-8 overflow-x-auto no-scrollbar py-4 px-2">
                    {AVATAR_SEEDS.map(seed => (
                      <button 
                        key={seed} 
                        onClick={() => setFormData({...formData, avatarSeed: seed})}
                        className={`shrink-0 w-14 h-14 rounded-2xl border-2 transition-all relative ${
                          formData.avatarSeed === seed 
                            ? 'border-sky-600 scale-110 shadow-xl shadow-sky-600/20 z-10' 
                            : 'border-slate-100 opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} className="w-full h-full rounded-xl" />
                        {formData.avatarSeed === seed && (
                          <div className="absolute -top-2 -right-2 bg-sky-600 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                            <CheckCircle2 size={10} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" placeholder="Full Name" 
                    className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-500 outline-none"
                      value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Neutral</option>
                    </select>
                  </div>
                </>
              )}
              <input 
                type="email" placeholder="Campus Email" 
                className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Password" 
                className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
              {!isLogin && (
                <>
                  <select 
                    className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-400 outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
                  >
                    <option value="learner">Student / Learner</option>
                    <option value="counsellor">Counsellor (Needs Approval)</option>
                    <option value="admin">System Administrator</option>
                  </select>
                  {formData.role === 'counsellor' && (
                    <>
                      <input 
                        type="text" placeholder="Area of Specialty" 
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                        value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}
                      />
                      <textarea 
                        placeholder="Brief Summary of Experience" 
                        className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold focus:border-sky-600 outline-none resize-none no-scrollbar"
                        value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input 
                            type="file" 
                            accept=".pdf" 
                            id="cv-upload" 
                            className="hidden" 
                            onChange={handleCVUpload}
                          />
                          <label 
                            htmlFor="cv-upload" 
                            className={`flex flex-col items-center justify-center gap-2 w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.cvFileName ? 'border-sky-600 bg-sky-50 text-sky-600' : 'border-slate-200 hover:border-sky-400 text-slate-400'}`}
                          >
                            <Shield size={16} />
                            <span className="text-[10px] font-black uppercase text-center px-1">
                              {formData.cvFileName ? formData.cvFileName : 'Upload CV (PDF)'}
                            </span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*" 
                            id="photo-upload" 
                            className="hidden" 
                            onChange={handlePhotoUpload}
                          />
                          <label 
                            htmlFor="photo-upload" 
                            className={`flex flex-col items-center justify-center gap-2 w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.profilePhoto ? 'border-sky-600 bg-sky-50 text-sky-600' : 'border-slate-200 hover:border-sky-400 text-slate-400'}`}
                          >
                            {formData.profilePhoto ? (
                              <img src={formData.profilePhoto} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                            ) : (
                              <UserIcon size={16} />
                            )}
                            <span className="text-[10px] font-black uppercase text-center px-1">
                              {formData.profilePhoto ? 'Photo Uploaded' : 'Personal Photo'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  {formData.role === 'learner' && (
                    <>
                      <input 
                        type="text" placeholder="School" 
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                        value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                      />
                      <select 
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-400 outline-none"
                        value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(y => <option key={y} value={y}>Grade {y}</option>)}
                      </select>
                    </>
                  )}
                </>
              )}
              <button 
                onClick={async () => {
                  setError(null);
                  if (isLogin) {
                    const err = await onLogin(formData.email, formData.password);
                    if (err) setError(err);
                  } else {
                    if (!formData.name || !formData.email || !formData.password) {
                      setError('Please fill in all basic details.');
                      return;
                    }
                    if (formData.role === 'admin') {
                      const err = await onRegister(formData.name, formData.email, formData.password, formData.role, formData.specialty, formData.department, formData.year, formData.qualifications, formData.gender, formData.avatarSeed, formData.cvFileName, formData.profilePhoto);
                      if (err) setError(err);
                    } else {
                      setStep(2);
                    }
                  }
                }}
                className="w-full btn-primary mt-4"
              >
                {isLogin ? 'Enter Workspace' : (formData.role === 'admin' ? 'Create Admin Account' : 'Next: POPIA Consent')}
              </button>
            </>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-6 px-1">
              <div className="flex items-center gap-2 mb-4">
                 <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                 <h3 className="font-display font-black uppercase text-brand-dark tracking-widest text-sm italic">POPIA Consent & Declaration</h3>
              </div>
              
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Identity Verification</p>
              <input 
                type="text" placeholder="ID Number or DOB (YYYY-MM-DD)" 
                className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                value={popiaData.id_or_dob} onChange={e => setPopiaData({...popiaData, id_or_dob: e.target.value})}
              />

              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-6 mb-2 px-1">Parent / Legal Guardian (If Minor) or Self Details</p>
              <div className="space-y-3 p-1">
                <input 
                  type="text" placeholder="Guardian Full Name" 
                  className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                  value={popiaData.guardianName} onChange={e => setPopiaData({...popiaData, guardianName: e.target.value})}
                />
                <select 
                  className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-500 outline-none"
                  value={popiaData.guardianRelationship} onChange={e => setPopiaData({...popiaData, guardianRelationship: e.target.value})}
                >
                  <option value="">Select Relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Legal Guardian">Legal Guardian / Foster</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  type="text" placeholder="Guardian Contact No" 
                  className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                  value={popiaData.guardianContact} onChange={e => setPopiaData({...popiaData, guardianContact: e.target.value})}
                />
                <input 
                  type="email" placeholder="Guardian Email Address" 
                  className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold focus:border-sky-600 outline-none"
                  value={popiaData.guardianEmail} onChange={e => setPopiaData({...popiaData, guardianEmail: e.target.value})}
                />
              </div>

              <div className="bg-brand-lavender/10 p-5 rounded-2xl border-2 border-brand-lavender/20 mt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-3">Declaration of Consent</h4>
                <p className="text-[10px] leading-relaxed text-slate-600 mb-4 italic">
                  I, the undersigned guardian, hereby grant permission for the minor to participate in the YandaStudyMate Counselling & Wellness ecosystem. I understand that personal data will be processed in accordance with POPIA regulations.
                </p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-brand-lavender text-brand-lavender focus:ring-brand-lavender cursor-pointer"
                    checked={popiaData.popiaConsent}
                    onChange={e => setPopiaData({...popiaData, popiaConsent: e.target.checked})}
                  />
                  <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-brand-dark transition-all tracking-widest">I declare consent is checked</span>
                </label>
              </div>

              <div className="mt-6">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Guardian Digital Signature</p>
                <div className="border-2 border-black/10 rounded-2xl bg-white overflow-hidden shadow-inner flex justify-center">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{width: window.innerWidth < 400 ? 300 : 350, height: 180, className: 'sigCanvas h-[180px]'}}
                  />
                </div>
                <button 
                  onClick={() => sigCanvas.current.clear()}
                  className="text-[9px] font-black uppercase text-slate-400 mt-2 hover:text-red-600 transition-all flex items-center gap-1 active:translate-y-0.5"
                >
                  Clear Signature
                </button>
              </div>

              <button 
                onClick={async () => {
                  setError(null);
                  if (!popiaData.popiaConsent) {
                    setError('Please check the consent box.');
                    return;
                  }
                  if (!popiaData.guardianName || !popiaData.guardianContact) {
                    setError('Parent/Guardian name and contact are required.');
                    return;
                  }
                  if (sigCanvas.current.isEmpty()) {
                    setError('Digital signature is required.');
                    return;
                  }

                  const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                  const finalPopia = { ...popiaData, popiaSignature: signature };

                  const err = await onRegister(
                    formData.name, 
                    formData.email, 
                    formData.password, 
                    formData.role, 
                    formData.specialty, 
                    formData.department, 
                    formData.year, 
                    formData.qualifications, 
                    formData.gender, 
                    formData.avatarSeed, 
                    formData.cvFileName, 
                    formData.profilePhoto,
                    finalPopia
                  );
                  if (err) setError(err);
                }}
                className="w-full btn-pop-teal mt-8 py-5 text-sm uppercase font-black"
              >
                Submit & Complete Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
