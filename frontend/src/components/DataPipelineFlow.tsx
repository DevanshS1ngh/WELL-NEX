import React, { useState } from 'react';
import { Database, Cpu, Activity, TrendingUp, Sliders, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  shortDesc: string;
  icon: any;
  color: string;
  details: {
    inputs: string[];
    models: string[];
    outputs: string[];
    baghewalaContext: string;
  };
}

export const DataPipelineFlow: React.FC = () => {
  const stages: StageInfo[] = [
    {
      id: 'historical',
      name: 'Historical Data',
      shortDesc: 'SCADA, Daily Production & CSS Cycles',
      icon: Database,
      color: 'bg-sand-warm text-petroleum-navy',
      details: {
        inputs: ['Daily oil & water rates', 'Steam injection volumes & pressure', 'Pump stroke & SPM logs', 'Bottom-hole temperature surveys'],
        models: ['Data validation & outlier filtering', 'Cumulative liquid accounting', 'SOR historical tracking'],
        outputs: ['Time-series production baseline', 'Historical CSS performance index'],
        baghewalaContext: 'Baghewala wells have multi-cycle CSS histories with declining thermal recovery efficiency over successive cycles.'
      }
    },
    {
      id: 'processing',
      name: 'Data Processing',
      shortDesc: 'Viscosity & Thermal Physics',
      icon: Cpu,
      color: 'bg-teal-muted text-cream-soft',
      details: {
        inputs: ['Wellbore temperature profile', 'Crude API gravity (17-19°)', 'Native formation temp (46-48°C)'],
        models: ['Arrhenius-Walther temperature-viscosity calibration', 'Effective oil mobility calculation', 'Water cut progression'],
        outputs: ['Dynamic viscosity curve (30 cP steam to 4800 cP native)', 'Relative permeability mobility ratio'],
        baghewalaContext: 'Jodhpur Sandstone heavy crude undergoes a 160-fold viscosity drop when stimulated from 46°C to 180°C.'
      }
    },
    {
      id: 'twin',
      name: 'Digital Twin',
      shortDesc: 'Coupled Wellbore-SRP Physics',
      icon: Activity,
      color: 'bg-petroleum-navy text-sand-warm',
      details: {
        inputs: ['Sucker rod string geometry (1050 m, Grade D)', 'Polished rod motion & VFD frequency', 'Viscous fluid column drag'],
        models: ['API RP 11L heavy oil load calculation', 'Downstroke buoyant rod deceleration model', 'Dynamometer card synthesis'],
        outputs: ['Peak Polished Rod Load (PPRL)', 'Downstroke Rod Floating Risk %', 'Reversal Impact Loading (kN)'],
        baghewalaContext: 'Connects reservoir temperature drops to downstroke rod hang-up and severe surface unit impact.'
      }
    },
    {
      id: 'prediction',
      name: 'Prediction',
      shortDesc: 'Production, SOR & Energy Decay',
      icon: TrendingUp,
      color: 'bg-sage-green text-cream-soft',
      details: {
        inputs: ['Current cycle operating state', 'Proposed steam volume / soak duration', 'SRP stroke & SPM candidate'],
        models: ['Thermal conduction/convection radial heat dissipation', 'Pump volumetric filling efficiency', 'Specific energy consumption (kWh/bbl)'],
        outputs: ['90-day production trajectory', 'Predicted cycle SOR', 'Electrical & thermal energy requirement'],
        baghewalaContext: 'Predicts exact timing of economic cut-off and prevents premature CSS cycling or over-steaming.'
      }
    },
    {
      id: 'optimization',
      name: 'Optimization',
      shortDesc: 'Multi-Objective Balanced Window',
      icon: Sliders,
      color: 'bg-amber-copper text-cream-soft',
      details: {
        inputs: ['Safety constraints (Rod floating risk < 25%)', 'Energy budget', 'Production targets'],
        models: ['Pareto-frontier grid optimization', 'Joint CSS-SRP objective function', 'Equipment stress penalization'],
        outputs: ['Optimal steam volume & soak days', 'Optimal stroke length, SPM & VFD Hz', 'Overall optimization score (0-100)'],
        baghewalaContext: 'Finds the sweet spot where thermal stimulation cost matches artificial lift mechanical endurance.'
      }
    },
    {
      id: 'recommendation',
      name: 'Recommendation',
      shortDesc: 'Explainable Closed-Loop Actions',
      icon: CheckCircle2,
      color: 'bg-petroleum-deep text-sand-light',
      details: {
        inputs: ['Optimal parameter vector', 'Physics-causality reasoning chain'],
        models: ['Engineering explainability generator', 'Diagnostic warning evaluator'],
        outputs: ['Actionable setpoints for VFD and steam boiler', 'Detailed "Why?" physical justifications'],
        baghewalaContext: 'Translates reservoir cooling into specific, safe operator instructions (e.g. "Lower SPM to 4.5; lengthen stroke to 120\"").'
      }
    }
  ];

  const [activeStageId, setActiveStageId] = useState<string>('twin');
  const activeStage = stages.find(s => s.id === activeStageId) || stages[2];

  return (
    <div className="bg-white rounded-xl border border-sand-warm/60 p-6 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy">
              ARCHITECTURE
            </span>
            <h3 className="text-lg font-display font-bold text-petroleum-navy">
              Well-to-Surface Closed-Loop Data Flow
            </h3>
          </div>
          <p className="text-xs text-petroleum-light mt-0.5">
            Click on any pipeline stage to inspect the underlying physics models, data inputs, and Baghewala Field engineering context.
          </p>
        </div>
        <span className="text-xs font-medium text-amber-copper bg-amber-pale px-2.5 py-1 rounded-full border border-amber-copper/30 self-start md:self-auto">
          Interactive Pipeline
        </span>
      </div>

      {/* Pipeline Stages Navigation Flow */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = stage.id === activeStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`relative flex flex-col p-3 rounded-lg text-left transition-all duration-200 border ${
                isSelected
                  ? 'border-petroleum-navy bg-desert-beige shadow-md ring-2 ring-petroleum-navy/20 -translate-y-0.5'
                  : 'border-sand-light bg-cream-soft hover:bg-desert-beige/60 hover:border-sand-warm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-md flex items-center justify-center ${stage.color} shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono font-semibold text-petroleum-light">
                  0{idx + 1}
                </span>
              </div>
              <span className="text-xs font-semibold text-petroleum-navy leading-snug line-clamp-1">
                {stage.name}
              </span>
              <span className="text-[10px] text-petroleum-light line-clamp-1 mt-0.5">
                {stage.shortDesc}
              </span>

              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-sand-dark pointer-events-none">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Drawer */}
      <div className="bg-desert-beige/70 rounded-xl p-5 border border-sand-warm/50">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-sand-warm/40">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeStage.color}`}>
            {React.createElement(activeStage.icon, { className: 'w-5 h-5' })}
          </div>
          <div>
            <h4 className="text-base font-display font-bold text-petroleum-navy">
              Stage: {activeStage.name}
            </h4>
            <p className="text-xs text-petroleum-light">
              {activeStage.shortDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3.5 border border-sand-warm/30 shadow-xs">
            <span className="text-[11px] font-mono font-bold text-petroleum-light uppercase tracking-wider block mb-2">
              Primary Inputs
            </span>
            <ul className="space-y-1.5 text-xs text-petroleum-navy">
              {activeStage.details.inputs.map((inp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-copper mt-0.5 font-bold">•</span>
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-sand-warm/30 shadow-xs">
            <span className="text-[11px] font-mono font-bold text-petroleum-light uppercase tracking-wider block mb-2">
              Models & Calculations
            </span>
            <ul className="space-y-1.5 text-xs text-petroleum-navy">
              {activeStage.details.models.map((mod, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-teal-muted mt-0.5 font-bold">•</span>
                  <span>{mod}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-sand-warm/30 shadow-xs">
            <span className="text-[11px] font-mono font-bold text-petroleum-light uppercase tracking-wider block mb-2">
              Generated Outputs
            </span>
            <ul className="space-y-1.5 text-xs text-petroleum-navy">
              {activeStage.details.outputs.map((out, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-sage-green mt-0.5 font-bold">•</span>
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-sand-light/60 rounded-lg p-3 border border-sand-warm/40 text-xs text-petroleum-deep">
          <Info className="w-4 h-4 text-petroleum-light shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-petroleum-navy">Baghewala Reservoir Context: </span>
            {activeStage.details.baghewalaContext}
          </div>
        </div>
      </div>
    </div>
  );
};
