import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Flame,
  Thermometer,
  Activity,
  Droplet,
  Zap,
  TrendingDown,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { CssSimulationResponse, WellDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface CssOptimizerPageProps {
  wellId: number;
  onSelectWell: (id: number) => void;
}

export const CssOptimizerPage: React.FC<CssOptimizerPageProps> = ({ wellId: propWellId, onSelectWell }) => {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? parseInt(id, 10) : propWellId;
  const navigate = useNavigate();

  const [well, setWell] = useState<WellDetail | null>(null);
  const [loadingWell, setLoadingWell] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation inputs
  const [steamVolume, setSteamVolume] = useState<number>(2400);
  const [injectionPressure, setInjectionPressure] = useState<number>(105);
  const [injectionDuration, setInjectionDuration] = useState<number>(14);
  const [soakTime, setSoakTime] = useState<number>(6);
  const [productionCutoff, setProductionCutoff] = useState<number>(12);

  // Simulation results
  const [simResult, setSimResult] = useState<CssSimulationResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchWell = async () => {
      try {
        setLoadingWell(true);
        setError(null);
        const res = await api.getWell(activeId);
        setWell(res);
        onSelectWell(activeId);
        if (res.latest_css) {
          setSteamVolume(res.latest_css.steam_volume || 2400);
          setInjectionPressure(res.latest_css.injection_pressure || 105);
          setSoakTime(res.latest_css.soak_time || 6);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load well data');
      } finally {
        setLoadingWell(false);
      }
    };
    fetchWell();
  }, [activeId]);

  const handleSimulateCss = async () => {
    try {
      setSimulating(true);
      setError(null);
      setAppliedMessage(null);
      const res = await api.simulateCss(activeId, {
        steam_volume: steamVolume,
        injection_pressure: injectionPressure,
        injection_duration: injectionDuration,
        soak_time: soakTime,
        production_cutoff: productionCutoff,
      });
      setSimResult(res);
    } catch (err: any) {
      setError(err.message || 'CSS simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyToTwin = async () => {
    try {
      setSimulating(true);
      const res = await api.applyCss(activeId, {
        steam_volume: steamVolume,
        injection_pressure: injectionPressure,
        injection_duration: injectionDuration,
        soak_time: soakTime,
        production_cutoff: productionCutoff,
      });
      setAppliedMessage(`Successfully applied simulated CSS parameters to ${res.well_name} Digital Twin!`);
      // Refresh local well data
      const updatedWell = await api.getWell(activeId);
      setWell(updatedWell);
    } catch (err: any) {
      setError(err.message || 'Failed to apply CSS parameters to twin');
    } finally {
      setSimulating(false);
    }
  };

  // Run initial simulation once well is loaded
  useEffect(() => {
    if (well && !simResult) {
      handleSimulateCss();
    }
  }, [well]);

  if (loadingWell) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message={`Loading CSS state for Well #${activeId}...`} />
      </div>
    );
  }

  if (error && !well) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-pale text-amber-copper border border-amber-copper/30">
              THERMAL RECOVERY MODULE
            </span>
            <span className="text-xs font-mono text-petroleum-light">
              Well: {well?.well_name} • Jodhpur Sandstone
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Cyclic Steam Stimulation (CSS) Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Thermodynamic near-wellbore simulation for steam volume, injection pressure, and soak time optimization.
          </p>
        </div>

        <button
          onClick={() => navigate(`/digital-twin/${activeId}`)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-sand-warm text-xs font-semibold text-petroleum-navy hover:bg-sand-light/60 transition-colors shadow-2xs"
        >
          <span>View in Digital Twin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {appliedMessage && (
        <div className="p-4 bg-sage-pale border border-sage-green/40 rounded-xl flex items-center justify-between text-xs text-sage-dark font-medium shadow-soft-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-green" />
            <span>{appliedMessage}</span>
          </div>
          <button
            onClick={() => navigate(`/digital-twin/${activeId}`)}
            className="font-bold underline hover:text-petroleum-navy"
          >
            Open Digital Twin
          </button>
        </div>
      )}

      {/* Main Grid: Left Controls (Sliders) & Right Simulation Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Parameter Control Sliders */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-sand-light">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-copper" />
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                CSS Stimulation Parameters
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-petroleum-light">
              CYCLE #{well?.latest_css?.cycle_number || 2}
            </span>
          </div>

          {/* Slider 1: Steam Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Steam Volume</span>
              <span className="font-mono font-bold text-amber-copper">{steamVolume.toLocaleString()} m³ CWE</span>
            </div>
            <input
              type="range"
              min="800"
              max="5000"
              step="100"
              value={steamVolume}
              onChange={(e) => setSteamVolume(Number(e.target.value))}
              className="w-full accent-amber-copper cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>800 m³ (Slug min)</span>
              <span>5,000 m³ (High cost)</span>
            </div>
          </div>

          {/* Slider 2: Injection Pressure */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Injection Pressure</span>
              <span className="font-mono font-bold text-petroleum-navy">{injectionPressure} bar</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={injectionPressure}
              onChange={(e) => setInjectionPressure(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>50 bar</span>
              <span>150 bar (Fracture limit: 160)</span>
            </div>
          </div>

          {/* Slider 3: Injection Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Injection Duration</span>
              <span className="font-mono font-bold text-petroleum-navy">{injectionDuration} Days</span>
            </div>
            <input
              type="range"
              min="4"
              max="28"
              step="1"
              value={injectionDuration}
              onChange={(e) => setInjectionDuration(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>4 Days</span>
              <span>28 Days</span>
            </div>
          </div>

          {/* Slider 4: Soak Time */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Soak Time</span>
              <span className="font-mono font-bold text-teal-muted">{soakTime} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="18"
              step="1"
              value={soakTime}
              onChange={(e) => setSoakTime(Number(e.target.value))}
              className="w-full accent-teal-muted cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>1 Day (Breakthrough risk)</span>
              <span>18 Days (Heat leak)</span>
            </div>
          </div>

          {/* Slider 5: Production Cut-off */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Economic Production Cut-off</span>
              <span className="font-mono font-bold text-petroleum-navy">{productionCutoff} bpd</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={productionCutoff}
              onChange={(e) => setProductionCutoff(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>5 bpd</span>
              <span>35 bpd</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSimulateCss}
              disabled={simulating}
              className="flex-1 py-3 px-4 rounded-xl bg-petroleum-navy text-sand-warm font-semibold text-xs shadow-soft hover:bg-petroleum-dark transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-copper" />
              <span>{simulating ? 'Simulating...' : 'Simulate CSS'}</span>
            </button>

            {simResult && (
              <button
                onClick={handleApplyToTwin}
                disabled={simulating}
                className="py-3 px-4 rounded-xl bg-sage-green text-cream-soft font-semibold text-xs shadow-soft hover:bg-sage-dark transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to Digital Twin</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Current vs Simulated Comparison + Thermal Trajectory Chart */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Comparison Cards: Current vs Simulated */}
          {simResult && well && (
            <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sand-light">
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Current vs Simulated Performance
                </h3>
                <span className="text-xs font-mono font-semibold text-sage-green">
                  Thermal Radius: {simResult.thermal_radius_m} m
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Temperature */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Avg Temp</span>
                  <div className="text-xs font-mono text-petroleum-light line-through">
                    {well.reservoir_temperature.toFixed(1)}°C
                  </div>
                  <div className="text-lg font-display font-bold text-amber-copper">
                    {simResult.predicted_reservoir_temperature.toFixed(1)}°C
                  </div>
                </div>

                {/* Viscosity */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Viscosity</span>
                  <div className="text-xs font-mono text-petroleum-light line-through">
                    {well.oil_viscosity.toFixed(0)} cP
                  </div>
                  <div className="text-lg font-display font-bold text-sage-dark">
                    {simResult.estimated_viscosity.toFixed(0)} cP
                  </div>
                </div>

                {/* Production */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Production</span>
                  <div className="text-xs font-mono text-petroleum-light line-through">
                    {well.production_rate.toFixed(1)} bpd
                  </div>
                  <div className="text-lg font-display font-bold text-petroleum-navy">
                    {simResult.predicted_production.toFixed(1)} bpd
                  </div>
                </div>

                {/* SOR */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Est. SOR</span>
                  <div className="text-xs font-mono text-petroleum-light">
                    Baseline
                  </div>
                  <div className="text-lg font-display font-bold text-teal-muted">
                    {simResult.predicted_sor.toFixed(2)}
                  </div>
                </div>

                {/* Energy */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Energy / bbl</span>
                  <div className="text-xs font-mono text-petroleum-light">
                    Thermal + Lift
                  </div>
                  <div className="text-lg font-display font-bold text-petroleum-navy">
                    {simResult.energy_consumption.toFixed(1)} kWh
                  </div>
                </div>
              </div>

              {/* Backend Physics Explanation */}
              <div className="p-3.5 bg-sand-light/50 rounded-xl border border-sand-warm/50 text-xs text-petroleum-navy leading-relaxed">
                <span className="font-semibold block mb-1">Backend Simulation Analysis:</span>
                {simResult.explanation}
              </div>
            </div>
          )}

          {/* 90-Day Temperature Decay Trajectory Chart */}
          {simResult && (
            <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-petroleum-navy">
                    Post-Steam Temperature & Viscosity Decay (90 Days)
                  </h3>
                  <p className="text-xs text-petroleum-light">
                    Thermal conduction into surrounding formation leads to viscosity rise over time.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-copper font-bold">
                  Radial Heat Model
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simResult.temperature_trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFE7DA" />
                    <XAxis dataKey="day" stroke="#9E8865" fontSize={11} label={{ value: 'Cycle Day', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#9E8865' }} />
                    <YAxis yAxisId="left" stroke="#B77B45" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" stroke="#163B45" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#D8C5A3', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Reservoir Temp (°C)" stroke="#B77B45" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="viscosity" name="Oil Viscosity (cP)" stroke="#163B45" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
