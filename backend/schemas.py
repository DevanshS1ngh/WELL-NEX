from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Wells
class WellBase(BaseModel):
    well_name: str
    latitude: float
    longitude: float
    reservoir: str = "Jodhpur Sandstone"
    api_gravity: float = 18.0
    reservoir_temperature: float
    reservoir_pressure: float
    oil_viscosity: float
    production_rate: float
    water_cut: float = 15.0
    status: str = "NORMAL"

class WellSummary(WellBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WellDetail(WellSummary):
    latest_css: Optional[Dict[str, Any]] = None
    latest_srp: Optional[Dict[str, Any]] = None
    equipment_alerts_count: int = 0
    health_score: float = 85.0

# CSS
class CssCycleSchema(BaseModel):
    id: int
    well_id: int
    steam_volume: float
    injection_pressure: float
    injection_duration: float
    soak_time: float
    production_cutoff: float
    cycle_number: int
    cycle_start: Optional[str] = None
    cycle_end: Optional[str] = None

    class Config:
        from_attributes = True

class CssSimulationRequest(BaseModel):
    well_id: Optional[int] = None
    steam_volume: float = Field(..., description="Steam volume in m3 CWE (cold water equivalent)", ge=500, le=6000)
    injection_pressure: float = Field(..., description="Steam injection pressure in bar", ge=30, le=180)
    injection_duration: float = Field(..., description="Steam injection duration in days", ge=2, le=30)
    soak_time: float = Field(..., description="Soak time in days", ge=1, le=21)
    production_cutoff: float = Field(..., description="Economic production cut-off in bpd", ge=5, le=50)

class CssSimulationResponse(BaseModel):
    predicted_reservoir_temperature: float
    estimated_viscosity: float
    estimated_oil_mobility: float
    predicted_production: float
    predicted_sor: float
    energy_consumption: float
    recovery_indicator: float
    thermal_radius_m: float
    temperature_trajectory: List[Dict[str, Any]]
    production_trajectory: List[Dict[str, Any]]
    explanation: str

# SRP
class SrpOperationSchema(BaseModel):
    id: int
    well_id: int
    stroke_length: float
    spm: float
    vfd_frequency: float
    pump_efficiency: float
    rod_load: float
    impact_loading: float
    rod_floating_risk: float
    pump_unsetting_risk: float
    recorded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SrpSimulationRequest(BaseModel):
    well_id: Optional[int] = None
    stroke_length: float = Field(..., description="Stroke length in inches", ge=48, le=168)
    spm: float = Field(..., description="Strokes per minute", ge=2.0, le=12.0)
    vfd_frequency: float = Field(..., description="VFD motor frequency in Hz", ge=20.0, le=65.0)

class DynaCardPoint(BaseModel):
    position_pct: float
    surface_load_kn: float
    pump_load_kn: float

class SrpSimulationResponse(BaseModel):
    pump_efficiency: float
    rod_load: float
    impact_loading: float
    rod_floating_risk: float
    pump_unsetting_risk: float
    predicted_production: float
    energy_consumption: float
    rod_floating_severity: str
    dynacard: List[DynaCardPoint]
    analysis_notes: List[str]

# Production History
class ProductionRecordSchema(BaseModel):
    id: int
    well_id: int
    date: str
    oil_production: float
    water_production: float
    steam_injection: float
    energy_consumption: float
    sor: float

    class Config:
        from_attributes = True

# Equipment Events
class EquipmentEventSchema(BaseModel):
    id: int
    well_id: int
    well_name: Optional[str] = None
    event_type: str
    severity: str
    description: str
    event_date: str
    resolved: bool

    class Config:
        from_attributes = True

class EventResolveRequest(BaseModel):
    resolved: bool = True

# Digital Twin Comprehensive State
class DigitalTwinState(BaseModel):
    well_id: int
    well_name: str
    field_name: str = "Baghewala Field"
    reservoir_name: str = "Jodhpur Sandstone"
    status: str
    depth_m: float = 1050.0
    api_gravity: float
    
    # Physics & Flow
    reservoir_temperature: float
    reservoir_pressure: float
    oil_viscosity: float
    oil_mobility_indicator: float
    asphaltene_content: float = 14.8 # %
    
    # Wellbore & Rod
    casing_od_in: float = 7.0
    tubing_od_in: float = 2.875
    rod_grade: str = "Grade D / High Strength"
    rod_diameter_in: float = 1.0
    
    # SRP
    stroke_length: float
    spm: float
    vfd_frequency: float
    pump_efficiency: float
    rod_load_kn: float
    impact_loading_kn: float
    rod_floating_risk_pct: float
    pump_unsetting_risk_pct: float
    
    # CSS Status
    current_css_cycle: int
    steam_volume_m3: float
    days_since_steam: int
    
    # Surface & Performance
    production_rate_bpd: float
    water_cut_pct: float
    energy_kwh_bbl: float
    sor: float
    equipment_health_score: float
    
    dynacard: List[DynaCardPoint]
    physics_chain: List[Dict[str, Any]]
    active_alerts: List[EquipmentEventSchema]

# Optimization
class OptimizeRequest(BaseModel):
    well_id: int
    prioritize: Optional[str] = "BALANCED" # BALANCED, MAX_PRODUCTION, MIN_ENERGY, MIN_EQUIPMENT_STRESS

class ParameterWindow(BaseModel):
    steam_volume: float
    injection_pressure: float
    soak_time: float
    production_cutoff: float
    stroke_length: float
    spm: float
    vfd_frequency: float
    production: float
    sor: float
    energy: float
    pump_efficiency: float
    rod_floating_risk: float
    equipment_health: float

class OptimizationResponse(BaseModel):
    well_id: int
    well_name: str
    current_window: ParameterWindow
    recommended_window: ParameterWindow
    production_delta_pct: float
    sor_delta_pct: float
    energy_delta_pct: float
    rod_risk_delta_pct: float
    optimization_score: float
    why_explanation: str
    explanation_points: List[Dict[str, str]]
    created_at: str

# Field Overview & Dashboard
class FieldOverview(BaseModel):
    field_name: str = "Baghewala Heavy Oil Field"
    basin: str = "Bikaner-Nagaur Basin, Western Rajasthan"
    operator_note: str = "ONGC / Demonstration Digital Twin Prototype"
    total_wells: int
    active_wells: int
    avg_temperature: float
    avg_viscosity: float
    total_field_production: float
    average_sor: float
    average_energy_per_barrel: float
    wells: List[Dict[str, Any]]

class DashboardSummary(BaseModel):
    active_wells: int
    total_production: float
    average_sor: float
    average_energy_per_barrel: float
    average_equipment_health: float
    wells_requiring_attention: int
    status_distribution: Dict[str, int]
    attention_wells: List[WellSummary]
    recent_equipment_events: List[EquipmentEventSchema]
    production_trend_30d: List[Dict[str, Any]]

# Authentication & Demo Accounts
class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    username: str
    name: str
    role: str
    asset: str = "Baghewala Heavy Oil Asset, Rajasthan"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

