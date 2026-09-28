import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Activity,
  Droplet,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Layers,
  Compass
} from 'lucide-react';
import { api } from '../api/client';
import { FieldOverview } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

// Custom colored map markers using L.divIcon
const createCustomMarker = (color: string) => {
  const bgClass =
    color === 'red'
      ? 'bg-alert-red text-white ring-4 ring-alert-red/30'
      : color === 'amber'
      ? 'bg-amber-copper text-white ring-4 ring-amber-copper/30'
      : 'bg-sage-green text-white ring-4 ring-sage-green/30';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="w-7 h-7 rounded-full ${bgClass} flex items-center justify-center font-mono text-[11px] font-bold shadow-md cursor-pointer transition-transform hover:scale-125">
             <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

interface FieldMapPageProps {
  onSelectWell: (id: number) => void;
}

export const FieldMapPage: React.FC<FieldMapPageProps> = ({ onSelectWell }) => {
  const navigate = useNavigate();
  const [fieldData, setFieldData] = useState<FieldOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchFieldData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getFieldOverview();
      setFieldData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load field map overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading Baghewala Field spatial telemetry from backend..." size="lg" />
      </div>
    );
  }

  if (error || !fieldData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message={error || 'Unable to connect to field telemetry.'} onRetry={fetchFieldData} />
      </div>
    );
  }

  const filteredWells = fieldData.wells.filter((w) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CRITICAL' && w.color === 'red') ||
      (statusFilter === 'ATTENTION' && w.color === 'amber') ||
      (statusFilter === 'NORMAL' && w.color === 'green');

    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Map center: Baghewala Field center (~27.96 N, 72.00 E)
  const mapCenter: [number, number] = [27.9600, 72.0000];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-warm/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sand-light text-petroleum-navy border border-sand-warm">
              GEOSPATIAL DIGITAL TWIN
            </span>
            <span className="text-xs text-petroleum-light font-mono">
              Bikaner-Nagaur Basin, Rajasthan, India
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-petroleum-navy tracking-tight">
            Baghewala Field Well Map
          </h1>
          <p className="text-xs sm:text-sm text-petroleum-light">
            Interactive surface map showing 15 synthetic heavy-oil demonstration wells with live telemetry and thermal-lift status.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-sand-warm/60 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-green" />
            <span className="font-semibold text-petroleum-navy">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-copper" />
            <span className="font-semibold text-petroleum-navy">Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-red" />
            <span className="font-semibold text-petroleum-navy">Critical Alert</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-sand-warm/60 shadow-soft-sm">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-petroleum-light" />
          <input
            type="text"
            placeholder="Search well (e.g. BW-01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium text-petroleum-navy bg-desert-beige/50 border border-sand-warm/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-petroleum-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-petroleum-light" />
          <span className="text-xs font-mono text-petroleum-light">Filter:</span>
          {(['ALL', 'NORMAL', 'ATTENTION', 'CRITICAL'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === opt
                  ? 'bg-petroleum-navy text-sand-warm shadow-xs'
                  : 'bg-desert-beige/50 text-petroleum-navy hover:bg-sand-light'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Map & Well List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-2 border-sand-warm/80 p-2 shadow-soft overflow-hidden h-[540px]">
          <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="w-full h-full rounded-xl">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredWells.map((w) => (
              <Marker
                key={w.id}
                position={[w.latitude, w.longitude]}
                icon={createCustomMarker(w.color)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 min-w-[200px] space-y-2">
                    <div className="flex items-center justify-between border-b border-sand-warm/40 pb-1.5">
                      <span className="font-display font-bold text-petroleum-navy text-sm">
                        {w.name}
                      </span>
                      <StatusBadge status={w.status} size="sm" />
                    </div>

                    <div className="space-y-1 text-xs text-petroleum-light">
                      <div className="flex justify-between">
                        <span>Production:</span>
                        <strong className="text-petroleum-navy">{w.production_bpd.toFixed(1)} bpd</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Temp:</span>
                        <strong className="text-amber-copper">{w.temperature_c.toFixed(1)}°C</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Viscosity:</span>
                        <strong className="text-petroleum-navy">{w.viscosity_cp.toFixed(0)} cP</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Rod Floating Risk:</span>
                        <strong className={w.rod_risk > 35 ? 'text-alert-red' : 'text-sage-dark'}>
                          {w.rod_risk.toFixed(1)}%
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Health Score:</span>
                        <strong className="text-sage-dark">{w.health_score.toFixed(1)}%</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectWell(w.id);
                        navigate(`/digital-twin/${w.id}`);
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-petroleum-navy text-sand-warm text-xs font-semibold hover:bg-petroleum-dark transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open Digital Twin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right Column: Well Telemetry Card List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-sand-warm/70 p-4 shadow-soft space-y-3 max-h-[540px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-sand-light">
            <span className="text-xs font-mono font-bold text-petroleum-navy uppercase">
              Field Well Directory ({filteredWells.length})
            </span>
            <span className="text-[10px] text-petroleum-light font-mono">
              Click to Open Twin
            </span>
          </div>

          <div className="space-y-2">
            {filteredWells.map((w) => (
              <div
                key={w.id}
                onClick={() => {
                  onSelectWell(w.id);
                  navigate(`/digital-twin/${w.id}`);
                }}
                className="p-3 rounded-xl bg-desert-beige/30 hover:bg-sand-light/60 border border-sand-warm/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-xs text-petroleum-navy group-hover:text-amber-copper transition-colors">
                      {w.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      w.color === 'red' ? 'bg-alert-red' : w.color === 'amber' ? 'bg-amber-copper' : 'bg-sage-green'
                    }`} />
                  </div>
                  <div className="text-[11px] text-petroleum-light font-mono space-x-2">
                    <span>{w.production_bpd.toFixed(0)} bpd</span>
                    <span>•</span>
                    <span>{w.temperature_c.toFixed(0)}°C</span>
                    <span>•</span>
                    <span>{w.viscosity_cp.toFixed(0)} cP</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    w.rod_risk > 35 ? 'bg-alert-pale text-alert-dark' : 'bg-sage-pale text-sage-dark'
                  }`}>
                    {w.rod_risk.toFixed(0)}% Risk
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-petroleum-light group-hover:text-petroleum-navy transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
