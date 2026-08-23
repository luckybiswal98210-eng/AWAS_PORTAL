import React from 'react';

export const AWASLogo = ({ size = 'medium', className = '' }) => {
  const sizeMap = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/awas-logo.png"
        alt="AWAS INDIA Logo"
        className={`${currentSize} object-contain rounded-full shadow-sm bg-white p-0.5 border border-slate-100 hover:scale-105 transition-transform`}
      />
    </div>
  );
};
