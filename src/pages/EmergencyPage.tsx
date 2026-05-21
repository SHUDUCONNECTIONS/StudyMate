
import React from 'react';
import { PhoneCall } from 'lucide-react';

export const EmergencyPage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center pt-8 md:pt-12 flex flex-col items-center px-4">
      <div className="w-36 h-36 md:w-52 md:h-52 bg-white border-4 border-black rounded-[2.5rem] md:rounded-[4rem] text-red-600 flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]">
        <PhoneCall className="w-16 h-16 md:w-24 md:h-24 animate-pulse" />
      </div>
      <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-2 md:mb-4 tracking-tighter uppercase italic">Emergency Support</h1>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-6 md:mb-10 opacity-70">Official South African Helplines</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
        <button
          onClick={() => window.location.href = 'tel:112'}
          className="btn-pop bg-red-600 text-white hover:bg-red-700 text-lg md:text-xl px-10 py-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col items-center justify-center gap-1"
        >
          <span className="text-xs uppercase font-black tracking-widest opacity-80">Universal Mobile</span>
          <span>Emergency Call (112)</span>
        </button>

        <button
          onClick={() => window.location.href = 'tel:0800567567'}
          className="btn-pop bg-brand-pink text-white hover:bg-[#e0457b] text-lg md:text-xl px-10 py-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col items-center justify-center gap-1"
        >
          <span className="text-xs uppercase font-black tracking-widest opacity-80">Suicide Crisis</span>
          <span>0800 567 567</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full text-left">
        <div className="yandasm-pop-card bg-brand-yellow p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-black/60">Ambulance</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">10177</p>
        </div>
        <div className="yandasm-pop-card bg-brand-teal p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-black/60">SAPS Police</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">10111</p>
        </div>
        <div className="yandasm-pop-card bg-brand-lavender p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-black/60">SADAG (Mental Health)</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">0800 456 789</p>
        </div>
        <div className="yandasm-pop-card bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-slate-400">LifeLine SA</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">0861 322 322</p>
        </div>
        <div className="yandasm-pop-card bg-brand-blue p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-black/60">Childline</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">116</p>
        </div>
        <div className="yandasm-pop-card bg-brand-orange p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-black/60">GBV Command Centre</h4>
          <p className="text-xl md:text-2xl font-display font-black text-black">0800 428 428</p>
        </div>
      </div>
    </div>
  );
};
