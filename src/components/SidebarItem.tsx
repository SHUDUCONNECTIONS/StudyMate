
import React from 'react';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, activeColor = "bg-brand-blue" }: SidebarItemProps) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${
        active 
          ? `${activeColor} text-white border-2 border-black shadow-[4px_4px_0px_0px_#000] scale-[1.02] z-10` 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} strokeWidth={active ? 3 : 2} />
      <span className={`text-xs font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </button>
  );
};
