import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Animation phase states corresponding to 0.0s - 2.5s sequence
  // 0.0 - 0.5s: Wellbore visualization appears
  // 0.4 - 1.1s: WELL-NEX logo fades in
  // 0.8 - 1.5s: "Well-to-Surface Intelligence" fades in
  // 1.2 - 1.8s: "Reservoir → Wellbore → Pump → Surface" appears
  // 1.7 - 2.5s: Entire splash smoothly fades out into Login
  const [phase, setPhase] = useState<'wellbore' | 'logo' | 'subtitle' | 'nodes' | 'fadeout'>('wellbore');

  useEffect(() => {
    // 0.4s: Logo fades in
    const timer1 = setTimeout(() => {
      setPhase('logo');
    }, 450);

    // 0.8s: Subtitle fades in
    const timer2 = setTimeout(() => {
      setPhase('subtitle');
    }, 850);

    // 1.2s: Reservoir -> Wellbore -> Pump -> Surface flow appears
    const timer3 = setTimeout(() => {
      setPhase('nodes');
    }, 1250);

    // 1.8s: Entire splash screen smoothly fades out
    const timer4 = setTimeout(() => {
      setPhase('fadeout');
    }, 1800);

    // 2.4s: Complete transition to Login Page
    const timer5 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  const isWellboreVisible = true;
  const isLogoVisible = phase !== 'wellbore';
  const isSubtitleVisible = phase === 'subtitle' || phase === 'nodes' || phase === 'fadeout';
  const isNodesActive = phase === 'nodes' || phase === 'fadeout';
  const isFadingOut = phase === 'fadeout';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-soft text-petroleum-navy transition-opacity duration-600 ease-in-out select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Petroleum Desert Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#163B450a_1px,transparent_1px),linear-gradient(to_bottom,#163B450a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* TOP-RIGHT Dedicated "Skip Intro" Button (Fixed position, NEVER overlaps text or logo) */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-petroleum-navy text-xs font-mono font-medium border border-sand-warm/70 shadow-soft-sm hover:shadow-soft transition-all duration-150 cursor-pointer"
        aria-label="Skip Introduction"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-copper" />
      </button>

      {/* Center Container: Minimal Wellbore Animation + Logo */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4 max-w-lg mx-auto text-center">
        
        {/* Subtle Wellbore Connection Schematic */}
        <div className="relative w-44 h-48 flex items-center justify-center mb-5">
          <svg viewBox="0 0 160 190" fill="none" className="w-full h-full">
            {/* Surface Line (Top) */}
            <line
              x1="30"
              y1="25"
              x2="130"
              y2="25"
              stroke="#D8C5A3"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`transition-opacity duration-700 ${
                isWellboreVisible ? 'opacity-90' : 'opacity-0'
              }`}
            />
            {/* Surface Wellhead Node */}
            <circle
              cx="80"
              cy="25"
              r="4.5"
              fill="#163B45"
              stroke="#FAF9F5"
              strokeWidth="2"
              className={`transition-all duration-500 ${
                isNodesActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(22,59,69,0.3)]' : 'scale-100 opacity-60'
              }`}
            />

            {/* Vertical Wellbore Line - Draws from bottom reservoir upward */}
            <line
              x1="80"
              y1="165"
              x2="80"
              y2="25"
              stroke="#4F8585"
              strokeWidth="2.5"
              strokeDasharray="140"
              strokeDashoffset={isWellboreVisible ? '0' : '140'}
              className="transition-all duration-1000 ease-out"
            />

            {/* Casing boundary guides */}
            <line
              x1="73"
              y1="38"
              x2="73"
              y2="152"
              stroke="#D8C5A3"
              strokeWidth="1"
              strokeDasharray="3 3"
              className={`transition-opacity duration-700 ${
                isLogoVisible ? 'opacity-70' : 'opacity-0'
              }`}
            />
            <line
              x1="87"
              y1="38"
              x2="87"
              y2="152"
              stroke="#D8C5A3"
              strokeWidth="1"
              strokeDasharray="3 3"
              className={`transition-opacity duration-700 ${
                isLogoVisible ? 'opacity-70' : 'opacity-0'
              }`}
            />

            {/* SRP Pump Node (Middle - ~1050 m depth) */}
            <g
              className={`transition-all duration-500 ${
                isNodesActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <rect x="74" y="75" width="12" height="18" rx="2" fill="#B77B45" />
              <circle
                cx="80"
                cy="84"
                r="3"
                fill="#FAF9F5"
                className={isNodesActive ? 'animate-pulse' : ''}
              />
            </g>

            {/* CSS Thermal Halo Node (Lower zone) */}
            <ellipse
              cx="80"
              cy="125"
              rx="18"
              ry="7"
              fill="none"
              stroke="#B77B45"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              className={`transition-all duration-700 ${
                isNodesActive ? 'opacity-85 scale-105' : 'opacity-0 scale-90'
              }`}
            />
            <circle
              cx="80"
              cy="125"
              r="3.5"
              fill="#789681"
              stroke="#FAF9F5"
              strokeWidth="1.5"
              className={`transition-all duration-500 ${
                isNodesActive ? 'opacity-100' : 'opacity-30'
              }`}
            />

            {/* Reservoir Base Formation (Jodhpur Sandstone) */}
            <path
              d="M 40 165 Q 80 158 120 165"
              stroke="#D8C5A3"
              strokeWidth="3"
              strokeLinecap="round"
              className={`transition-opacity duration-700 ${
                isWellboreVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <circle
              cx="80"
              cy="165"
              r="5"
              fill="#D8C5A3"
              stroke="#FAF9F5"
              strokeWidth="2"
              className={`transition-transform duration-500 ${
                isNodesActive ? 'scale-110' : 'scale-90 opacity-70'
              }`}
            />

            {/* Ascending Fluid Flow Energy Pulse: Reservoir -> Wellbore -> Pump -> Surface */}
            {isNodesActive && (
              <circle cx="80" cy="165" r="3" fill="#B77B45">
                <animate
                  attributeName="cy"
                  from="165"
                  to="25"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;1;1;0.2"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
        </div>

        {/* Brand Name: WELL-NEX (fades in and translates up) */}
        <div
          className={`flex items-center justify-center gap-2.5 transition-all duration-700 ease-out transform ${
            isLogoVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-petroleum-navy flex items-center justify-center p-1.5 shadow-soft text-sand-warm">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <line x1="8" y1="8" x2="32" y2="8" stroke="#D8C5A3" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="8" x2="20" y2="34" stroke="#4F8585" strokeWidth="2" />
              <circle cx="20" cy="18" r="2.5" fill="#B77B45" stroke="#FAF9F5" strokeWidth="1" />
              <circle cx="20" cy="28" r="2" fill="#789681" />
              <path d="M12 34 Q 20 31 28 34" stroke="#D8C5A3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-petroleum-navy">
            WELL<span className="text-amber-copper">-</span>NEX
          </h1>
        </div>

        {/* Subtitle: "Well-to-Surface Intelligence" */}
        <p
          className={`mt-2 font-display text-sm sm:text-base font-medium tracking-wide text-petroleum-light transition-all duration-700 ease-out transform ${
            isSubtitleVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          Well-to-Surface Intelligence
        </p>

        {/* Minimal sequence flow indicators: Reservoir → Wellbore → Pump → Surface */}
        <div
          className={`mt-5 inline-flex items-center gap-2 text-[11px] font-mono tracking-wider font-semibold text-petroleum-light transition-all duration-500 ${
            isNodesActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="text-amber-copper">Reservoir</span>
          <span className="text-sand-dark">→</span>
          <span className="text-teal-muted">Wellbore</span>
          <span className="text-sand-dark">→</span>
          <span className="text-sage-green">Pump</span>
          <span className="text-sand-dark">→</span>
          <span className="text-petroleum-navy font-bold">Surface</span>
        </div>
      </div>
    </div>
  );
};
