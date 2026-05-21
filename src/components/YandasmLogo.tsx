
import React from 'react';
import yandasmLogo from '../assets/images/Yandasm Normal color.png';

export const YandasmLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img src={yandasmLogo} alt="Yandasm" className={`${className} object-contain`} />
);
