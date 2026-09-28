import React from 'react';
import { Logo } from './Logo';
import { Database, ShieldCheck, MapPin, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-petroleum-dark text-sand-light border-t border-sand-warm/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <Logo size="md" showSubtitle={true} />
          <p className="text-xs text-sand-warm/80 max-w-md leading-relaxed mt-2">
            WELL-NEX is an engineering Digital Twin prototype engineered for well-to-surface joint optimization
            of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) artificial lift operations in the heavy oil wells
            of Baghewala Field, Bikaner-Nagaur Basin, Rajasthan.
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-sand-warm/60">
            <span className="px-2 py-0.5 rounded bg-petroleum-deep text-sand-warm font-mono border border-sand-warm/20">
              Notice: Demonstration / Synthetic Data
            </span>
            <span>Architecture is ready for SCADA field telemetry integration.</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sand-warm mb-3 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-muted" />
            <span>Baghewala Field Specs</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-sand-warm/75 font-mono">
            <li>Formation: Jodhpur Sandstone</li>
            <li>Crude API: 17° – 19° API</li>
            <li>Native Temp: 46° – 48° C</li>
            <li>Native Viscosity: 4,000+ cP</li>
            <li>Reservoir Pressure: ~95 bar</li>
            <li>Target Depth: ~1,050 m</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sand-warm mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-copper" />
            <span>Coupled Physics Engine</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-sand-warm/75">
            <li>• Arrhenius-Walther Viscosity Model</li>
            <li>• Radial Thermal Soak Equilibration</li>
            <li>• Downstroke Buoyancy vs Drag</li>
            <li>• Rod Floating & Impact Load Alerting</li>
            <li>• Joint Multi-Objective Balanced Window</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-sand-warm/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-sand-warm/60 gap-3">
        <div>
          WELL-NEX — Well-to-Surface Intelligence © 2026. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-teal-muted" /> Rajasthan, India
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sage-green" /> Prototype v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};
