import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  Gauge,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Layers,
  ArrowRight,
  ChevronRight,
  Compass,
  Thermometer,
  Droplet,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { WellDetail, WellSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface HomePageProps {
  selectedWellId: number;
  wells: WellSummary[];
  onSelectWell: (id: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  selectedWellId,
  wells,
  onSelectWell,
}) => {
  const navigate = useNavigate();
  const [wellDetail, setWellDetail] = useState<WellDetail | null>(null);
  const [loadingWell, setLoadingWell] = useState<boolean>(false);

  useEffect(() => {
    const fetchWellTelemetry = async () => {
      try {
        setLoadingWell(true);
        const data = await api.getWell(selectedWellId);
        setWellDetail(data);
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingWell(false);
      }
    };
    fetchWellTelemetry();
  }, [selectedWellId]);

  return (
    <div className="min-h-screen bg-cream-soft text-petroleum-navy pb-16 space-y-12">
      
      {/* 1. TOP ACTION BAR: WHAT-IF LAB PROMINENT ACTION (TOP-RIGHT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-desert-beige/80 via-white to-sand-light/60 border border-sand-warm shadow-soft-sm">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-petroleum-navy text-sand-warm flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-5 h-5 text-amber-copper" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-bold text-petroleum-navy">
                  WELL-NEX Operational Platform
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand-light text-petroleum-navy font-semibold border border-sand-warm/60">
                  Jodhpur Sandstone • 18° API
                </span>
              </div>
              <p className="text-xs text-petroleum-light">
                Baghewala Heavy Oil Field • Digital Twin Hub
              </p>
            </div>
          </div>

          {/* PROMINENT TOP-RIGHT ACTION: WHAT-IF LAB */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/what-if')}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-amber-copper hover:bg-amber-warm text-cream-soft text-xs font-bold shadow-soft transition-all duration-150 group cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cream-soft group-hover:scale-110 transition-transform" />
              <span>WHAT-IF LAB →</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. HERO SECTION: "FROM RESERVOIR TO SURFACE. INTELLIGENCE AT EVERY STAGE." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-sand-warm/80 p-8 sm:p-10 lg:p-12 shadow-soft-lg overflow-hidden relative">
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#163B4506_1px,transparent_1px),linear-gradient(to_bottom,#163B4506_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column: Heading, Supporting Text, and Primary Action Buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-light border border-sand-warm/70 text-xs font-mono font-bold text-petroleum-navy">
                <span className="w-2 h-2 rounded-full bg-amber-copper animate-pulse" />
                <span>UNIFIED HEAVY OIL DIGITAL TWIN</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-petroleum-navy leading-tight">
                  FROM RESERVOIR TO SURFACE.<br />
                  <span className="text-amber-copper">INTELLIGENCE AT EVERY STAGE.</span>
                </h1>
                <p className="text-sm sm:text-base text-petroleum-light leading-relaxed max-w-xl font-normal pt-1">
                  WELL-NEX connects reservoir behaviour, thermal recovery, artificial lift and production
                  performance through a unified Well-to-Surface Digital Twin.
                </p>
              </div>

              {/* Primary & Secondary Action Buttons (Navigating to real existing pages) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-petroleum-navy hover:bg-petroleum-dark text-sand-warm text-xs font-bold shadow-soft transition-all duration-150 cursor-pointer group"
                >
                  <Activity className="w-4 h-4 text-amber-copper group-hover:scale-110 transition-transform" />
                  <span>Explore Digital Twin</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate(`/optimization/${selectedWellId}`)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-desert-beige/60 border border-sand-warm text-petroleum-navy text-xs font-bold shadow-soft-sm transition-all duration-150 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-teal-muted" />
                  <span>Run Optimization</span>
                </button>
              </div>

              {/* Live Active Well Telemetry Quick Strip */}
              {wellDetail && (
                <div className="pt-4 border-t border-sand-light grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] font-mono text-petroleum-light block">Selected Well</span>
                    <span className="font-bold text-petroleum-navy">{wellDetail.well_name}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] font-mono text-petroleum-light block">Reservoir Temp</span>
                    <span className="font-bold text-amber-copper">{wellDetail.reservoir_temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] font-mono text-petroleum-light block">Production Rate</span>
                    <span className="font-bold text-petroleum-navy">{wellDetail.production_rate.toFixed(1)} bpd</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] font-mono text-petroleum-light block">Viscosity</span>
                    <span className="font-bold text-teal-dark">{wellDetail.oil_viscosity.toFixed(0)} cP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Engineering Visualization (Reservoir → Wellbore → Pump → Surface) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-desert-beige/30 rounded-2xl border border-sand-warm/60 p-5 shadow-soft relative overflow-hidden">
                
                <div className="flex items-center justify-between pb-3 border-b border-sand-warm/40 mb-3">
                  <span className="text-xs font-mono font-bold text-petroleum-navy uppercase">
                    Well-to-Surface Dynamic Schematic
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-petroleum-navy border border-sand-warm/50 font-bold">
                    CONNECTED TWIN
                  </span>
                </div>

                {/* SVG Visualizing: SURFACE ↓ WELLHEAD ↓ SRP/PUMP ↓ ROD STRING ↓ WELLBORE ↓ JODHPUR SANDSTONE */}
                <div className="relative w-full h-[320px] flex items-center justify-center">
                  <svg viewBox="0 0 320 340" className="w-full h-full max-h-[310px]">
                    {/* Surface Line */}
                    <rect x="20" y="40" width="280" height="6" rx="2" fill="#D8C5A3" />
                    <text x="24" y="32" fill="#163B45" fontSize="10" fontWeight="bold">SURFACE</text>
                    <text x="230" y="32" fill="#4F8585" fontSize="9" fontWeight="bold">VFD CONTROL</text>

                    {/* Wellhead Christmas tree */}
                    <rect x="148" y="36" width="24" height="20" fill="#4F8585" rx="2" />
                    <text x="180" y="50" fill="#163B45" fontSize="9" fontWeight="bold">WELLHEAD</text>

                    {/* Walking beam / Horsehead sketch */}
                    <path d="M 80 40 L 105 14 L 130 40 Z" fill="#163B45" opacity="0.85" />
                    <line x1="105" y1="14" x2="160" y2="14" stroke="#163B45" strokeWidth="3" />
                    <path d="M 158 14 C 168 18, 172 26, 170 36" stroke="#163B45" strokeWidth="2.5" fill="none" />
                    <line x1="160" y1="36" x2="160" y2="56" stroke="#B77B45" strokeWidth="2" />

                    {/* Vertical Casing & Wellbore (7" OD) */}
                    <rect x="146" y="56" width="28" height="230" fill="#EFE7DA" stroke="#163B45" strokeWidth="1.5" />
                    <text x="32" y="150" fill="#163B45" fontSize="10" fontWeight="bold">WELLBORE</text>
                    <line x1="90" y1="147" x2="142" y2="147" stroke="#163B45" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Tubing (2-7/8") */}
                    <rect x="152" y="56" width="16" height="220" fill="#FAF9F5" stroke="#4F8585" strokeWidth="1" />

                    {/* Sucker Rod String inside Tubing */}
                    <line x1="160" y1="56" x2="160" y2="240" stroke="#B77B45" strokeWidth="2" strokeDasharray="5 2" />
                    <text x="185" y="115" fill="#B77B45" fontSize="9" fontWeight="bold">ROD STRING</text>
                    <line x1="162" y1="112" x2="182" y2="112" stroke="#B77B45" strokeWidth="1" strokeDasharray="2 2" />

                    {/* SRP Subsurface Pump Plunger */}
                    <rect x="154" y="235" width="12" height="22" fill="#B77B45" rx="1.5" />
                    <circle cx="160" cy="246" r="2.5" fill="#FAF9F5" />
                    <text x="185" y="247" fill="#B77B45" fontSize="10" fontWeight="bold">SRP / PUMP</text>
                    <line x1="168" y1="245" x2="182" y2="245" stroke="#B77B45" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Perforations */}
                    <circle cx="146" cy="270" r="1.5" fill="#163B45" />
                    <circle cx="174" cy="270" r="1.5" fill="#163B45" />
                    <circle cx="146" cy="280" r="1.5" fill="#163B45" />
                    <circle cx="174" cy="280" r="1.5" fill="#163B45" />

                    {/* CSS Thermal Steam Halo (Heated area) */}
                    <ellipse cx="160" cy="285" rx="65" ry="26" fill="#D8C5A3" fillOpacity="0.45" stroke="#B77B45" strokeWidth="1.5" strokeDasharray="3 2" />

                    {/* Jodhpur Sandstone Reservoir Base */}
                    <rect x="20" y="295" width="280" height="35" fill="#D8C5A3" fillOpacity="0.3" stroke="#D8C5A3" />
                    <text x="36" y="316" fill="#163B45" fontSize="10" fontWeight="bold">JODHPUR SANDSTONE RESERVOIR</text>
                  </svg>
                </div>

                <div className="text-center pt-2 border-t border-sand-warm/30 text-[11px] font-mono text-petroleum-navy font-semibold">
                  Reservoir → Wellbore → Pump → Surface
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BAGHEWALA FIELD INFORMATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand-light gap-2 mb-4">
            <div>
              <h2 className="text-lg font-display font-extrabold text-petroleum-navy tracking-tight">
                BAGHEWALA FIELD
              </h2>
              <p className="text-xs font-mono text-amber-copper font-semibold">
                Heavy Oil • Jodhpur Sandstone • Rajasthan
              </p>
            </div>
            <span className="text-[11px] font-mono text-petroleum-light bg-desert-beige/60 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Bikaner-Nagaur Basin Asset
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 17–19° API Heavy Crude */}
            <div className="p-4 rounded-xl bg-desert-beige/50 border border-sand-warm/50">
              <span className="text-xs font-mono font-bold text-petroleum-navy block">
                17–19° API
              </span>
              <span className="text-xs text-petroleum-light font-medium mt-0.5 block">
                Heavy Crude
              </span>
            </div>

            {/* 46–48°C Native Reservoir Temperature */}
            <div className="p-4 rounded-xl bg-desert-beige/50 border border-sand-warm/50">
              <span className="text-xs font-mono font-bold text-petroleum-navy block">
                46–48°C
              </span>
              <span className="text-xs text-petroleum-light font-medium mt-0.5 block">
                Native Reservoir Temperature
              </span>
            </div>

            {/* Jodhpur Sandstone Producing Formation */}
            <div className="p-4 rounded-xl bg-desert-beige/50 border border-sand-warm/50">
              <span className="text-xs font-mono font-bold text-petroleum-navy block">
                Jodhpur Sandstone
              </span>
              <span className="text-xs text-petroleum-light font-medium mt-0.5 block">
                Producing Formation
              </span>
            </div>

            {/* CSS + SRP Integrated Optimization */}
            <div className="p-4 rounded-xl bg-desert-beige/50 border border-sand-warm/50">
              <span className="text-xs font-mono font-bold text-amber-copper block">
                CSS + SRP
              </span>
              <span className="text-xs text-petroleum-light font-medium mt-0.5 block">
                Integrated Optimization
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MAIN ENGINEERING MODULES (6 CARDS WITH CLEAR VISUAL HIERARCHY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h2 className="text-2xl font-display font-extrabold text-petroleum-navy">
            Engineering Modules
          </h2>
          <p className="text-xs text-petroleum-light mt-0.5">
            Core thermal recovery, artificial lift, production surveillance, and joint optimization suites.
          </p>
        </div>

        {/* 6 Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MODULE 1: DIGITAL TWIN (STRONGER VISUAL EMPHASIS) */}
          <div className="bg-white rounded-2xl border-2 border-petroleum-navy/70 p-6 shadow-soft-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-petroleum-navy text-sand-warm flex items-center justify-center shadow-soft">
                  <Activity className="w-6 h-6 text-amber-copper" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
                  CORE ENGINE
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-petroleum-navy group-hover:text-amber-copper transition-colors">
                  Digital Twin
                </h3>
                <p className="text-xs text-petroleum-light leading-relaxed mt-2">
                  Understand the current thermal, mechanical and production state of the selected well.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-desert-beige/50 border border-sand-warm/40 text-[11px] font-mono text-petroleum-navy">
                Schematic • Viscosity • Inflow • Rod Drag
              </div>
            </div>

            <button
              onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-petroleum-navy hover:bg-petroleum-dark text-sand-warm text-xs font-bold shadow-soft transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open Digital Twin →</span>
            </button>
          </div>

          {/* MODULE 2: CSS OPTIMIZER (STRONGER VISUAL EMPHASIS) */}
          <div className="bg-white rounded-2xl border-2 border-amber-copper/70 p-6 shadow-soft-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-copper text-cream-soft flex items-center justify-center shadow-soft">
                  <Flame className="w-6 h-6 text-cream-soft" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-amber-pale text-amber-copper border border-amber-copper/40">
                  THERMAL STIMULATION
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-petroleum-navy group-hover:text-amber-copper transition-colors">
                  CSS Optimizer
                </h3>
                <p className="text-xs text-petroleum-light leading-relaxed mt-2">
                  Optimize steam injection, pressure, duration and soak time for thermal recovery.
                </p>
              </div>

              {/* Small Indicators: Steam, Pressure, Soak */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-petroleum-navy">
                  Steam
                </span>
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-petroleum-navy">
                  Pressure
                </span>
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-teal-dark">
                  Soak
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/css-optimizer/${selectedWellId}`)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-amber-copper hover:bg-amber-warm text-cream-soft text-xs font-bold shadow-soft transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Optimize CSS →</span>
            </button>
          </div>

          {/* MODULE 3: SRP OPTIMIZER (STRONGER VISUAL EMPHASIS) */}
          <div className="bg-white rounded-2xl border-2 border-teal-muted/70 p-6 shadow-soft-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-muted text-cream-soft flex items-center justify-center shadow-soft">
                  <Gauge className="w-6 h-6 text-cream-soft" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-teal-subtle text-teal-dark border border-teal-muted/40">
                  ARTIFICIAL LIFT
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-petroleum-navy group-hover:text-teal-dark transition-colors">
                  SRP Optimizer
                </h3>
                <p className="text-xs text-petroleum-light leading-relaxed mt-2">
                  Optimize SPM, stroke length and VFD operation while controlling mechanical loading.
                </p>
              </div>

              {/* Small Indicators: SPM, Stroke, VFD */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-petroleum-navy">
                  SPM
                </span>
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-petroleum-navy">
                  Stroke
                </span>
                <span className="px-2.5 py-1 rounded-md bg-desert-beige border border-sand-warm/60 font-mono font-semibold text-amber-copper">
                  VFD
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/srp-optimizer/${selectedWellId}`)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-teal-muted hover:bg-teal-dark text-cream-soft text-xs font-bold shadow-soft transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Optimize SRP →</span>
            </button>
          </div>

          {/* MODULE 4: PRODUCTION */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-desert-beige border border-sand-warm flex items-center justify-center text-petroleum-navy">
                <TrendingUp className="w-5 h-5 text-teal-muted" />
              </div>
              <h3 className="text-lg font-display font-bold text-petroleum-navy group-hover:text-teal-dark transition-colors">
                Production
              </h3>
              <p className="text-xs text-petroleum-light leading-relaxed">
                Monitor production trends, SOR, energy consumption and production performance.
              </p>
            </div>

            <button
              onClick={() => navigate(`/production/${selectedWellId}`)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cream-soft hover:bg-desert-beige border border-sand-warm text-petroleum-navy text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Production →</span>
            </button>
          </div>

          {/* MODULE 5: EQUIPMENT HEALTH */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-desert-beige border border-sand-warm flex items-center justify-center text-petroleum-navy">
                <ShieldAlert className="w-5 h-5 text-alert-red" />
              </div>
              <h3 className="text-lg font-display font-bold text-petroleum-navy group-hover:text-alert-red transition-colors">
                Equipment Health
              </h3>
              <p className="text-xs text-petroleum-light leading-relaxed">
                Monitor rod floating, impact loading, pump unsetting and equipment-risk indicators.
              </p>
            </div>

            <button
              onClick={() => navigate(`/equipment/${selectedWellId}`)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cream-soft hover:bg-desert-beige border border-sand-warm text-petroleum-navy text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Equipment →</span>
            </button>
          </div>

          {/* MODULE 6: OPTIMIZATION */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-desert-beige border border-sand-warm flex items-center justify-center text-petroleum-navy">
                <Sliders className="w-5 h-5 text-amber-copper" />
              </div>
              <h3 className="text-lg font-display font-bold text-petroleum-navy group-hover:text-amber-copper transition-colors">
                Optimization
              </h3>
              <p className="text-xs text-petroleum-light leading-relaxed">
                Compare the current operating window with WELL-NEX recommendations.
              </p>
            </div>

            <button
              onClick={() => navigate(`/optimization/${selectedWellId}`)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cream-soft hover:bg-desert-beige border border-sand-warm text-petroleum-navy text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Recommendations →</span>
            </button>
          </div>

        </div>
      </section>

      {/* 5. WELL-TO-SURFACE SECTION: "ONE WELL. ONE CONNECTED INTELLIGENCE LAYER." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-sand-warm/80 p-8 sm:p-10 shadow-soft space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-copper font-bold">
              UNIFIED WELLBORE COUPLING
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-petroleum-navy">
              ONE WELL.<br />ONE CONNECTED INTELLIGENCE LAYER.
            </h2>
            <p className="text-xs text-petroleum-light">
              Connecting physical phenomena across all subsurface and surface operation zones.
            </p>
          </div>

          {/* Connected Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-4">
            
            {/* 1. RESERVOIR */}
            <div className="p-4 rounded-xl bg-desert-beige/40 border border-sand-warm/50 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sand-dark block">01</span>
              <div className="text-sm font-bold text-petroleum-navy">RESERVOIR</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                Temperature<br />Pressure<br />Fluid Properties
              </div>
            </div>

            {/* 2. THERMAL RECOVERY */}
            <div className="p-4 rounded-xl bg-amber-pale/40 border border-amber-copper/30 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-copper block">02</span>
              <div className="text-sm font-bold text-amber-copper">THERMAL RECOVERY</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                Steam<br />Injection<br />Soak
              </div>
            </div>

            {/* 3. WELLBORE */}
            <div className="p-4 rounded-xl bg-desert-beige/40 border border-sand-warm/50 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sand-dark block">03</span>
              <div className="text-sm font-bold text-petroleum-navy">WELLBORE</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                Temperature<br />Pressure<br />Mobility
              </div>
            </div>

            {/* 4. SRP */}
            <div className="p-4 rounded-xl bg-teal-subtle/50 border border-teal-muted/30 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-teal-dark block">04</span>
              <div className="text-sm font-bold text-teal-dark">SRP</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                SPM<br />Stroke<br />VFD
              </div>
            </div>

            {/* 5. EQUIPMENT */}
            <div className="p-4 rounded-xl bg-desert-beige/40 border border-sand-warm/50 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sand-dark block">05</span>
              <div className="text-sm font-bold text-petroleum-navy">EQUIPMENT</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                Rod Load<br />Floating Risk<br />Impact Loading
              </div>
            </div>

            {/* 6. PRODUCTION */}
            <div className="p-4 rounded-xl bg-sage-pale/50 border border-sage-green/40 text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sage-dark block">06</span>
              <div className="text-sm font-bold text-sage-dark">PRODUCTION</div>
              <div className="text-[11px] text-petroleum-light leading-snug">
                Oil Rate<br />SOR<br />Energy Recovery
              </div>
            </div>

          </div>

          <div className="text-center pt-2 text-xs text-petroleum-light font-medium">
            The connecting lines represent continuous bidirectional data and mechanical coupling across the entire wellbore.
          </div>

        </div>
      </section>

      {/* 6. THERMAL -> MECHANICAL CONNECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-petroleum-navy via-petroleum-deep to-petroleum-dark text-sand-light rounded-3xl p-8 sm:p-10 lg:p-12 shadow-soft-lg space-y-8">
          
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-copper font-bold">
              THE CORE WELL-NEX PRINCIPLE
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-sand-warm">
              THERMAL RECOVERY MEETS ARTIFICIAL LIFT
            </h2>
            <p className="text-xs sm:text-sm text-sand-light/80 leading-relaxed pt-1">
              WELL-NEX connects reservoir thermal behaviour with artificial-lift performance and equipment
              reliability, allowing CSS and SRP decisions to be evaluated together.
            </p>
          </div>

          {/* Physical Causality Step Flow Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
            
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-amber-warm block">Temperature ↓</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Post-steam cooling</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-sand-warm block">Viscosity ↑</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Exponential rise</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-sand-warm block">Oil Mobility ↓</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Poor Darcy flow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-amber-warm block">Pump Loading ↑</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Elevated fluid head</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-sand-warm block">Rod Dynamics</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Downstroke drag</span>
            </div>

            <div className="p-3.5 rounded-xl bg-alert-red/20 border border-alert-red/40">
              <span className="text-xs font-mono font-bold text-alert-red block">Equipment Risk ↑</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Rod floating & impact</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
              <span className="text-xs font-mono font-bold text-sage-light block">Efficiency Shift</span>
              <span className="text-[10px] text-sand-light/70 mt-1 block">Lifting economics</span>
            </div>

          </div>

          <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-light/75 gap-3">
            <span>
              Baghewala Field Jodhpur Sandstone • 17–19° API • Cyclic Steam & Sucker Rod Pump Coupling
            </span>
            <button
              onClick={() => navigate(`/digital-twin/${selectedWellId}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-copper hover:text-amber-warm transition-colors"
            >
              <span>Examine in Digital Twin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
