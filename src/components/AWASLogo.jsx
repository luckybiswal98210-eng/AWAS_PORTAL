import React from 'react';

export const AWASLogo = ({ size = 'medium', className = '', style = {} }) => {
  const pixelMap = {
    small: { width: '40px', height: '40px' },
    medium: { width: '64px', height: '64px' },
    large: { width: '80px', height: '80px' },
    xlarge: { width: '96px', height: '96px' }
  };

  const dim = pixelMap[size] || pixelMap.medium;

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      <img
        src="/awas-logo.png"
        alt="AWAS INDIA Logo"
        style={{
          width: dim.width,
          height: dim.height,
          minWidth: dim.width,
          minHeight: dim.height,
          maxWidth: dim.width,
          maxHeight: dim.height,
          objectFit: 'contain',
          borderRadius: '9999px',
          display: 'block'
        }}
      />
    </div>
  );
};
