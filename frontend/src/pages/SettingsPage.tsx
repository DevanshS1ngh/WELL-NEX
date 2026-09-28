import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Sliders,
  SlidersHorizontal,
  Bell,
  Cpu,
  Layers,
  ShieldCheck,
  Info,
  Check,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Droplet,
  Flame,
  Gauge,
  Activity,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import { UserProfile } from '../types';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Load user profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wellnex_user') || sessionStorage.getItem('wellnex_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      id: 1,
      username: 'engineer@wellnex.ai',
      name: 'Operations Engineer',
      role: 'Lead Production & Artificial Lift Engineer',
      email: 'engineer@wellnex.ai',
      field: 'Baghewala Field',
    };
  });

  // Display Preferences
  const [theme, setTheme] = useState<'light' | 'desert' | 'system'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [unitSystem, setUnitSystem] = useState<'oilfield' | 'metric' | 'si'>('oilfield');
  const [showGridlines, setShowGridlines] = useState<boolean>(true);
  const [chartSmoothing, setChartSmoothing] = useState<boolean>(true);

  // Field Configuration
  const [activeField, setActiveField] = useState<string>('Baghewala Heavy Oil Field (Rajasthan)');
  const [defaultWell, setDefaultWell] = useState<string>('BW-01');
  const [productionUnit, setProductionUnit] = useState<string>('bpd');
  const [pressureUnit, setPressureUnit] = useState<string>('bar');
  const [temperatureUnit, setTemperatureUnit] = useState<string>('celsius');
  const [viscosityUnit, setViscosityUnit] = useState<string>('cP');

  // Alert Preferences (Toggles)
  const [alerts, setAlerts] = useState({
    rodFloating: true,
    impactLoading: true,
    pumpUnsetting: true,
    rodFailureRisk: true,
    productionDeviation: true,
    optimizationRecommendation: true,
  });

  // Simulation Preferences
  const [defaultCss, setDefaultCss] = useState({
    steamVolume: 1800,
    injectionPressure: 120,
    injectionDurationDays: 14,
    soakDurationDays: 5,
  });

  const [defaultSrp, setDefaultSrp] = useState({
    spm: 4.5,
    strokeLengthInches: 120,
    vfdFrequencyHz: 42,
  });

  const [simulationAssumptions, setSimulationAssumptions] = useState({
    reservoirThicknessM: 18.5,
    porosityPct: 24,
    rockHeatCapacity: 2.1,
    asphalteneContentPct: 14.5,
  });

  // What-If Lab Preferences
  const [whatIfSettings, setWhatIfSettings] = useState({
    comparisonMode: 'side-by-side',
    autoCalculateTwin: true,
    preserveBaseline: true,
    sensitivitySteps: 5,
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleToggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleResetDefaults = () => {
    setTheme('light');
    setDensity('comfortable');
    setUnitSystem('oilfield');
    setShowGridlines(true);
    setChartSmoothing(true);
    setDefaultWell('BW-01');
    setProductionUnit('bpd');
    setPressureUnit('bar');
    setTemperatureUnit('celsius');
    setViscosityUnit('cP');
    setAlerts({
      rodFloating: true,
      impactLoading: true,
      pumpUnsetting: true,
      rodFailureRisk: true,
      productionDeviation: true,
      optimizationRecommendation: true,
    });
    setDefaultCss({
      steamVolume: 1800,
      injectionPressure: 120,
      injectionDurationDays: 14,
      soakDurationDays: 5,
    });
    setDefaultSrp({
      spm: 4.5,
      strokeLengthInches: 120,
      vfdFrequencyHz: 42,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-sand-warm/60 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
              OPERATIONAL CONFIGURATION
            </span>
            <span className="text-xs font-mono text-petroleum-light">
              User Profile & Engineering Preferences
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Settings & Operational Preferences
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Manage your petroleum engineering profile, display units, simulation baselines, and equipment alert thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-white border border-sand-warm hover:bg-desert-beige/60 text-petroleum-navy text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-petroleum-light" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl bg-petroleum-navy hover:bg-petroleum-dark text-sand-warm text-xs font-bold shadow-soft flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-sage-green" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-copper" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-sage-pale border border-sage-green/40 text-sage-dark text-xs flex items-center gap-2 transition-all">
          <Check className="w-4 h-4 text-sage-dark shrink-0" />
          <span>Engineering preferences and simulation baselines have been updated for this workstation session.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Profile, Display, Field, and Alerts */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 1. PROFILE */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sand-light">
              <div className="w-8 h-8 rounded-lg bg-desert-beige flex items-center justify-center text-petroleum-navy">
                <User className="w-4 h-4 text-amber-copper" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  User Profile
                </h3>
                <span className="text-[11px] text-petroleum-light">Credentials & Field Authorization</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light block mb-0.5">User Name</span>
                <span className="font-bold text-petroleum-navy text-sm">{currentUser.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light block mb-0.5">Engineering Role</span>
                <span className="font-bold text-petroleum-navy text-sm">{currentUser.role}</span>
              </div>

              <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light block mb-0.5">Assigned Asset</span>
                <span className="font-semibold text-petroleum-navy">Baghewala Heavy Oil Field</span>
              </div>

              <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                <span className="text-[10px] font-mono text-petroleum-light block mb-0.5">Operations Account</span>
                <span className="font-mono text-petroleum-deep">{currentUser.username}</span>
              </div>
            </div>
          </div>

          {/* 2. DISPLAY PREFERENCES */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sand-light">
              <div className="w-8 h-8 rounded-lg bg-desert-beige flex items-center justify-center text-petroleum-navy">
                <Monitor className="w-4 h-4 text-teal-muted" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Display Preferences
                </h3>
                <span className="text-[11px] text-petroleum-light">Visual Presentation & Workspace Ergonomics</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Theme selection */}
              <div>
                <label className="font-semibold text-petroleum-navy block mb-1.5">
                  Color Theme (Default: Light Industrial)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Light Petroleum', desc: 'Standard cream / sand' },
                    { id: 'desert', label: 'Desert Sand', desc: 'Warm high-contrast' },
                    { id: 'system', label: 'System Match', desc: 'Follow OS theme' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === t.id
                          ? 'bg-petroleum-navy text-sand-warm border-petroleum-navy font-bold shadow-2xs'
                          : 'bg-desert-beige/30 text-petroleum-navy border-sand-warm/60 hover:bg-desert-beige/60'
                      }`}
                    >
                      <div className="text-xs">{t.label}</div>
                      <div className="text-[10px] opacity-80">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interface density */}
              <div>
                <label className="font-semibold text-petroleum-navy block mb-1.5">
                  Interface Density
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'comfortable', label: 'Comfortable', desc: 'Spacious cards & gauges' },
                    { id: 'compact', label: 'Compact Engineering', desc: 'Higher information density' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDensity(d.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        density === d.id
                          ? 'bg-petroleum-navy text-sand-warm border-petroleum-navy font-bold shadow-2xs'
                          : 'bg-desert-beige/30 text-petroleum-navy border-sand-warm/60 hover:bg-desert-beige/60'
                      }`}
                    >
                      <div className="text-xs">{d.label}</div>
                      <div className="text-[10px] opacity-80">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart preferences */}
              <div className="pt-2 border-t border-sand-light space-y-2">
                <span className="font-semibold text-petroleum-navy block">Chart Preferences</span>
                <div className="flex items-center justify-between">
                  <span className="text-petroleum-light">Render Background Gridlines:</span>
                  <input
                    type="checkbox"
                    checked={showGridlines}
                    onChange={(e) => setShowGridlines(e.target.checked)}
                    className="w-4 h-4 rounded text-petroleum-navy focus:ring-petroleum-navy cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-petroleum-light">Smooth Trend Curves (Monotone):</span>
                  <input
                    type="checkbox"
                    checked={chartSmoothing}
                    onChange={(e) => setChartSmoothing(e.target.checked)}
                    className="w-4 h-4 rounded text-petroleum-navy focus:ring-petroleum-navy cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. FIELD CONFIGURATION */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sand-light">
              <div className="w-8 h-8 rounded-lg bg-desert-beige flex items-center justify-center text-petroleum-navy">
                <Droplet className="w-4 h-4 text-amber-copper" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Field Configuration & Units
                </h3>
                <span className="text-[11px] text-petroleum-light">Regional Reservoir Asset & Measurement Standards</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-petroleum-navy block">Active Field</label>
                <input
                  type="text"
                  value={activeField}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl bg-desert-beige/40 border border-sand-warm/60 font-semibold text-petroleum-navy text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-petroleum-navy block">Default Initial Well</label>
                <select
                  value={defaultWell}
                  onChange={(e) => setDefaultWell(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sand-warm font-semibold text-petroleum-navy text-xs focus:ring-1 focus:ring-petroleum-navy"
                >
                  <option value="BW-01">BW-01 (CSS Active)</option>
                  <option value="BW-02">BW-02 (Soak Phase)</option>
                  <option value="BW-03">BW-03 (High Water Cut)</option>
                  <option value="BW-04">BW-04 (Rod Friction Alert)</option>
                  <option value="BW-05">BW-05 (Stable Producer)</option>
                  <option value="BW-06">BW-06 (Candidate for Re-steam)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-petroleum-navy block">Production Units</label>
                <select
                  value={productionUnit}
                  onChange={(e) => setProductionUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sand-warm font-semibold text-petroleum-navy text-xs"
                >
                  <option value="bpd">bpd (Stock Tank Barrels / Day)</option>
                  <option value="m3d">m³/day (Cubic Metres / Day)</option>
                  <option value="tpd">tonnes/day</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-petroleum-navy block">Pressure & Temperature</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={pressureUnit}
                    onChange={(e) => setPressureUnit(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-sand-warm font-semibold text-petroleum-navy text-xs"
                  >
                    <option value="bar">bar</option>
                    <option value="psi">psi</option>
                    <option value="kPa">kPa</option>
                  </select>
                  <select
                    value={temperatureUnit}
                    onChange={(e) => setTemperatureUnit(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-sand-warm font-semibold text-petroleum-navy text-xs"
                  >
                    <option value="celsius">°C</option>
                    <option value="fahrenheit">°F</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ALERT PREFERENCES */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sand-light">
              <div className="w-8 h-8 rounded-lg bg-desert-beige flex items-center justify-center text-petroleum-navy">
                <Bell className="w-4 h-4 text-alert-red" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Alert Preferences & Surveillance Triggers
                </h3>
                <span className="text-[11px] text-petroleum-light">Automated Mechanical & Production Anomaly Detection</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'rodFloating',
                  label: 'Rod Floating Alerts',
                  desc: 'Notify when downstroke buoyant drag approaches rod string weight (viscous oil resistance).',
                },
                {
                  key: 'impactLoading',
                  label: 'Impact Loading Alerts',
                  desc: 'Trigger alarm when rod compression shock loads exceed 85% of allowable rod stress.',
                },
                {
                  key: 'pumpUnsetting',
                  label: 'Pump Unsetting Alerts',
                  desc: 'Warn if cyclic axial upward friction exceeds mechanical hold-down capacity.',
                },
                {
                  key: 'rodFailureRisk',
                  label: 'Rod Failure Risk Alerts',
                  desc: 'Flag cumulative fatigue cycle accumulation and severe stress reversals.',
                },
                {
                  key: 'productionDeviation',
                  label: 'Production Deviation Alerts',
                  desc: 'Detect unexpected oil rate decline greater than 15% versus post-steam baseline.',
                },
                {
                  key: 'optimizationRecommendation',
                  label: 'Optimization Recommendations',
                  desc: 'Alert when coupled CSS/SRP optimization identifies >10% efficiency upside.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between p-3 rounded-xl bg-desert-beige/30 border border-sand-warm/40 hover:bg-desert-beige/50 transition-colors"
                >
                  <div className="pr-4">
                    <span className="font-bold text-petroleum-navy block text-xs">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-petroleum-light leading-snug">
                      {item.desc}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={alerts[item.key as keyof typeof alerts]}
                      onChange={() => handleToggleAlert(item.key as keyof typeof alerts)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-sand-warm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand-warm after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-petroleum-navy"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Simulation, What-If Lab, Data Transparency, and About */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 5. SIMULATION PREFERENCES */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sand-light">
              <div className="w-8 h-8 rounded-lg bg-desert-beige flex items-center justify-center text-petroleum-navy">
                <Cpu className="w-4 h-4 text-amber-copper" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-petroleum-navy">
                  Simulation Preferences
                </h3>
                <span className="text-[11px] text-petroleum-light">Default CSS & SRP Baseline Physics Parameters</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* CSS Defaults */}
              <div>
                <div className="flex items-center gap-1.5 font-bold text-petroleum-navy mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-copper" />
                  <span>Default CSS Parameters</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Steam Volume</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultCss.steamVolume} m³</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Injection Press.</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultCss.injectionPressure} bar</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Injection Time</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultCss.injectionDurationDays} days</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Soak Time</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultCss.soakDurationDays} days</span>
                  </div>
                </div>
              </div>

              {/* SRP Defaults */}
              <div>
                <div className="flex items-center gap-1.5 font-bold text-petroleum-navy mb-2">
                  <Gauge className="w-3.5 h-3.5 text-teal-muted" />
                  <span>Default SRP Parameters</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Pumping Speed</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultSrp.spm} SPM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">Stroke Length</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultSrp.strokeLengthInches} in</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-desert-beige/40 border border-sand-warm/40">
                    <span className="text-[10px] text-petroleum-light block">VFD Operating Freq.</span>
                    <span className="font-mono font-bold text-petroleum-navy">{defaultSrp.vfdFrequencyHz} Hz</span>
                  </div>
                </div>
              </div>

              {/* Reservoir Assumptions */}
              <div className="pt-2 border-t border-sand-light">
                <span className="font-semibold text-petroleum-navy block mb-2">
                  Jodhpur Sandstone Baseline Assumptions
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-desert-beige/30 border border-sand-warm/30 flex justify-between">
                    <span className="text-petroleum-light">Net Pay Thickness:</span>
                    <span className="font-mono font-bold text-petroleum-navy">18.5 m</span>
                  </div>
                  <div className="p-2 rounded-lg bg-desert-beige/30 border border-sand-warm/30 flex justify-between">
                    <span className="text-petroleum-light">Average Porosity:</span>
                    <span className="font-mono font-bold text-petroleum-navy">24.0%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-desert-beige/30 border border-sand-warm/30 flex justify-between">
                    <span className="text-petroleum-light">Rock Heat Capacity:</span>
                    <span className="font-mono font-bold text-petroleum-navy">2.1 kJ/kg·K</span>
                  </div>
                  <div className="p-2 rounded-lg bg-desert-beige/30 border border-sand-warm/30 flex justify-between">
                    <span className="text-petroleum-light">Asphaltene Content:</span>
                    <span className="font-mono font-bold text-amber-copper">~14.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. WHAT-IF LAB PREFERENCES & DIRECT LAUNCHER */}
          <div className="bg-white rounded-2xl border-2 border-amber-copper/40 p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-pale flex items-center justify-center text-amber-copper">
                  <Layers className="w-4 h-4 text-amber-copper" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-petroleum-navy">
                    What-If Lab Preferences
                  </h3>
                  <span className="text-[11px] text-petroleum-light">Scenario Sandbox Configuration</span>
                </div>
              </div>

              {/* Requirement 11: Direct access to What-If Lab from Settings */}
              <button
                onClick={() => navigate('/what-if')}
                className="px-3 py-1.5 rounded-xl bg-amber-copper hover:bg-amber-warm text-cream-soft text-xs font-bold shadow-soft flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open What-If Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-petroleum-light leading-relaxed">
                Configure default scenario simulation behavior for evaluating thermal recovery (steam volume, pressure, soak)
                alongside artificial lift (SPM, stroke, VFD) before applying adjustments to active wells.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="font-semibold text-petroleum-navy block mb-1">Scenario Comparison Mode</span>
                  <span className="text-[11px] text-petroleum-light">Side-by-side delta visualization with automated delta tagging</span>
                </div>

                <div className="p-3 rounded-xl bg-desert-beige/40 border border-sand-warm/40">
                  <span className="font-semibold text-petroleum-navy block mb-1">Physics Coupling Engine</span>
                  <span className="text-[11px] text-petroleum-light">Coupled Marx-Langenheim thermal decline with Gilbert-Sucker Rod drag</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. DATA & DEMONSTRATION DISCLOSURE */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-light">
              <ShieldCheck className="w-5 h-5 text-amber-copper" />
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                Data Classification & Demonstration Disclosure
              </h3>
            </div>
            
            {/* Exact requirement text */}
            <div className="p-3.5 bg-desert-beige/60 rounded-xl border border-sand-warm/60 text-xs text-petroleum-navy leading-relaxed">
              <p className="font-semibold text-petroleum-navy mb-1">
                This WELL-NEX demonstration uses synthetic/generated data for prototype evaluation.
              </p>
              <p className="text-petroleum-light">
                All well geometry, thermodynamic curves, cyclic steam injection records, and rod mechanical load histories
                are synthetically calibrated to replicate genuine Jodhpur Sandstone reservoir conditions without exposing
                proprietary field telemetry.
              </p>
            </div>
          </div>

          {/* 8. ABOUT WELL-NEX */}
          <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-light">
              <Info className="w-5 h-5 text-petroleum-navy" />
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                About WELL-NEX
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-petroleum-navy text-sm">WELL-NEX</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
                  v1.2.0 (Engineering Edition)
                </span>
              </div>
              <div className="font-medium text-amber-copper">
                Well-to-Surface Intelligence
              </div>
              <p className="text-petroleum-light leading-relaxed">
                Digital Twin for Heavy-Oil Operations. Integrated cyclic steam stimulation (CSS) and sucker rod pump (SRP)
                optimization for heavy oil reservoirs of Baghewala Field, Bikaner-Nagaur Basin, Western Rajasthan.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
