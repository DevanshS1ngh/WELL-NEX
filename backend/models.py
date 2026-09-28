from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_name = Column(String(50), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    reservoir = Column(String(100), default="Jodhpur Sandstone")
    api_gravity = Column(Float, default=18.0) # 17 - 19 API
    reservoir_temperature = Column(Float, nullable=False) # deg C
    reservoir_pressure = Column(Float, nullable=False) # bar
    oil_viscosity = Column(Float, nullable=False) # cP
    production_rate = Column(Float, nullable=False) # bpd
    water_cut = Column(Float, default=15.0) # %
    status = Column(String(50), default="NORMAL") # NORMAL, ATTENTION_REQUIRED, CRITICAL_ALERT, PEAK_PRODUCTION, SOAKING, STEAM_INJECTION
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    css_cycles = relationship("CssCycle", back_populates="well", cascade="all, delete-orphan")
    srp_operations = relationship("SrpOperation", back_populates="well", cascade="all, delete-orphan")
    production_history = relationship("ProductionHistory", back_populates="well", cascade="all, delete-orphan")
    equipment_events = relationship("EquipmentEvent", back_populates="well", cascade="all, delete-orphan")
    optimization_results = relationship("OptimizationResult", back_populates="well", cascade="all, delete-orphan")


class CssCycle(Base):
    __tablename__ = "css_cycles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_id = Column(Integer, ForeignKey("wells.id"), nullable=False)
    steam_volume = Column(Float, nullable=False) # m3 cold water equivalent
    injection_pressure = Column(Float, nullable=False) # bar
    injection_duration = Column(Float, nullable=False) # days
    soak_time = Column(Float, nullable=False) # days
    production_cutoff = Column(Float, nullable=False) # bpd cut-off
    cycle_number = Column(Integer, nullable=False, default=1)
    cycle_start = Column(String(50), nullable=True)
    cycle_end = Column(String(50), nullable=True)

    well = relationship("Well", back_populates="css_cycles")


class SrpOperation(Base):
    __tablename__ = "srp_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_id = Column(Integer, ForeignKey("wells.id"), nullable=False)
    stroke_length = Column(Float, nullable=False) # inches (e.g. 84 - 144)
    spm = Column(Float, nullable=False) # strokes per minute (e.g. 3.5 - 9.0)
    vfd_frequency = Column(Float, nullable=False) # Hz (e.g. 30 - 60 Hz)
    pump_efficiency = Column(Float, nullable=False) # % (e.g. 60 - 92%)
    rod_load = Column(Float, nullable=False) # kN (e.g. 60 - 130 kN)
    impact_loading = Column(Float, nullable=False) # kN or risk metric
    rod_floating_risk = Column(Float, nullable=False) # 0 - 100 %
    pump_unsetting_risk = Column(Float, nullable=False) # 0 - 100 %
    recorded_at = Column(DateTime, default=datetime.utcnow)

    well = relationship("Well", back_populates="srp_operations")


class ProductionHistory(Base):
    __tablename__ = "production_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_id = Column(Integer, ForeignKey("wells.id"), nullable=False)
    date = Column(String(50), nullable=False) # YYYY-MM-DD
    oil_production = Column(Float, nullable=False) # bpd
    water_production = Column(Float, nullable=False) # bpd
    steam_injection = Column(Float, default=0.0) # m3
    energy_consumption = Column(Float, nullable=False) # kWh/bbl
    sor = Column(Float, default=0.0) # m3 steam / m3 oil

    well = relationship("Well", back_populates="production_history")


class EquipmentEvent(Base):
    __tablename__ = "equipment_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_id = Column(Integer, ForeignKey("wells.id"), nullable=False)
    event_type = Column(String(50), nullable=False) # ROD_FAILURE, ROD_FLOATING, PUMP_UNSETTING, IMPACT_LOADING, MAINTENANCE
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    description = Column(Text, nullable=False)
    event_date = Column(String(50), nullable=False)
    resolved = Column(Boolean, default=False)

    well = relationship("Well", back_populates="equipment_events")


class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    well_id = Column(Integer, ForeignKey("wells.id"), nullable=False)
    current_production = Column(Float, nullable=False)
    predicted_production = Column(Float, nullable=False)
    recommended_steam_volume = Column(Float, nullable=False)
    recommended_soak_time = Column(Float, nullable=False)
    recommended_stroke = Column(Float, nullable=False)
    recommended_spm = Column(Float, nullable=False)
    recommended_vfd = Column(Float, nullable=False)
    predicted_sor = Column(Float, nullable=False)
    predicted_energy = Column(Float, nullable=False)
    rod_failure_risk = Column(Float, nullable=False)
    optimization_score = Column(Float, nullable=False) # 0 - 100
    why_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    well = relationship("Well", back_populates="optimization_results")
