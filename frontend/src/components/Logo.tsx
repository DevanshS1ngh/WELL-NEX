import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${iconSizes[size]} rounded-lg bg-petroleum-navy flex items-center justify-center p-1 shadow-soft text-sand-warm`}>
        {/* Custom Stylized Wellbore & Multi-Node Flow SVG */}
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          {/* Surface boundary */}
          <line x1="8" y1="8" x2="32" y2="8" stroke="#D8C5A3" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="20" cy="8" r="2.2" fill="#FAF9F5" stroke="#B77B45" strokeWidth="1.2" />
          
          {/* Vertical Wellbore */}
          <line x1="20" y1="8" x2="20" y2="34" stroke="#4F8585" strokeWidth="1.8" />
          <line x1="16" y1="12" x2="16" y2="32" stroke="#25505C" strokeWidth="1" strokeDasharray="2 1" />
          <line x1="24" y1="12" x2="24" y2="32" stroke="#25505C" strokeWidth="1" strokeDasharray="2 1" />

          {/* SRP Plunger Node */}
          <circle cx="20" cy="18" r="2.2" fill="#B77B45" stroke="#FAF9F5" strokeWidth="0.8" />

          {/* CSS Thermal Halo Node */}
          <ellipse cx="20" cy="27" rx="5" ry="2" stroke="#D8C5A3" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <circle cx="20" cy="27" r="1.8" fill="#789681" />

          {/* Reservoir Base */}
          <path d="M12 34 Q 20 31 28 34" stroke="#D8C5A3" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="34" r="2.2" fill="#D8C5A3" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-bold tracking-tight text-petroleum-navy ${titleSizes[size]}`}>
            WELL<span className="text-amber-copper">-</span>NEX
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sand-light text-petroleum-deep font-semibold">
            TWIN
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-sans tracking-wide text-petroleum-light font-medium ${subSizes[size]}`}>
            Well-to-Surface Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
