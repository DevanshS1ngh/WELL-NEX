import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  Gauge,
  Thermometer,
  Layers,
  Zap,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { api } from '../api/client';
import { DigitalTwinState } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface DigitalTwinPageProps {
  wellId: number;
  onSelectWell: (id: number) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ wellId: propWellId, onSelectWell }) => {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? parseInt(id, 10) : propWellId;
  const navigate = useNavigate();

  const [state, setState] = useState<DigitalTwinState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHighlightLayer, setActiveHighlightLayer] = useState<string>('all');

  const fetchTwinData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDigitalTwin(activeId);
      setState(res);
      onSelectWell(activeId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch digital twin telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, [activeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message={`Synchronizing Digital Twin state for Well #${activeId}...`} size="lg" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error || 'Unable to connect to Digital Twin backend.'} onRetry={fetchTwinData} />
      </div>
    );
  }

  const isHighRisk = state.rod_floating_risk_pct > 35.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Well Title, Status, Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-petroleum-navy text-sand-warm">
              DIGITAL TWIN NODE
            </span>
            <span className="text-xs text-petroleum-light font-mono">
              Depth: {state.depth_m} m • Jodhpur Sandstone • 18° API
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
              {state.well_name}
            </h1>
            <StatusBadge status={state.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchTwinData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sand-warm text-xs font-semibold text-petroleum-navy hover:bg-sand-light/60 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Twin</span>
          </button>

          <button
            onClick={() => navigate(`/optimization/${activeId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-copper text-cream-soft text-xs font-semibold hover:bg-amber-warm transition-colors shadow-soft"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Run Joint Optimizer</span>
          </button>

          <button
            onClick={() => navigate(`/css-optimizer/${activeId}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors shadow-soft"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate CSS</span>
          </button>

          <button
            onClick={() => navigate(`/srp-optimizer/${activeId}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-muted text-cream-soft text-xs font-semibold hover:bg-teal-dark transition-colors shadow-soft"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Simulate SRP</span>
          </button>
        </div>
      </div>

      {/* Warning banner if high rod floating risk */}
      {isHighRisk && (
        <div className="bg-alert-pale border-l-4 border-alert-red p-4 rounded-xl shadow-soft-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-alert-red shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-display font-bold text-alert-dark">
                Elevated Downstroke Rod Floating & Impact Risk ({state.rod_floating_risk_pct.toFixed(1)}%)
              </h4>
              <p className="text-xs text-alert-dark/90 mt-0.5">
                Reservoir cooling to {state.reservoir_temperature.toFixed(1)}°C has caused crude viscosity to surge to{' '}
                {state.oil_viscosity.toFixed(0)} cP. At {state.spm} SPM, downstroke viscous drag exceeds buoyant rod weight,
                causing string stalling and bottom-reversal impact loads up to {state.impact_loading_kn.toFixed(1)} kN.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/optimization/${activeId}`)}
            className="shrink-0 px-3 py-1.5 bg-alert-dark text-white rounded-lg text-xs font-semibold hover:bg-alert-red transition-colors"
          >
            Resolve with Optimizer
          </button>
        </div>
      )}

      {/* Main Dual Grid: Left = Visual Interactive Well Cross-Section; Right = Live Telemetry Nodes & Dynacard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Wellbore Schematic with Flow Connections */}
        <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-sand-warm/80 p-5 shadow-soft-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-light">
            <div>
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                Well-to-Surface Physical Cross-Section
              </h3>
              <p className="text-[11px] text-petroleum-light">
                Coupled mechanical and thermodynamic layers
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand-light text-petroleum-navy font-bold">
              1:100 SCALE
            </span>
          </div>

          {/* SVG Schematic Canvas with Live Data Anchors */}
          <div className="relative w-full h-[620px] bg-desert-beige/30 rounded-xl border border-sand-warm/50 overflow-hidden flex items-center justify-center p-2">
            <svg viewBox="0 0 420 620" className="w-full h-full">
              {/* Background Geological Formations */}
              <rect x="0" y="0" width="420" height="90" fill="#FAF7F2" />
              <rect x="0" y="90" width="420" height="150" fill="#F4EFE6" opacity="0.6" />
              <rect x="0" y="240" width="420" height="240" fill="#EDE6DA" opacity="0.6" />
              <rect x="0" y="480" width="420" height="140" fill="#D8C5A3" fillOpacity="0.28" />

              {/* Geological labels */}
              <text x="12" y="22" fill="#163B45" fontSize="10" fontWeight="bold">SURFACE FACILITY (0 m)</text>
              <text x="12" y="115" fill="#9E8865" fontSize="9" fontFamily="monospace">OVERBURDEN SHALE (0 - 350 m)</text>
              <text x="12" y="265" fill="#9E8865" fontSize="9" fontFamily="monospace">INTERMEDIATE BASIN (350 - 850 m)</text>
              <text x="12" y="505" fill="#163B45" fontSize="10" fontWeight="bold">JODHPUR SANDSTONE RESERVOIR (1050 m)</text>

              {/* Surface Platform & Walking Beam */}
              <rect x="140" y="70" width="140" height="8" rx="2" fill="#163B45" />
              {/* Walking beam pivot stand */}
              <path d="M 170 70 L 195 28 L 220 70 Z" fill="#163B45" />
              {/* Walking beam arm */}
              <line x1="150" y1="28" x2="245" y2="28" stroke="#163B45" strokeWidth="5" strokeLinecap="round" />
              {/* Horsehead & bridle */}
              <path d="M 240 28 C 255 33, 260 48, 258 60" stroke="#163B45" strokeWidth="4" fill="none" />
              <line x1="258" y1="60" x2="258" y2="92" stroke="#B77B45" strokeWidth="2.5" />
              <rect x="252" y="74" width="12" height="6" rx="1" fill="#B77B45" />

              {/* Wellhead Christmas Tree & Flowline */}
              <rect x="246" y="70" width="24" height="24" fill="#4F8585" rx="2" />
              <path d="M 270 82 L 350 82" stroke="#4F8585" strokeWidth="3" fill="none" />
              <circle cx="350" cy="82" r="4" fill="#789681" />

              {/* Casing 7" OD (Outer Pipe) */}
              <rect x="244" y="94" width="28" height="430" fill="#EFE7DA" stroke="#163B45" strokeWidth="1.8" />

              {/* Tubing 2-7/8" OD (Inner Production Pipe) */}
              <rect x="251" y="94" width="14" height="410" fill="#FAF9F5" stroke="#4F8585" strokeWidth="1.2" />

              {/* Sucker Rod String 1" (Inside Tubing) */}
              <line
                x1="258"
                y1="94"
                x2="258"
                y2="455"
                stroke={isHighRisk ? '#C25450' : '#B77B45'}
                strokeWidth="2.5"
                strokeDasharray={isHighRisk ? '4 2' : 'none'}
              />

              {/* Rod Floating Stress Indicator Waves if at risk */}
              {isHighRisk && (
                <>
                  <path d="M 252 280 Q 258 275 264 280" stroke="#C25450" strokeWidth="2" fill="none" />
                  <path d="M 252 320 Q 258 315 264 320" stroke="#C25450" strokeWidth="2" fill="none" />
                  <path d="M 252 360 Q 258 355 264 360" stroke="#C25450" strokeWidth="2" fill="none" />
                </>
              )}

              {/* Subsurface SRP Pump Assembly (Barrel, Plunger, Standing Valve) */}
              <rect x="253" y="450" width="10" height="34" fill="#B77B45" rx="1.5" />
              {/* Traveling Valve Ball */}
              <circle cx="258" cy="462" r="2.5" fill="#FAF9F5" stroke="#163B45" strokeWidth="1" />
              {/* Standing Valve Ball */}
              <circle cx="258" cy="478" r="2.5" fill="#163B45" />

              {/* Perforations into Casing */}
              <circle cx="244" cy="495" r="2" fill="#163B45" />
              <circle cx="272" cy="495" r="2" fill="#163B45" />
              <circle cx="244" cy="510" r="2" fill="#163B45" />
              <circle cx="272" cy="510" r="2" fill="#163B45" />
              <circle cx="244" cy="525" r="2" fill="#163B45" />
              <circle cx="272" cy="525" r="2" fill="#163B45" />

              {/* CSS Thermal Steam Zone (Halo Ellipse) */}
              <ellipse
                cx="258"
                cy="515"
                rx="110"
                ry="45"
                fill="#D8C5A3"
                fillOpacity="0.4"
                stroke="#B77B45"
                strokeWidth="2"
                strokeDasharray="5 3"
              />

              {/* Reservoir Fluid Inflow Vectors */}
              <path d="M 160 520 Q 210 515 242 512" stroke="#B77B45" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
              <path d="M 355 520 Q 305 515 274 512" stroke="#B77B45" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

              {/* Callout Nodes overlaying schematic */}
              {/* 1. Surface Node */}
              <g transform="translate(10, 50)">
                <rect width="125" height="38" rx="6" fill="#FAF9F5" stroke="#163B45" strokeWidth="1.2" />
                <text x="8" y="16" fill="#163B45" fontSize="10" fontWeight="bold">1. SURFACE LIFT</text>
                <text x="8" y="30" fill="#4F8585" fontSize="9" fontWeight="bold">{state.production_rate_bpd.toFixed(1)} bpd | {state.energy_kwh_bbl.toFixed(1)} kWh/bbl</text>
                <line x1="125" y1="19" x2="160" y2="19" stroke="#163B45" strokeWidth="1" strokeDasharray="2 2" />
              </g>

              {/* 2. VFD & SPM Node */}
              <g transform="translate(290, 20)">
                <rect width="120" height="38" rx="6" fill="#FAF9F5" stroke="#4F8585" strokeWidth="1.2" />
                <text x="8" y="16" fill="#163B45" fontSize="10" fontWeight="bold">2. VFD MOTOR</text>
                <text x="8" y="30" fill="#B77B45" fontSize="9" fontWeight="bold">{state.spm} SPM @ {state.vfd_frequency} Hz</text>
                <line x1="0" y1="19" x2="-35" y2="19" stroke="#4F8585" strokeWidth="1" strokeDasharray="2 2" />
              </g>

              {/* 3. Rod String Viscous Drag & Floating Risk */}
              <g transform="translate(10, 290)">
                <rect width="135" height="50" rx="6" fill={isHighRisk ? '#FBF0EF' : '#FAF9F5'} stroke={isHighRisk ? '#C25450' : '#D8C5A3'} strokeWidth="1.2" />
                <text x="8" y="16" fill={isHighRisk ? '#9F3A36' : '#163B45'} fontSize="10" fontWeight="bold">3. SUCKER ROD DRAG</text>
                <text x="8" y="30" fill="#163B45" fontSize="9">PPRL: {state.rod_load_kn.toFixed(1)} kN</text>
                <text x="8" y="44" fill={isHighRisk ? '#C25450' : '#789681'} fontSize="9" fontWeight="bold">Float Risk: {state.rod_floating_risk_pct.toFixed(1)}%</text>
                <line x1="135" y1="25" x2="251" y2="290" stroke={isHighRisk ? '#C25450' : '#9E8865'} strokeWidth="1" strokeDasharray="2 2" />
              </g>

              {/* 4. Subsurface Pump Assembly */}
              <g transform="translate(290, 440)">
                <rect width="120" height="40" rx="6" fill="#FAF9F5" stroke="#B77B45" strokeWidth="1.2" />
                <text x="8" y="16" fill="#163B45" fontSize="10" fontWeight="bold">4. SRP PLUNGER</text>
                <text x="8" y="30" fill="#B77B45" fontSize="9" fontWeight="bold">Efficiency: {state.pump_efficiency.toFixed(1)}%</text>
                <line x1="0" y1="20" x2="-27" y2="465" stroke="#B77B45" strokeWidth="1" strokeDasharray="2 2" />
              </g>

              {/* 5. Thermal CSS Reservoir Zone */}
              <g transform="translate(10, 550)">
                <rect width="145" height="52" rx="6" fill="#FAF9F5" stroke="#D8C5A3" strokeWidth="1.2" />
                <text x="8" y="16" fill="#163B45" fontSize="10" fontWeight="bold">5. THERMAL STIMULATION</text>
                <text x="8" y="30" fill="#B77B45" fontSize="9" fontWeight="bold">Temp: {state.reservoir_temperature.toFixed(1)}°C | {state.oil_viscosity.toFixed(0)} cP</text>
                <text x="8" y="44" fill="#4F8585" fontSize="9">Mobility: {state.oil_mobility_indicator.toFixed(3)} mD/cP</text>
                <line x1="145" y1="26" x2="200" y2="550" stroke="#D8C5A3" strokeWidth="1" strokeDasharray="2 2" />
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-petroleum-light bg-cream-soft p-3 rounded-lg border border-sand-light">
            <span>Model Calibration:</span>
            <span className="font-mono text-petroleum-navy font-semibold">
              Baghewala Jodhpur Sandstone • Cycle #{state.current_css_cycle}
            </span>
          </div>
        </div>

        {/* Right Column: 8 Live Telemetry Metrics + Causality Chain + Dynamometer Card */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 8 Digital Twin Live Telemetry Metrics */}
          <div className="bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
            <h3 className="text-sm font-display font-bold text-petroleum-navy uppercase tracking-wider mb-3">
              Coupled Digital Twin Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Temperature */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Reservoir Temp</span>
                <span className="text-lg font-display font-bold text-petroleum-navy">
                  {state.reservoir_temperature.toFixed(1)} <span className="text-xs font-normal">°C</span>
                </span>
                <span className="text-[10px] text-amber-copper block mt-0.5">
                  Native: 47.0°C
                </span>
              </div>

              {/* Viscosity */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Oil Viscosity</span>
                <span className="text-lg font-display font-bold text-amber-copper">
                  {state.oil_viscosity.toFixed(0)} <span className="text-xs font-normal">cP</span>
                </span>
                <span className="text-[10px] text-petroleum-light block mt-0.5">
                  Dynamic (Arrhenius)
                </span>
              </div>

              {/* Mobility */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Oil Mobility</span>
                <span className="text-lg font-display font-bold text-teal-muted">
                  {state.oil_mobility_indicator.toFixed(3)}
                </span>
                <span className="text-[10px] text-petroleum-light block mt-0.5">
                  mD / cP
                </span>
              </div>

              {/* Production */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Production</span>
                <span className="text-lg font-display font-bold text-petroleum-navy">
                  {state.production_rate_bpd.toFixed(1)} <span className="text-xs font-normal">bpd</span>
                </span>
                <span className="text-[10px] text-sage-green block mt-0.5">
                  Cut: {state.water_cut_pct.toFixed(0)}%
                </span>
              </div>

              {/* Pump Efficiency */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Pump Efficiency</span>
                <span className="text-lg font-display font-bold text-sage-dark">
                  {state.pump_efficiency.toFixed(1)} <span className="text-xs font-normal">%</span>
                </span>
                <span className="text-[10px] text-petroleum-light block mt-0.5">
                  Volumetric fill
                </span>
              </div>

              {/* Rod Load */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Peak Rod Load</span>
                <span className="text-lg font-display font-bold text-petroleum-navy">
                  {state.rod_load_kn.toFixed(1)} <span className="text-xs font-normal">kN</span>
                </span>
                <span className="text-[10px] text-petroleum-light block mt-0.5">
                  PPRL API RP 11L
                </span>
              </div>

              {/* Rod Floating Risk */}
              <div className={`p-3 rounded-lg border ${
                isHighRisk ? 'bg-alert-pale border-alert-red/40' : 'bg-desert-beige/50 border-sand-warm/40'
              }`}>
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Rod Float Risk</span>
                <span className={`text-lg font-display font-bold ${isHighRisk ? 'text-alert-red' : 'text-petroleum-navy'}`}>
                  {state.rod_floating_risk_pct.toFixed(1)} <span className="text-xs font-normal">%</span>
                </span>
                <span className={`text-[10px] block mt-0.5 ${isHighRisk ? 'text-alert-dark font-semibold' : 'text-sage-green'}`}>
                  {isHighRisk ? 'High Drag Danger' : 'Safe Downstroke'}
                </span>
              </div>

              {/* SOR */}
              <div className="p-3 rounded-lg bg-desert-beige/50 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light uppercase block">Steam-Oil Ratio</span>
                <span className="text-lg font-display font-bold text-amber-copper">
                  {state.sor.toFixed(2)} <span className="text-xs font-normal">m³/m³</span>
                </span>
                <span className="text-[10px] text-petroleum-light block mt-0.5">
                  Cumulative cycle
                </span>
              </div>
            </div>
          </div>

          {/* Dynamometer Card (Surface & Downhole Pump Load vs Position) */}
          <div className="bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-display font-bold text-petroleum-navy">
                  Simulated Dynamometer Card (Dynacard)
                </h3>
                <p className="text-xs text-petroleum-light">
                  Polished rod position % vs Surface load and downhole pump load (kN).
                </p>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                isHighRisk ? 'bg-alert-pale text-alert-dark' : 'bg-sage-pale text-sage-dark'
              }`}>
                {isHighRisk ? 'Heavy Oil Delayed Card' : 'Normal API Card'}
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={state.dynacard} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFE7DA" />
                  <XAxis dataKey="position_pct" stroke="#9E8865" fontSize={11} label={{ value: 'Stroke Position (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#9E8865' }} />
                  <YAxis stroke="#9E8865" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#D8C5A3', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val: any, name: any) => [`${val} kN`, String(name || '')]}
                  />
                  <Line type="monotone" dataKey="surface_load_kn" name="Surface Load (kN)" stroke="#163B45" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="pump_load_kn" name="Pump Load (kN)" stroke="#B77B45" strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-[11px] text-petroleum-light flex items-center justify-between pt-2 border-t border-sand-light">
              <span>Upstroke Peak: <strong className="text-petroleum-navy">{state.rod_load_kn.toFixed(1)} kN</strong></span>
              <span>Bottom Reversal Impact: <strong className="text-amber-copper">{state.impact_loading_kn.toFixed(1)} kN</strong></span>
              <span>Stroke Length: <strong className="text-petroleum-navy">{state.stroke_length}"</strong></span>
            </div>
          </div>

          {/* Physics Causality Chain Walkthrough */}
          <div className="bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
            <h3 className="text-sm font-display font-bold text-petroleum-navy mb-3">
              Coupled Reservoir-to-Surface Causality Chain
            </h3>

            <div className="space-y-2">
              {state.physics_chain.map((node) => (
                <div key={node.step} className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-light flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-petroleum-navy text-sand-warm font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {node.step}
                    </span>
                    <div>
                      <span className="font-semibold text-petroleum-navy">{node.name}</span>
                      <p className="text-[11px] text-petroleum-light">{node.impact}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-petroleum-deep bg-white px-2 py-1 rounded border border-sand-warm/50 shrink-0">
                    {node.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
