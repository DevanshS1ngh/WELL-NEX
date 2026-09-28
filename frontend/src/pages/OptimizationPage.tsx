import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  Gauge,
  Zap,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { OptimizationResponse, WellDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface OptimizationPageProps {
  wellId: number;
  onSelectWell: (id: number) => void;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({ wellId: propWellId, onSelectWell }) => {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? parseInt(id, 10) : propWellId;
  const navigate = useNavigate();

  const [well, setWell] = useState<WellDetail | null>(null);
  const [optData, setOptData] = useState<OptimizationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>('BALANCED');

  const fetchOptimization = async () => {
    try {
      setLoading(true);
      setError(null);
      const wellRes = await api.getWell(activeId);
      setWell(wellRes);
      onSelectWell(activeId);

      // Run optimization on demand or fetch latest
      const res = await api.optimizeWell(activeId, priority);
      setOptData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimization = async (customPriority = priority) => {
    try {
      setOptimizing(true);
      setError(null);
      const res = await api.optimizeWell(activeId, customPriority);
      setOptData(res);
    } catch (err: any) {
      setError(err.message || 'Optimization run failed');
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [activeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message={`Running joint CSS-SRP optimizer for Well #${activeId}...`} />
      </div>
    );
  }

  if (error && !optData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error} onRetry={fetchOptimization} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sage-pale text-sage-dark border border-sage-green/40">
              JOINT MULTI-OBJECTIVE OPTIMIZER
            </span>
            <span className="text-xs font-mono text-petroleum-light">
              Well: {well?.well_name} • Jodhpur Sandstone
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Well Operating Window Optimization
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Finding a balanced thermal and artificial lift envelope to maximize net recovery while eliminating downstroke rod floating.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              handleRunOptimization(e.target.value);
            }}
            className="bg-white border border-sand-warm rounded-lg px-3 py-2 text-xs font-semibold text-petroleum-navy shadow-soft-sm hover:border-petroleum-navy"
          >
            <option value="BALANCED">Balanced Multi-Objective</option>
            <option value="MAX_PRODUCTION">Prioritize Max Production</option>
            <option value="MIN_ENERGY">Prioritize Minimum Energy / SOR</option>
            <option value="MIN_EQUIPMENT_STRESS">Prioritize Equipment Reliability</option>
          </select>

          <button
            onClick={() => handleRunOptimization(priority)}
            disabled={optimizing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-copper" />
            <span>{optimizing ? 'Optimizing...' : 'Run Well Optimization'}</span>
          </button>
        </div>
      </div>

      {optData && (
        <>
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-petroleum-light uppercase block">Optimization Score</span>
                <span className="text-3xl font-display font-bold text-petroleum-navy">
                  {optData.optimization_score.toFixed(1)}
                  <span className="text-xs font-mono font-normal text-petroleum-light ml-1">/ 100</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-pale flex items-center justify-center text-sage-green font-bold text-sm">
                A+
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
              <span className="text-xs font-mono text-petroleum-light uppercase block">Production Delta</span>
              <div className={`text-2xl font-display font-bold ${optData.production_delta_pct >= 0 ? 'text-sage-dark' : 'text-amber-copper'}`}>
                {optData.production_delta_pct >= 0 ? '+' : ''}{optData.production_delta_pct.toFixed(1)}%
              </div>
              <span className="text-[11px] text-petroleum-light">Net barrel output</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
              <span className="text-xs font-mono text-petroleum-light uppercase block">SOR Delta</span>
              <div className="text-2xl font-display font-bold text-teal-dark">
                {optData.sor_delta_pct >= 0 ? '+' : ''}{optData.sor_delta_pct.toFixed(1)}%
              </div>
              <span className="text-[11px] text-petroleum-light">Steam efficiency</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
              <span className="text-xs font-mono text-petroleum-light uppercase block">Rod Float Risk Reduction</span>
              <div className="text-2xl font-display font-bold text-sage-dark">
                {optData.rod_risk_delta_pct.toFixed(1)}%
              </div>
              <span className="text-[11px] text-sage-green font-medium">Mechanical fatigue relief</span>
            </div>
          </div>

          {/* Operating Window Comparison Table: Current vs Recommended */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light">
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Operating Window Envelope: Current vs WELL-NEX Recommended
                </h3>
                <p className="text-xs text-petroleum-light">
                  Jointly tuning thermal steam injection and sucker rod pump mechanical kinematics.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-desert-beige text-petroleum-navy border border-sand-warm">
                MODE: {priority}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand-warm/40 text-petroleum-light uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">System / Parameter</th>
                    <th className="py-2.5 px-3">Current Condition</th>
                    <th className="py-2.5 px-3">WELL-NEX Recommended</th>
                    <th className="py-2.5 px-3">Operational Variance</th>
                    <th className="py-2.5 px-3">Primary Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light">
                  {/* CSS: Steam Volume */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-copper" />
                      <span>CSS: Steam Volume</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{optData.current_window.steam_volume.toFixed(0)} m³</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-copper">{optData.recommended_window.steam_volume.toFixed(0)} m³</td>
                    <td className="py-3 px-3 font-mono">
                      {(optData.recommended_window.steam_volume - optData.current_window.steam_volume).toFixed(0)} m³
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Near-wellbore thermal radius</td>
                  </tr>

                  {/* CSS: Soak Time */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-copper" />
                      <span>CSS: Soak Time</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{optData.current_window.soak_time.toFixed(0)} Days</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-copper">{optData.recommended_window.soak_time.toFixed(0)} Days</td>
                    <td className="py-3 px-3 font-mono">
                      {(optData.recommended_window.soak_time - optData.current_window.soak_time).toFixed(0)} Days
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Thermal equilibration vs caprock heat leak</td>
                  </tr>

                  {/* SRP: Stroke Length */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-teal-muted" />
                      <span>SRP: Stroke Length</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{optData.current_window.stroke_length.toFixed(0)}"</td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-dark">{optData.recommended_window.stroke_length.toFixed(0)}"</td>
                    <td className="py-3 px-3 font-mono font-bold text-sage-dark">
                      +{(optData.recommended_window.stroke_length - optData.current_window.stroke_length).toFixed(0)}" (Longer)
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Maintains displacement at lower SPM</td>
                  </tr>

                  {/* SRP: Pumping Speed SPM */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-teal-muted" />
                      <span>SRP: Pumping Speed (SPM)</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-alert-red">{optData.current_window.spm.toFixed(1)} SPM</td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-dark">{optData.recommended_window.spm.toFixed(1)} SPM</td>
                    <td className="py-3 px-3 font-mono font-bold text-sage-dark">
                      {(optData.recommended_window.spm - optData.current_window.spm).toFixed(1)} SPM (Reduced)
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Reduces downstroke velocity below rod float speed</td>
                  </tr>

                  {/* Predicted Production */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-petroleum-navy" />
                      <span>Expected Production</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{optData.current_window.production.toFixed(1)} bpd</td>
                    <td className="py-3 px-3 font-mono font-bold text-petroleum-navy">{optData.recommended_window.production.toFixed(1)} bpd</td>
                    <td className="py-3 px-3 font-mono font-bold text-sage-dark">
                      {optData.production_delta_pct > 0 ? '+' : ''}{optData.production_delta_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Net heavy oil recovery</td>
                  </tr>

                  {/* Rod Floating Risk */}
                  <tr className="bg-sage-pale/30">
                    <td className="py-3 px-3 font-semibold text-petroleum-navy flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-sage-green" />
                      <span>Rod Floating Risk</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-alert-red font-bold">{optData.current_window.rod_floating_risk.toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-bold text-sage-dark">{optData.recommended_window.rod_floating_risk.toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-bold text-sage-dark">
                      {optData.rod_risk_delta_pct.toFixed(1)}% (Eliminated)
                    </td>
                    <td className="py-3 px-3 text-petroleum-light">Prevents bottom-reversal impact & string failure</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* EXPLAINABLE OPTIMIZATION: "WHY THIS RECOMMENDATION?" */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-copper" />
                <h3 className="text-lg font-display font-bold text-petroleum-navy">
                  Why This Recommendation? (Engineering Explainability)
                </h3>
              </div>
              <span className="text-xs font-mono text-petroleum-light">
                Physics-Informed Causality Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optData.explanation_points.map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-desert-beige/40 border border-sand-warm/50 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-petroleum-navy text-sand-warm text-xs font-mono font-bold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <h4 className="text-xs font-display font-bold text-petroleum-navy uppercase tracking-wider">
                      {point.title}
                    </h4>
                  </div>
                  <p className="text-xs text-petroleum-deep leading-relaxed pt-1">
                    {point.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
