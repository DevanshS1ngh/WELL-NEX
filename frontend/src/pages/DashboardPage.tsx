import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Droplet,
  Flame,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Clock,
  Compass,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
import { DashboardSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface DashboardPageProps {
  onSelectWell: (id: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectWell }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Querying Baghewala Field Digital Twin telemetry from backend API..." size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error || 'Unable to connect to Well-Nex backend API.'} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header with Field Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
              FIELD TELEMETRY
            </span>
            <span className="text-xs text-petroleum-light font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-muted" /> Bikaner-Nagaur Basin, Western Rajasthan
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Baghewala Field
          </h1>
          <p className="text-sm font-medium text-amber-copper">
            Digital Twin Overview — Jodhpur Sandstone Heavy Oil Reservoir
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-sand-warm text-xs font-semibold text-petroleum-navy hover:bg-sand-light/60 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => navigate('/field-map')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors shadow-soft"
          >
            <span>Open Field Map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Core Backend Metrics (KPI Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Wells */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Active Wells</span>
            <Activity className="w-4 h-4 text-teal-muted" />
          </div>
          <div className="text-2xl font-display font-bold text-petroleum-navy">
            {data.active_wells}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">/ 15</span>
          </div>
          <span className="text-[11px] text-sage-green font-medium mt-1 block">
            Online Lift Units
          </span>
        </div>

        {/* Total Production */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Total Production</span>
            <Droplet className="w-4 h-4 text-amber-copper" />
          </div>
          <div className="text-2xl font-display font-bold text-petroleum-navy">
            {data.total_production.toFixed(1)}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">bpd</span>
          </div>
          <span className="text-[11px] text-petroleum-light font-medium mt-1 block">
            Net Heavy Crude (18° API)
          </span>
        </div>

        {/* Average SOR */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Average SOR</span>
            <Flame className="w-4 h-4 text-amber-copper" />
          </div>
          <div className="text-2xl font-display font-bold text-petroleum-navy">
            {data.average_sor.toFixed(2)}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">m³/m³</span>
          </div>
          <span className="text-[11px] text-petroleum-light font-medium mt-1 block">
            Steam-Oil Ratio
          </span>
        </div>

        {/* Average Energy / Barrel */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Avg Energy / bbl</span>
            <Zap className="w-4 h-4 text-amber-copper" />
          </div>
          <div className="text-2xl font-display font-bold text-petroleum-navy">
            {data.average_energy_per_barrel.toFixed(1)}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-petroleum-light font-medium mt-1 block">
            Lifting + Thermal
          </span>
        </div>

        {/* Equipment Health */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Equipment Health</span>
            <ShieldCheck className="w-4 h-4 text-sage-green" />
          </div>
          <div className="text-2xl font-display font-bold text-sage-dark">
            {data.average_equipment_health.toFixed(1)}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">%</span>
          </div>
          <span className="text-[11px] text-sage-green font-medium mt-1 block">
            Field SRP Reliability
          </span>
        </div>

        {/* Wells Requiring Attention */}
        <div className={`rounded-xl p-4 border shadow-soft-sm ${
          data.wells_requiring_attention > 0
            ? 'bg-alert-pale/40 border-alert-red/30'
            : 'bg-white border-sand-warm/60'
        }`}>
          <div className="flex items-center justify-between text-petroleum-light mb-2">
            <span className="text-xs font-mono font-medium">Requires Attention</span>
            <AlertTriangle className={`w-4 h-4 ${data.wells_requiring_attention > 0 ? 'text-alert-red' : 'text-petroleum-light'}`} />
          </div>
          <div className={`text-2xl font-display font-bold ${data.wells_requiring_attention > 0 ? 'text-alert-dark' : 'text-petroleum-navy'}`}>
            {data.wells_requiring_attention}
            <span className="text-xs font-mono font-normal text-petroleum-light ml-1">wells</span>
          </div>
          <span className={`text-[11px] font-medium mt-1 block ${data.wells_requiring_attention > 0 ? 'text-alert-red font-semibold' : 'text-petroleum-light'}`}>
            {data.wells_requiring_attention > 0 ? 'Rod Float / High Load' : 'All Wells Normal'}
          </span>
        </div>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 30-Day Production & Steam Injection Trend */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-display font-bold text-petroleum-navy">
                Field Production & Thermal Stimulations (Last 30 Days)
              </h3>
              <p className="text-xs text-petroleum-light">
                Aggregate daily heavy crude rate (bpd) alongside cyclic steam injection slugs.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-desert-beige text-petroleum-navy">
              Aggregated SCADA
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.production_trend_30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#163B45" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#163B45" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="steamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B77B45" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B77B45" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE7DA" />
                <XAxis dataKey="day" stroke="#9E8865" fontSize={11} tickFormatter={(val) => `D-${30 - val}`} />
                <YAxis stroke="#9E8865" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#D8C5A3', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    String(name) === 'field_production' ? `${value} bpd` : `${value} m³`,
                    String(name) === 'field_production' ? 'Oil Rate' : 'Steam Slug'
                  ]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="field_production" name="Oil Rate (bpd)" stroke="#163B45" strokeWidth={2.5} fillOpacity={1} fill="url(#prodGradient)" />
                <Area type="step" dataKey="steam_injected_m3" name="Steam Injected (m³)" stroke="#B77B45" strokeWidth={1.5} fillOpacity={1} fill="url(#steamGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Status Distribution */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-petroleum-navy mb-1">
              Field Well Operational Status
            </h3>
            <p className="text-xs text-petroleum-light mb-4">
              Real-time classification based on reservoir cooling and SRP mechanical loading.
            </p>

            <div className="space-y-2.5">
              {Object.entries(data.status_distribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-desert-beige/40 border border-sand-light">
                  <StatusBadge status={status} size="sm" />
                  <span className="text-xs font-mono font-bold text-petroleum-navy">
                    {count} {count === 1 ? 'Well' : 'Wells'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sand-warm/30 text-xs text-petroleum-light">
            <span className="font-semibold text-petroleum-navy">Optimization Trigger: </span>
            Wells marked in Amber/Red are cooling down, causing severe downstroke viscous drag and rod floating risks.
          </div>
        </div>

      </div>

      {/* Attention Wells Section (Direct Link to Digital Twin) */}
      <div className="bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-copper" />
            <h3 className="text-base font-display font-bold text-petroleum-navy">
              Wells Requiring Engineering Attention & Optimization
            </h3>
          </div>
          <span className="text-xs text-petroleum-light font-mono">
            {data.attention_wells.length} wells flagged
          </span>
        </div>

        {data.attention_wells.length === 0 ? (
          <div className="p-6 text-center text-xs text-petroleum-light bg-desert-beige/40 rounded-lg">
            No wells currently require urgent engineering intervention. All sucker rod strings are within normal dynamic limits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.attention_wells.map((well) => (
              <div
                key={well.id}
                className="p-4 rounded-xl border border-sand-warm bg-desert-beige/30 hover:border-petroleum-navy transition-all shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-display font-bold text-petroleum-navy">
                      {well.well_name}
                    </span>
                    <StatusBadge status={well.status} size="sm" />
                  </div>

                  <div className="space-y-1.5 text-xs text-petroleum-light mb-3">
                    <div className="flex justify-between">
                      <span>Reservoir Temp:</span>
                      <span className="font-mono font-semibold text-petroleum-navy">{well.reservoir_temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oil Viscosity:</span>
                      <span className="font-mono font-semibold text-amber-copper">{well.oil_viscosity.toFixed(0)} cP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Rate:</span>
                      <span className="font-mono font-semibold text-petroleum-navy">{well.production_rate.toFixed(1)} bpd</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectWell(well.id);
                    navigate(`/digital-twin/${well.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors shadow-soft-sm group-hover:bg-amber-copper"
                >
                  <span>Open Digital Twin</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Equipment Events Log */}
      <div className="bg-white rounded-xl border border-sand-warm/60 p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-muted" />
            <h3 className="text-base font-display font-bold text-petroleum-navy">
              Live Field Equipment & Mechanical Event Log
            </h3>
          </div>
          <span className="text-xs text-petroleum-light font-mono">
            Latest Telemetry Notifications
          </span>
        </div>

        <div className="divide-y divide-sand-light">
          {data.recent_equipment_events.map((event) => (
            <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    event.severity === 'CRITICAL'
                      ? 'bg-alert-pale text-alert-dark border border-alert-red/30'
                      : event.severity === 'HIGH'
                      ? 'bg-amber-pale text-amber-dark border border-amber-copper/30'
                      : 'bg-sand-light text-petroleum-navy'
                  }`}>
                    {event.severity}
                  </span>
                  <span className="font-mono font-semibold text-petroleum-navy">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-petroleum-light">
                    • Well #{event.well_id}
                  </span>
                </div>
                <p className="text-petroleum-light">
                  {event.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-sand-dark flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.event_date}
                </span>
                <button
                  onClick={() => {
                    onSelectWell(event.well_id);
                    navigate(`/equipment/${event.well_id}`);
                  }}
                  className="px-2.5 py-1 rounded bg-cream-soft border border-sand-warm hover:border-petroleum-navy text-[11px] font-semibold text-petroleum-navy"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
