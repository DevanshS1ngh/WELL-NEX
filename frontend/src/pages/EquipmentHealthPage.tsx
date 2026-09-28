import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Gauge,
  Wrench,
  Clock,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { EquipmentEvent, WellDetail } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface EquipmentHealthPageProps {
  wellId: number;
  onSelectWell: (id: number) => void;
}

export const EquipmentHealthPage: React.FC<EquipmentHealthPageProps> = ({
  wellId: propWellId,
  onSelectWell,
}) => {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? parseInt(id, 10) : propWellId;
  const navigate = useNavigate();

  const [well, setWell] = useState<WellDetail | null>(null);
  const [equipmentData, setEquipmentData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const [wellRes, equipRes] = await Promise.all([
        api.getWell(activeId),
        api.getEquipment(activeId),
      ]);
      setWell(wellRes);
      setEquipmentData(equipRes);
      onSelectWell(activeId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch equipment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [activeId]);

  const handleResolveEvent = async (eventId: number) => {
    try {
      setResolvingId(eventId);
      await api.resolveEquipmentEvent(eventId);
      // Refresh local equipment list
      await fetchEquipment();
    } catch (err: any) {
      alert('Failed to resolve event: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message={`Diagnosing mechanical health for Well #${activeId}...`} />
      </div>
    );
  }

  if (error || !well || !equipmentData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error || 'Unable to load equipment telemetry.'} onRetry={fetchEquipment} />
      </div>
    );
  }

  const activeAlerts: EquipmentEvent[] = equipmentData.events.filter((e: EquipmentEvent) => !e.resolved);
  const resolvedEvents: EquipmentEvent[] = equipmentData.events.filter((e: EquipmentEvent) => e.resolved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
              MECHANICAL INTEGRITY
            </span>
            <span className="text-xs font-mono text-petroleum-light">
              Well: {well.well_name} • Sucker Rod Grade D (1050 m)
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Equipment Reliability & Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Continuous mechanical surveillance of downstroke rod floating, bottom-reversal impact shock, and pump unsetting hazards.
          </p>
        </div>

        <button
          onClick={() => navigate(`/optimization/${activeId}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors shadow-soft"
        >
          <span>Run Mitigating Optimizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Core Mechanical Risk Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Rod Failure Risk */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <span className="text-xs font-mono text-petroleum-light uppercase block">Rod Failure Risk</span>
          <div className="text-2xl font-display font-bold text-petroleum-navy mt-1">
            {equipmentData.rod_failure_risk.toFixed(1)}%
          </div>
          <div className="w-full bg-sand-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                equipmentData.rod_failure_risk > 50 ? 'bg-alert-red' : equipmentData.rod_failure_risk > 25 ? 'bg-amber-copper' : 'bg-sage-green'
              }`}
              style={{ width: `${Math.min(100, equipmentData.rod_failure_risk)}%` }}
            />
          </div>
          <span className="text-[10px] text-petroleum-light block mt-1.5">Composite mechanical stress</span>
        </div>

        {/* Rod Floating Risk */}
        <div className={`rounded-xl p-4 border shadow-soft-sm ${
          equipmentData.rod_floating_risk > 35 ? 'bg-alert-pale/40 border-alert-red/30' : 'bg-white border-sand-warm/60'
        }`}>
          <span className="text-xs font-mono text-petroleum-light uppercase block">Rod Floating Risk</span>
          <div className={`text-2xl font-display font-bold mt-1 ${
            equipmentData.rod_floating_risk > 35 ? 'text-alert-red' : 'text-petroleum-navy'
          }`}>
            {equipmentData.rod_floating_risk.toFixed(1)}%
          </div>
          <div className="w-full bg-sand-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                equipmentData.rod_floating_risk > 50 ? 'bg-alert-red' : equipmentData.rod_floating_risk > 25 ? 'bg-amber-copper' : 'bg-sage-green'
              }`}
              style={{ width: `${Math.min(100, equipmentData.rod_floating_risk)}%` }}
            />
          </div>
          <span className="text-[10px] text-petroleum-light block mt-1.5">Downstroke viscous drag</span>
        </div>

        {/* Impact Loading */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <span className="text-xs font-mono text-petroleum-light uppercase block">Impact Loading</span>
          <div className="text-2xl font-display font-bold text-amber-copper mt-1">
            {equipmentData.impact_loading_kn.toFixed(1)} <span className="text-xs font-normal">kN</span>
          </div>
          <div className="w-full bg-sand-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-copper rounded-full"
              style={{ width: `${Math.min(100, (equipmentData.impact_loading_kn / 30) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-petroleum-light block mt-1.5">Reversal shock force</span>
        </div>

        {/* Pump Unsetting Risk */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <span className="text-xs font-mono text-petroleum-light uppercase block">Pump Unsetting Risk</span>
          <div className="text-2xl font-display font-bold text-petroleum-navy mt-1">
            {equipmentData.pump_unsetting_risk.toFixed(1)}%
          </div>
          <div className="w-full bg-sand-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-teal-muted rounded-full"
              style={{ width: `${Math.min(100, equipmentData.pump_unsetting_risk)}%` }}
            />
          </div>
          <span className="text-[10px] text-petroleum-light block mt-1.5">Upstroke seating friction</span>
        </div>

        {/* Overall Health */}
        <div className="bg-white rounded-xl p-4 border border-sand-warm/60 shadow-soft-sm">
          <span className="text-xs font-mono text-petroleum-light uppercase block">System Health Score</span>
          <div className="text-2xl font-display font-bold text-sage-dark mt-1">
            {equipmentData.overall_health_score.toFixed(1)}%
          </div>
          <div className="w-full bg-sand-light h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-sage-green rounded-full"
              style={{ width: `${Math.min(100, equipmentData.overall_health_score)}%` }}
            />
          </div>
          <span className="text-[10px] text-sage-green block mt-1.5 font-medium">Reliability index</span>
        </div>
      </div>

      {/* Active Mechanical Alerts Section */}
      <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sand-light">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-alert-red" />
            <h3 className="text-base font-display font-bold text-petroleum-navy">
              Active Mechanical Alerts ({activeAlerts.length})
            </h3>
          </div>
          <span className="text-xs text-petroleum-light font-mono">
            Directly actionable by operator
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center bg-desert-beige/30 rounded-xl border border-sand-light space-y-2">
            <ShieldCheck className="w-8 h-8 text-sage-green mx-auto" />
            <h4 className="text-sm font-bold text-petroleum-navy">No Active Mechanical Alerts</h4>
            <p className="text-xs text-petroleum-light">
              All sucker rod loads, stroke speeds, and pump pressures for {well.well_name} are within safe API RP 11L limits.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-alert-red/30 bg-alert-pale/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-alert-red text-white">
                      {alert.severity}
                    </span>
                    <span className="font-mono font-bold text-alert-dark text-xs">
                      {alert.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-petroleum-light flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {alert.event_date}
                    </span>
                  </div>
                  <p className="text-xs text-petroleum-navy leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/optimization/${activeId}`)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-sand-warm text-xs font-semibold text-petroleum-navy hover:bg-sand-light/60 transition-colors"
                  >
                    Adjust SPM / Stroke
                  </button>
                  <button
                    onClick={() => handleResolveEvent(alert.id)}
                    disabled={resolvingId === alert.id}
                    className="px-3.5 py-1.5 rounded-lg bg-sage-green text-cream-soft text-xs font-semibold hover:bg-sage-dark transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resolvingId === alert.id ? 'Resolving...' : 'Acknowledge & Resolve'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Maintenance Log */}
      <div className="bg-white rounded-2xl border border-sand-warm/70 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sand-light">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-teal-muted" />
            <h3 className="text-base font-display font-bold text-petroleum-navy">
              Maintenance & Resolved Event History
            </h3>
          </div>
          <span className="text-xs font-mono text-petroleum-light">
            Database Log
          </span>
        </div>

        {resolvedEvents.length === 0 ? (
          <div className="p-4 text-center text-xs text-petroleum-light bg-desert-beige/20 rounded-lg">
            No historical maintenance events recorded for this well yet.
          </div>
        ) : (
          <div className="divide-y divide-sand-light">
            {resolvedEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-sand-light text-petroleum-navy">
                      {evt.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-petroleum-navy font-medium">
                      {evt.description}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-sand-dark block">
                    Recorded: {evt.event_date}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-green shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
