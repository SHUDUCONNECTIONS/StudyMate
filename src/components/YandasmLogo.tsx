
import React from 'react';

export const YandasmLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 240 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g strokeWidth="26" strokeLinecap="round">
      {/* Blue Section */}
      <path d="M40 110V50C40 33.4315 53.4315 20 70 20" stroke="#5B89BD" />
      {/* Teal Section */}
      <path d="M70 20C86.5685 20 100 33.4315 100 50V90C100 106.569 113.431 120 130 120C146.569 120 160 106.569 160 90V50C160 33.4315 173.431 20 190 20" stroke="#2FB3A6" />
      {/* Orange Section */}
      <path d="M190 20C206.569 20 220 33.4315 220 50V110" stroke="#E98150" />
    </g>
  </svg>
);
