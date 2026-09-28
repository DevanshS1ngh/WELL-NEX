export interface WellSummary {
  id: number;
  well_name: string;
  latitude: number;
  longitude: number;
  reservoir: string;
  api_gravity: number;
  reservoir_temperature: number;
  reservoir_pressure: number;
  oil_viscosity: number;
  production_rate: number;
  water_cut: number;
  status: 'NORMAL' | 'ATTENTION_REQUIRED' | 'CRITICAL_ALERT' | 'PEAK_PRODUCTION' | 'SOAKING' | 'STEAM_INJECTION';
  created_at?: string;
}

export interface WellDetail extends WellSummary {
  latest_css?: {
    cycle_number: number;
    steam_volume: number;
    injection_pressure: number;
    soak_time: number;
  };
  latest_srp?: {
    stroke_length: number;
    spm: number;
    vfd_frequency: number;
    pump_efficiency: number;
    rod_floating_risk: number;
  };
  equipment_alerts_count: number;
  health_score: number;
}

export interface ProductionRecord {
  id: number;
  well_id: number;
  date: string;
  oil_production: number;
  water_production: number;
  steam_injection: number;
  energy_consumption: number;
  sor: number;
}

export interface DynaCardPoint {
  position_pct: number;
  surface_load_kn: number;
  pump_load_kn: number;
}

export interface EquipmentEvent {
  id: number;
  well_id: number;
  well_name?: string;
  event_type: 'ROD_FAILURE' | 'ROD_FLOATING' | 'PUMP_UNSETTING' | 'IMPACT_LOADING' | 'MAINTENANCE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  event_date: string;
  resolved: boolean;
}

export interface DigitalTwinState {
  well_id: number;
  well_name: string;
  field_name: string;
  reservoir_name: string;
  status: string;
  depth_m: number;
  api_gravity: number;
  reservoir_temperature: number;
  reservoir_pressure: number;
  oil_viscosity: number;
  oil_mobility_indicator: number;
  asphaltene_content: number;
  casing_od_in: number;
  tubing_od_in: number;
  rod_grade: string;
  rod_diameter_in: number;
  stroke_length: number;
  spm: number;
  vfd_frequency: number;
  pump_efficiency: number;
  rod_load_kn: number;
  impact_loading_kn: number;
  rod_floating_risk_pct: number;
  pump_unsetting_risk_pct: number;
  current_css_cycle: number;
  steam_volume_m3: number;
  days_since_steam: number;
  production_rate_bpd: number;
  water_cut_pct: number;
  energy_kwh_bbl: number;
  sor: number;
  equipment_health_score: number;
  dynacard: DynaCardPoint[];
  physics_chain: {
    step: number;
    layer: string;
    name: string;
    value: string;
    status: string;
    impact: string;
  }[];
  active_alerts: EquipmentEvent[];
}

export interface CssSimulationRequest {
  steam_volume: number;
  injection_pressure: number;
  injection_duration: number;
  soak_time: number;
  production_cutoff: number;
}

export interface CssSimulationResponse {
  predicted_reservoir_temperature: number;
  estimated_viscosity: number;
  estimated_oil_mobility: number;
  predicted_production: number;
  predicted_sor: number;
  energy_consumption: number;
  recovery_indicator: number;
  thermal_radius_m: number;
  temperature_trajectory: { day: number; temperature: number; viscosity: number }[];
  production_trajectory: { day: number; oil_production: number; water_cut: number }[];
  explanation: string;
}

export interface SrpSimulationRequest {
  stroke_length: number;
  spm: number;
  vfd_frequency: number;
}

export interface SrpSimulationResponse {
  pump_efficiency: number;
  rod_load: number;
  impact_loading: number;
  rod_floating_risk: number;
  pump_unsetting_risk: number;
  predicted_production: number;
  energy_consumption: number;
  rod_floating_severity: string;
  dynacard: DynaCardPoint[];
  analysis_notes: string[];
}

export interface ParameterWindow {
  steam_volume: number;
  injection_pressure: number;
  soak_time: number;
  production_cutoff: number;
  stroke_length: number;
  spm: number;
  vfd_frequency: number;
  production: number;
  sor: number;
  energy: number;
  pump_efficiency: number;
  rod_floating_risk: number;
  equipment_health: number;
}

export interface OptimizationResponse {
  well_id: number;
  well_name: string;
  current_window: ParameterWindow;
  recommended_window: ParameterWindow;
  production_delta_pct: number;
  sor_delta_pct: number;
  energy_delta_pct: number;
  rod_risk_delta_pct: number;
  optimization_score: number;
  why_explanation: string;
  explanation_points: { title: string; reason: string }[];
  created_at: string;
}

export interface DashboardSummary {
  active_wells: number;
  total_production: number;
  average_sor: number;
  average_energy_per_barrel: number;
  average_equipment_health: number;
  wells_requiring_attention: number;
  status_distribution: Record<string, number>;
  attention_wells: WellSummary[];
  recent_equipment_events: EquipmentEvent[];
  production_trend_30d: {
    day: number;
    field_production: number;
    steam_injected_m3: number;
    avg_sor: number;
  }[];
}

export interface FieldOverview {
  field_name: string;
  basin: string;
  operator_note: string;
  total_wells: number;
  active_wells: number;
  avg_temperature: number;
  avg_viscosity: number;
  total_field_production: number;
  average_sor: number;
  average_energy_per_barrel: number;
  wells: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    color: string;
    production_bpd: number;
    temperature_c: number;
    viscosity_cp: number;
    rod_risk: number;
    health_score: number;
  }[];
}

export interface UserProfile {
  username: string;
  name: string;
  role: string;
  asset: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

