import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { WellSummary } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface WhatIfSimulatorPageProps {
  selectedWellId: number;
  wells: WellSummary[];
  onSelectWell: (id: number) => void;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({
  selectedWellId,
  wells,
  onSelectWell,
}) => {
  const navigate = useNavigate();
  const [activeWellId, setActiveWellId] = useState<number>(selectedWellId);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sliders for "WHAT HAPPENS IF...?"
  const [simSteamVolume, setSimSteamVolume] = useState<number>(2600);
  const [simSoakTime, setSimSoakTime] = useState<number>(7);
  const [simSpm, setSimSpm] = useState<number>(5.0);
  const [simStrokeLength, setSimStrokeLength] = useState<number>(120);

  // Baseline vs Simulated metrics
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [summaryNarrative, setSummaryNarrative] = useState<string>('');

  const runScenarioSimulation = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch current well state
      const currentWell = await api.getWell(activeWellId);
      const currSrp = currentWell.latest_srp || { stroke_length: 100, spm: 7.0, pump_efficiency: 75, rod_floating_risk: 45 };
      const currCss = currentWell.latest_css || { steam_volume: 2000, soak_time: 5 };

      // 2. Run backend CSS simulation with new parameters
      const cssRes = await api.simulateCss(activeWellId, {
        steam_volume: simSteamVolume,
        injection_pressure: 105,
        injection_duration: 14,
        soak_time: simSoakTime,
        production_cutoff: 12,
      });

      // 3. Run backend SRP simulation with new mechanical parameters and newly estimated viscosity
      const srpRes = await api.simulateSrp(activeWellId, {
        stroke_length: simStrokeLength,
        spm: simSpm,
        vfd_frequency: Math.round(simSpm * 7.2),
      });

      // Assemble Before vs After Metrics
      const currProd = currentWell.production_rate || 65.0;
      const currSor = 3.6;
      const currEnergy = 38.0;
      const currEff = currSrp.pump_efficiency || 75.0;
      const currRodRisk = currSrp.rod_floating_risk || 40.0;
      const currHealth = currentWell.health_score || 72.0;

      const newProd = cssRes.predicted_production;
      const newSor = cssRes.predicted_sor;
      const newEnergy = cssRes.energy_consumption;
      const newEff = srpRes.pump_efficiency;
      const newRodRisk = srpRes.rod_floating_risk;
      const newHealth = Math.max(10, Math.round(100 - (newRodRisk * 0.5 + srpRes.impact_loading * 1.0)));

      const chartData = [
        { metric: 'Production (bpd)', Before: Math.round(currProd), After: Math.round(newProd) },
        { metric: 'SOR (m³/m³ × 10)', Before: Math.round(currSor * 10), After: Math.round(newSor * 10) },
        { metric: 'Energy (kWh/bbl)', Before: Math.round(currEnergy), After: Math.round(newEnergy) },
        { metric: 'Pump Eff (%)', Before: Math.round(currEff), After: Math.round(newEff) },
        { metric: 'Rod Float Risk (%)', Before: Math.round(currRodRisk), After: Math.round(newRodRisk) },
        { metric: 'Health Score', Before: Math.round(currHealth), After: Math.round(newHealth) },
      ];

      setComparisonData(chartData);

      const prodChange = Math.round(((newProd - currProd) / currProd) * 100);
      const riskChange = Math.round(newRodRisk - currRodRisk);

      setSummaryNarrative(
        `By setting steam volume to ${simSteamVolume} m³ with ${simSoakTime} days soak time, and tuning the SRP to ${simStrokeLength}" stroke at ${simSpm.toFixed(1)} SPM: ` +
        `Oil production is forecasted to change by ${prodChange > 0 ? '+' : ''}${prodChange}%, while rod floating risk is altered by ${riskChange > 0 ? '+' : ''}${riskChange}%. ` +
        `This combination ${newRodRisk < 25 ? 'safely keeps rod string dynamics within mechanical limits' : 'presents residual downstroke drag concerns'}.`
      );
    } catch (err: any) {
      setError(err.message || 'Scenario simulation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScenarioSimulation();
  }, [activeWellId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
              SCENARIO LABORATORY
            </span>
            <span className="text-xs text-petroleum-light font-mono">
              Coupled Thermal & Lift Sensitivity Testing
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            "What Happens If...?" Simulator
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Manipulate both Cyclic Steam Stimulation and Sucker Rod Pump operational variables simultaneously to observe immediate well-to-surface performance impacts.
          </p>
        </div>

        {/* Well Selector */}
        {wells.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-petroleum-light">Target Well:</span>
            <select
              value={activeWellId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setActiveWellId(newId);
                onSelectWell(newId);
              }}
              className="bg-white border border-sand-warm rounded-lg px-3 py-1.5 text-xs font-bold text-petroleum-navy shadow-soft-sm"
            >
              {wells.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.well_name} ({w.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={runScenarioSimulation} />}

      {/* Main Grid: Controls vs Comparative Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-sand-light">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-copper" />
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                Scenario Inputs
              </h3>
            </div>
            <button
              onClick={() => {
                setSimSteamVolume(2600);
                setSimSoakTime(7);
                setSimSpm(5.0);
                setSimStrokeLength(120);
                runScenarioSimulation();
              }}
              className="text-[11px] font-mono text-petroleum-light hover:text-petroleum-navy flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Steam Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">1. Steam Volume (m³ CWE)</span>
              <span className="font-mono font-bold text-amber-copper">{simSteamVolume} m³</span>
            </div>
            <input
              type="range"
              min="1000"
              max="4500"
              step="100"
              value={simSteamVolume}
              onChange={(e) => setSimSteamVolume(Number(e.target.value))}
              className="w-full accent-amber-copper cursor-pointer"
            />
          </div>

          {/* Soak Time */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">2. Soak Time (Days)</span>
              <span className="font-mono font-bold text-teal-muted">{simSoakTime} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={simSoakTime}
              onChange={(e) => setSimSoakTime(Number(e.target.value))}
              className="w-full accent-teal-muted cursor-pointer"
            />
          </div>

          {/* SPM */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">3. SRP Speed (SPM)</span>
              <span className="font-mono font-bold text-petroleum-navy">{simSpm.toFixed(1)} SPM</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.5"
              value={simSpm}
              onChange={(e) => setSimSpm(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
          </div>

          {/* Stroke Length */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-petroleum-navy">4. Stroke Length (Inches)</span>
              <span className="font-mono font-bold text-petroleum-navy">{simStrokeLength}"</span>
            </div>
            <input
              type="range"
              min="64"
              max="144"
              step="8"
              value={simStrokeLength}
              onChange={(e) => setSimStrokeLength(Number(e.target.value))}
              className="w-full accent-petroleum-navy cursor-pointer"
            />
          </div>

          <button
            onClick={runScenarioSimulation}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-petroleum-navy text-sand-warm font-semibold text-xs shadow-soft hover:bg-petroleum-dark transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-copper" />
            <span>{loading ? 'Evaluating Scenario...' : 'Execute What-If Calculation'}</span>
          </button>
        </div>

        {/* Right Column: Comparative Before / After Chart & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light">
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                Before vs After Scenario Comparison
              </h3>
              <span className="text-xs font-mono font-semibold text-petroleum-light">
                Recharts Multi-Metric Vector
              </span>
            </div>

            {loading ? (
              <LoadingSpinner message="Calculating scenario impacts through Python backend engines..." />
            ) : (
              <>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFE7DA" />
                      <XAxis dataKey="metric" stroke="#9E8865" fontSize={11} angle={-15} textAnchor="end" />
                      <YAxis stroke="#9E8865" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#D8C5A3', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Before" fill="#D8C5A3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="After" fill="#163B45" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 rounded-xl bg-desert-beige/60 border border-sand-warm/50 text-xs text-petroleum-navy leading-relaxed">
                  <span className="font-bold block mb-1 text-petroleum-navy">Scenario Synthesis:</span>
                  {summaryNarrative}
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
