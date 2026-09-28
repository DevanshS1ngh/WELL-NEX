import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gauge,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldAlert,
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
  Legend
} from 'recharts';
import { api } from '../api/client';
import { SrpSimulationResponse, WellDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface SrpOptimizerPageProps {
  wellId: number;
  onSelectWell: (id: number) => void;
}

export const SrpOptimizerPage: React.FC<SrpOptimizerPageProps> = ({ wellId: propWellId, onSelectWell }) => {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? parseInt(id, 10) : propWellId;
  const navigate = useNavigate();

  const [well, setWell] = useState<WellDetail | null>(null);
  const [loadingWell, setLoadingWell] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inputs
  const [strokeLength, setStrokeLength] = useState<number>(100);
  const [spm, setSpm] = useState<number>(6.5);
  const [vfdFrequency, setVfdFrequency] = useState<number>(45.0);

  // Simulation output
  const [simResult, setSimResult] = useState<SrpSimulationResponse | null>(null);
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
        if (res.latest_srp) {
          setStrokeLength(res.latest_srp.stroke_length || 100);
          setSpm(res.latest_srp.spm || 6.5);
          setVfdFrequency(res.latest_srp.vfd_frequency || 45.0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load well SRP data');
      } finally {
        setLoadingWell(false);
      }
    };
    fetchWell();
  }, [activeId]);

  const handleSimulateSrp = async () => {
    try {
      setSimulating(true);
      setError(null);
      setAppliedMessage(null);
      const res = await api.simulateSrp(activeId, {
        stroke_length: strokeLength,
        spm: spm,
        vfd_frequency: vfdFrequency,
      });
      setSimResult(res);
    } catch (err: any) {
      setError(err.message || 'SRP simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyToTwin = async () => {
    try {
      setSimulating(true);
      const res = await api.applySrp(activeId, {
        stroke_length: strokeLength,
        spm: spm,
        vfd_frequency: vfdFrequency,
      });
      setAppliedMessage(`Updated SRP operating settings applied to ${res.message}! Well status: ${res.well_status}.`);
      const updatedWell = await api.getWell(activeId);
      setWell(updatedWell);
    } catch (err: any) {
      setError(err.message || 'Failed to apply SRP parameters');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (well && !simResult) {
      handleSimulateSrp();
    }
  }, [well]);

  if (loadingWell) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message={`Loading SRP dynamics for Well #${activeId}...`} />
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

  const isRiskHigh = simResult ? simResult.rod_floating_risk > 35.0 : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-subtle text-teal-dark border border-teal-muted/30">
              ARTIFICIAL LIFT OPTIMIZER
            </span>
            <span className="text-xs font-mono text-petroleum-light">
              Well: {well?.well_name} • Dynamic Viscosity: {well?.oil_viscosity.toFixed(0)} cP
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Sucker Rod Pump (SRP) Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Surface stroke length, SPM, and VFD frequency simulation coupled with heavy oil downstroke viscous drag.
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
            Check Twin
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: SRP Mechanical Sliders */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-sand-light">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-muted" />
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                SRP Operating Controls
              </h3>
            </div>
            <span className="text-[11px] font-mono text-petroleum-light">
              API RP 11L MODEL
            </span>
          </div>

          {/* Stroke Length */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Stroke Length (S)</span>
              <span className="font-mono font-bold text-petroleum-navy">{strokeLength} Inches</span>
            </div>
            <input
              type="range"
              min="54"
              max="144"
              step="6"
              value={strokeLength}
              onChange={(e) => setStrokeLength(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>54"</span>
              <span>100" (Standard)</span>
              <span>144" (Long-Stroke)</span>
            </div>
          </div>

          {/* SPM */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">Pumping Speed (SPM)</span>
              <span className={`font-mono font-bold ${spm > 7.0 ? 'text-alert-red' : 'text-teal-muted'}`}>
                {spm.toFixed(1)} Strokes / Min
              </span>
            </div>
            <input
              type="range"
              min="2.5"
              max="11.0"
              step="0.5"
              value={spm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSpm(val);
                // Synchronize recommended VFD frequency (approx ~6 SPM -> 45 Hz)
                setVfdFrequency(Math.round(val * 7.0));
              }}
              className="w-full accent-teal-muted cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>2.5 (Gentle / Viscous)</span>
              <span>6.0 (Nominal)</span>
              <span>11.0 (High Drag Risk)</span>
            </div>
          </div>

          {/* VFD Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">VFD Motor Frequency</span>
              <span className="font-mono font-bold text-petroleum-navy">{vfdFrequency.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min="25"
              max="60"
              step="1"
              value={vfdFrequency}
              onChange={(e) => setVfdFrequency(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sand-dark">
              <span>25 Hz</span>
              <span>50 Hz (Line)</span>
              <span>60 Hz</span>
            </div>
          </div>

          <div className="p-3 bg-desert-beige/60 rounded-xl text-xs text-petroleum-navy border border-sand-warm/40">
            <span className="font-semibold block mb-0.5">Heavy Oil Dynamic Guideline:</span>
            When crude viscosity exceeds 2,500 cP, lowering SPM below 5.5 and lengthening stroke to 120"+ maintains
            plunger displacement while preventing downstroke rod floating.
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSimulateSrp}
              disabled={simulating}
              className="flex-1 py-3 px-4 rounded-xl bg-petroleum-navy text-sand-warm font-semibold text-xs shadow-soft hover:bg-petroleum-dark transition-all flex items-center justify-center gap-2"
            >
              <Gauge className="w-4 h-4 text-teal-muted" />
              <span>{simulating ? 'Calculating...' : 'Simulate SRP'}</span>
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

        {/* Right Column: Mechanical Diagnostics, Dynacard & Risk Gauges */}
        <div className="lg:col-span-7 space-y-6">
          
          {simResult && (
            <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-sand-light">
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Backend Simulation Results
                </h3>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isRiskHigh ? 'bg-alert-pale text-alert-dark' : 'bg-sage-pale text-sage-dark'
                }`}>
                  Risk Status: {simResult.rod_floating_severity}
                </span>
              </div>

              {/* 6 Key Mechanical Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Pump Efficiency */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Pump Efficiency</span>
                  <div className="text-xl font-display font-bold text-petroleum-navy">
                    {simResult.pump_efficiency.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-sage-green">Volumetric fill</span>
                </div>

                {/* Rod Load */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Peak Rod Load (PPRL)</span>
                  <div className="text-xl font-display font-bold text-petroleum-navy">
                    {simResult.rod_load.toFixed(1)} kN
                  </div>
                  <span className="text-[10px] text-petroleum-light">API limit ~130 kN</span>
                </div>

                {/* Rod Floating Risk */}
                <div className={`p-3 rounded-xl border ${
                  isRiskHigh ? 'bg-alert-pale border-alert-red/40' : 'bg-desert-beige/40 border-sand-warm/40'
                }`}>
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Rod Floating Risk</span>
                  <div className={`text-xl font-display font-bold ${isRiskHigh ? 'text-alert-red' : 'text-petroleum-navy'}`}>
                    {simResult.rod_floating_risk.toFixed(1)}%
                  </div>
                  <span className={`text-[10px] font-semibold ${isRiskHigh ? 'text-alert-dark' : 'text-sage-green'}`}>
                    {isRiskHigh ? 'Elevated Drag' : 'Normal Descent'}
                  </span>
                </div>

                {/* Impact Loading */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Impact Loading</span>
                  <div className="text-xl font-display font-bold text-amber-copper">
                    {simResult.impact_loading.toFixed(1)} kN
                  </div>
                  <span className="text-[10px] text-petroleum-light">Bottom reversal shock</span>
                </div>

                {/* Pump Unsetting Risk */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Pump Unsetting Risk</span>
                  <div className="text-xl font-display font-bold text-petroleum-navy">
                    {simResult.pump_unsetting_risk.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-petroleum-light">Hold-down friction</span>
                </div>

                {/* Energy Consumption */}
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="text-[10px] font-mono text-petroleum-light uppercase block">Lifting Energy</span>
                  <div className="text-xl font-display font-bold text-petroleum-navy">
                    {simResult.energy_consumption.toFixed(1)} <span className="text-xs font-normal">kWh/bbl</span>
                  </div>
                  <span className="text-[10px] text-teal-muted">Surface motor work</span>
                </div>
              </div>

              {/* Analysis Notes from Backend */}
              <div className="space-y-2">
                {simResult.analysis_notes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-sand-light/50 border border-sand-warm/40 text-xs text-petroleum-navy flex items-start gap-2">
                    <Info className="w-4 h-4 text-petroleum-light shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              {/* Dynamometer Card Visualization */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold text-petroleum-navy uppercase">
                    Dynamometer Card (Position vs Surface Load)
                  </h4>
                  <span className="text-[10px] font-mono text-petroleum-light">
                    S = {strokeLength}" • {spm} SPM
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.dynacard} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFE7DA" />
                      <XAxis dataKey="position_pct" stroke="#9E8865" fontSize={11} label={{ value: 'Stroke Position (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#9E8865' }} />
                      <YAxis stroke="#9E8865" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#D8C5A3', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="surface_load_kn" name="Surface Load (kN)" stroke="#163B45" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="pump_load_kn" name="Pump Load (kN)" stroke="#B77B45" strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
