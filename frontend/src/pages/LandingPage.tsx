import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  Gauge,
  ArrowRight,
  ShieldAlert,
  Cpu,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { DataPipelineFlow } from '../components/DataPipelineFlow';

interface LandingPageProps {
  selectedWellId: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ selectedWellId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-soft text-petroleum-navy">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-desert-beige/80 via-cream-soft to-cream-soft pt-12 pb-20 border-b border-sand-warm/40">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#163B4508_1px,transparent_1px),linear-gradient(to_bottom,#163B4508_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, Value Proposition, Action CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-light border border-sand-warm text-xs font-semibold text-petroleum-navy shadow-soft-sm">
                <span className="w-2 h-2 rounded-full bg-amber-copper animate-pulse" />
                <span>Baghewala Field Heavy Oil Prototype • Jodhpur Sandstone</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-petroleum-navy leading-none">
                  WELL<span className="text-amber-copper">-</span>NEX
                </h1>
                <p className="text-xl sm:text-2xl font-display font-medium text-amber-copper tracking-tight">
                  Well-to-Surface Intelligence
                </p>
              </div>

              <p className="text-base sm:text-lg text-petroleum-light leading-relaxed font-normal">
                An integrated engineering Digital Twin for optimizing thermal recovery, artificial lift, and production
                performance in heavy-oil wells. Bridging the critical operational gap between 
                <strong className="text-petroleum-navy font-semibold"> Cyclic Steam Stimulation (CSS)</strong> and 
                <strong className="text-petroleum-navy font-semibold"> Sucker Rod Pump (SRP)</strong> dynamics.
              </p>

              {/* Call to action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-petroleum-navy text-sand-warm font-semibold text-sm shadow-soft-lg hover:bg-petroleum-dark hover:shadow-xl transition-all duration-200 group"
                >
                  <Activity className="w-4 h-4 text-amber-copper group-hover:scale-110 transition-transform" />
                  <span>Enter Digital Twin</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-sand-warm text-petroleum-navy font-semibold text-sm shadow-soft-sm hover:bg-sand-light/60 transition-colors"
                >
                  <span>Explore Demo Overview</span>
                </button>

                <button
                  onClick={() => navigate('/field-map')}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl text-petroleum-light hover:text-petroleum-navy text-xs font-semibold"
                >
                  <MapPin className="w-4 h-4 text-teal-muted" />
                  <span>Field Map (15 Wells)</span>
                </button>
              </div>

              {/* High-level problem summary pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-sand-warm/40">
                <div className="p-2.5 rounded-lg bg-white/80 border border-sand-warm/30 shadow-2xs">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase">Crude Gravity</span>
                  <div className="text-sm font-bold text-petroleum-navy">17° – 19° API</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 border border-sand-warm/30 shadow-2xs">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase">Native Temp</span>
                  <div className="text-sm font-bold text-petroleum-navy">46° – 48° C</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 border border-sand-warm/30 shadow-2xs">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase">Native Visc</span>
                  <div className="text-sm font-bold text-petroleum-navy">4,000+ cP</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 border border-sand-warm/30 shadow-2xs">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase">Synthetic Base</span>
                  <div className="text-sm font-bold text-amber-copper">15 Wells Modelled</div>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Well Cross-Section Interactive Teaser */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border-2 border-sand-warm/80 p-5 shadow-soft-lg relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-sand-light mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage-green animate-pulse" />
                    <span className="text-xs font-mono font-bold text-petroleum-navy">WELLBORE DIGITAL TWIN</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand-light text-petroleum-deep font-semibold">
                    PHYSICS SCHEMA
                  </span>
                </div>

                {/* Animated Cross Section SVG Graphic */}
                <div className="relative w-full h-[380px] bg-desert-beige/40 rounded-xl border border-sand-warm/40 p-2 flex items-center justify-center">
                  <svg viewBox="0 0 300 420" className="w-full h-full max-h-[370px]">
                    {/* Surface Ground Line */}
                    <rect x="10" y="45" width="280" height="8" rx="2" fill="#D8C5A3" />
                    <text x="18" y="38" fill="#163B45" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SURFACE FACILITY</text>
                    <text x="210" y="38" fill="#B77B45" fontSize="9" fontWeight="bold" fontFamily="monospace">VFD CONTROLLER</text>

                    {/* Surface Pumping Unit (Walking Beam Schematic) */}
                    <path d="M 50 45 L 85 10 L 120 45 Z" fill="#163B45" opacity="0.8" />
                    <line x1="85" y1="10" x2="160" y2="10" stroke="#163B45" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 155 10 C 168 15, 172 25, 170 38" stroke="#163B45" strokeWidth="3" fill="none" />
                    {/* Polished Rod Clamp & Wireline */}
                    <line x1="170" y1="38" x2="170" y2="70" stroke="#B77B45" strokeWidth="2.5" />
                    <rect x="164" y="55" width="12" height="6" rx="1" fill="#B77B45" />

                    {/* Wellhead Christmas tree */}
                    <rect x="158" y="45" width="24" height="25" fill="#4F8585" rx="2" />
                    {/* Flowline to tank */}
                    <path d="M 182 58 L 270 58" stroke="#4F8585" strokeWidth="3" fill="none" />
                    <circle cx="270" cy="58" r="4" fill="#789681" />
                    <text x="220" y="52" fill="#789681" fontSize="9" fontWeight="bold">TO FLOWLINE</text>

                    {/* Casing String (Vertical Depth) */}
                    <rect x="156" y="70" width="28" height="280" fill="#EFE7DA" stroke="#163B45" strokeWidth="1.5" />
                    
                    {/* Tubing String inside Casing */}
                    <rect x="162" y="70" width="16" height="270" fill="#FAF9F5" stroke="#4F8585" strokeWidth="1" />

                    {/* Sucker Rod String inside Tubing (Animated stroke) */}
                    <line x1="170" y1="70" x2="170" y2="300" stroke="#B77B45" strokeWidth="2" strokeDasharray="6 2" />

                    {/* Downhole SRP Pump Plunger */}
                    <rect x="164" y="295" width="12" height="24" fill="#B77B45" rx="1" />
                    <circle cx="170" cy="307" r="3" fill="#FAF9F5" />
                    <line x1="164" y1="319" x2="176" y2="319" stroke="#163B45" strokeWidth="2" />
                    <text x="40" y="308" fill="#B77B45" fontSize="10" fontWeight="bold">SRP PLUNGER (1050 m)</text>
                    <line x1="150" y1="305" x2="162" y2="305" stroke="#B77B45" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Thermal Steam Injection Zone (CSS Halo) */}
                    <ellipse cx="170" cy="355" rx="75" ry="32" fill="#D8C5A3" fillOpacity="0.45" stroke="#B77B45" strokeWidth="1.5" strokeDasharray="4 3" />
                    <text x="35" y="360" fill="#B77B45" fontSize="10" fontWeight="bold">CSS THERMAL HALO (180°C)</text>

                    {/* Perforations */}
                    <circle cx="156" cy="335" r="1.5" fill="#163B45" />
                    <circle cx="184" cy="335" r="1.5" fill="#163B45" />
                    <circle cx="156" cy="345" r="1.5" fill="#163B45" />
                    <circle cx="184" cy="345" r="1.5" fill="#163B45" />
                    <circle cx="156" cy="355" r="1.5" fill="#163B45" />
                    <circle cx="184" cy="355" r="1.5" fill="#163B45" />

                    {/* Reservoir Formation Base */}
                    <rect x="10" y="380" width="280" height="30" fill="#D8C5A3" fillOpacity="0.3" stroke="#D8C5A3" />
                    <text x="50" y="400" fill="#163B45" fontSize="10" fontWeight="bold">JODHPUR SANDSTONE RESERVOIR (HEAVY OIL 18° API)</text>
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-petroleum-light bg-cream-soft p-2.5 rounded-lg border border-sand-light">
                  <span className="font-semibold text-petroleum-navy">Coupled Feedback Loop:</span>
                  <span className="font-mono text-amber-copper font-semibold">T↓ → μ↑ → Drag↑ → SPM Reduction Required</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Core Engineering Challenge Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-copper bg-amber-pale px-3 py-1 rounded-full border border-amber-copper/30">
            Real-World Problem Formulation
          </span>
          <h2 className="text-3xl font-display font-bold text-petroleum-navy mt-3">
            Why CSS and SRP Must NOT Be Optimized Independently
          </h2>
          <p className="text-sm sm:text-base text-petroleum-light mt-2 leading-relaxed">
            In heavy oil fields like Baghewala, thermal stimulation (CSS) and artificial lift (SRP) are traditionally
            managed by separate engineering silos. As near-wellbore heat dissipates, severe operational hazards emerge.
          </p>
        </div>

        {/* Chain of Causality Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-center">
          <div className="bg-white p-4 rounded-xl border border-sand-warm/70 shadow-soft-sm text-center">
            <div className="text-xs font-mono font-bold text-amber-copper mb-1">STAGE 1</div>
            <div className="text-sm font-bold text-petroleum-navy">Steam Cooled</div>
            <div className="text-xs text-petroleum-light mt-1">Temp drops from 180°C towards 48°C</div>
          </div>

          <div className="hidden md:flex justify-center text-sand-dark">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-sand-warm/70 shadow-soft-sm text-center">
            <div className="text-xs font-mono font-bold text-amber-copper mb-1">STAGE 2</div>
            <div className="text-sm font-bold text-petroleum-navy">Viscosity Surges</div>
            <div className="text-xs text-petroleum-light mt-1">Crude viscosity jumps 30 cP → 4,500 cP</div>
          </div>

          <div className="hidden md:flex justify-center text-sand-dark">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-alert-red/30 bg-alert-pale/30 shadow-soft-sm text-center">
            <div className="text-xs font-mono font-bold text-alert-red mb-1">STAGE 3</div>
            <div className="text-sm font-bold text-alert-dark">Rod Floating</div>
            <div className="text-xs text-petroleum-light mt-1">Downstroke viscous drag exceeds rod weight</div>
          </div>

          <div className="hidden md:flex justify-center text-sand-dark">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-alert-red/40 bg-alert-pale/60 shadow-soft-sm text-center">
            <div className="text-xs font-mono font-bold text-alert-red mb-1">STAGE 4</div>
            <div className="text-sm font-bold text-alert-dark">Impact & Failure</div>
            <div className="text-xs text-petroleum-light mt-1">Reversal impact smash, buckling, energy surge</div>
          </div>
        </div>
      </section>

      {/* Interactive Data Pipeline Flow Section */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DataPipelineFlow />
      </section>

      {/* Features Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-sand-warm/30">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-petroleum-navy">
            Core Modules of WELL-NEX
          </h2>
          <p className="text-xs sm:text-sm text-petroleum-light mt-1">
            Engineered from first principles with full backend REST API integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-petroleum-navy text-sand-warm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>Interactive Digital Twin</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              Full-depth schematic from surface walking beam down to Jodhpur Sandstone. Real-time physics nodes,
              downstroke viscous drag calculation, and synthetic dynamometer cards.
            </p>
          </div>

          <div
            onClick={() => navigate(`/css-optimizer/${selectedWellId}`)}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-copper text-cream-soft flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>CSS Thermal Simulator</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              Simulate steam injection volumes, pressure, and soak times. Predict near-wellbore temperature profiles,
              oil mobility boost, cumulative production, and Steam-Oil Ratio (SOR).
            </p>
          </div>

          <div
            onClick={() => navigate(`/srp-optimizer/${selectedWellId}`)}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-muted text-cream-soft flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>SRP Artificial Lift Simulator</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              Tuning stroke length, SPM, and VFD frequency against changing oil viscosity. Direct calculation
              of downstroke rod floating risk, bottom-reversal impact load, and lifting power.
            </p>
          </div>

          <div
            onClick={() => navigate(`/optimization/${selectedWellId}`)}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-sage-green text-cream-soft flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>Explainable Joint Optimizer</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              Multi-objective balanced window finding the optimal trade-off between oil recovery, steam cost,
              electrical energy, and equipment fatigue. Features plain-English "Why?" engineering explanations.
            </p>
          </div>

          <div
            onClick={() => navigate('/what-if')}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-petroleum-light text-sand-light flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>What-If Scenario Lab</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              "What happens if...?" sandbox allowing engineers to manipulate both steam slug size and SRP speed
              simultaneously, observing instant before/after performance comparisons.
            </p>
          </div>

          <div
            onClick={() => navigate('/field-map')}
            className="bg-white rounded-xl p-6 border border-sand-warm/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-sand-dark text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-2 flex items-center justify-between">
              <span>Baghewala Field Map</span>
              <ChevronRight className="w-4 h-4 text-petroleum-light group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-petroleum-light leading-relaxed">
              Geospatial Leaflet visualization of 15 synthetic demonstration wells in Rajasthan. Color-coded health
              indicators with quick telemetry popups linking directly to well twins.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-petroleum-navy text-sand-warm">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-sand-warm">
            Ready to Explore the Baghewala Well-to-Surface Twin?
          </h2>
          <p className="text-xs sm:text-sm text-sand-warm/80 max-w-xl mx-auto">
            Experience end-to-end telemetry, live simulations, and explainable optimization driven by FastAPI and SQLite.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-copper text-cream-soft font-semibold text-sm shadow-soft hover:bg-amber-warm transition-colors"
            >
              <span>Launch Well Twin Interface</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
