import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, Base, get_db, SessionLocal
from models import Well, CssCycle, SrpOperation, ProductionHistory, EquipmentEvent, OptimizationResult
import schemas
from digital_twin import (
    calculate_oil_viscosity,
    calculate_oil_mobility,
    simulate_css_cycle,
    simulate_srp_dynamics
)
from optimizer import optimize_well_operations
from seed import seed_database

# Create tables on startup if not present
Base.metadata.create_all(bind=engine)

# Auto seed if empty
db_check = SessionLocal()
try:
    if db_check.query(Well).count() == 0:
        seed_database()
finally:
    db_check.close()

app = FastAPI(
    title="WELL-NEX: Well-to-Surface Intelligence API",
    description=(
        "Engineering Digital Twin prototype for Cyclic Steam Stimulation (CSS) and "
        "Sucker Rod Pump (SRP) coupled optimization in heavy oil wells of Baghewala Field, Rajasthan. "
        "Demonstration / Synthetic Data."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware with configurable deployment origins and local development fallback
cors_env = os.getenv("CORS_ORIGINS") or os.getenv("FRONTEND_URL")
if cors_env:
    allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. HEALTH & METADATA
# ==============================================================================
@app.get("/", tags=["Health"])
@app.get("/api", tags=["Health"])
def api_root():
    return {
        "status": "healthy",
        "service": "WELL-NEX Digital Twin Engine",
        "field": "Baghewala Field, Bikaner-Nagaur Basin",
        "reservoir": "Jodhpur Sandstone",
        "data_classification": "Demonstration / Synthetic Data",
        "docs": "/docs",
        "health": "/api/health",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "WELL-NEX Digital Twin Engine",
        "field": "Baghewala Field, Bikaner-Nagaur Basin",
        "reservoir": "Jodhpur Sandstone",
        "data_classification": "Demonstration / Synthetic Data",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==============================================================================
# 2. WELLS
# ==============================================================================
@app.get("/api/wells", response_model=List[schemas.WellSummary], tags=["Wells"])
def get_wells(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Well)
    if status_filter:
        query = query.filter(Well.status == status_filter)
    wells = query.order_by(Well.id).all()
    return wells

@app.get("/api/wells/{well_id}", response_model=schemas.WellDetail, tags=["Wells"])
def get_well(well_id: int, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well ID {well_id} not found")
        
    latest_css = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(desc(CssCycle.cycle_number)).first()
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    unresolved_events = db.query(EquipmentEvent).filter(EquipmentEvent.well_id == well_id, EquipmentEvent.resolved == False).count()
    
    # Calculate health score: 100 base minus risks
    srp_risk = latest_srp.rod_floating_risk if latest_srp else 15.0
    impact = latest_srp.impact_loading if latest_srp else 10.0
    health_score = max(10.0, round(100.0 - (srp_risk * 0.5 + impact * 0.8 + unresolved_events * 10.0), 1))
    
    return schemas.WellDetail(
        id=well.id,
        well_name=well.well_name,
        latitude=well.latitude,
        longitude=well.longitude,
        reservoir=well.reservoir,
        api_gravity=well.api_gravity,
        reservoir_temperature=well.reservoir_temperature,
        reservoir_pressure=well.reservoir_pressure,
        oil_viscosity=well.oil_viscosity,
        production_rate=well.production_rate,
        water_cut=well.water_cut,
        status=well.status,
        created_at=well.created_at,
        latest_css={
            "cycle_number": latest_css.cycle_number if latest_css else 1,
            "steam_volume": latest_css.steam_volume if latest_css else 2200.0,
            "injection_pressure": latest_css.injection_pressure if latest_css else 100.0,
            "soak_time": latest_css.soak_time if latest_css else 6.0,
        } if latest_css else None,
        latest_srp={
            "stroke_length": latest_srp.stroke_length if latest_srp else 100.0,
            "spm": latest_srp.spm if latest_srp else 6.0,
            "vfd_frequency": latest_srp.vfd_frequency if latest_srp else 45.0,
            "pump_efficiency": latest_srp.pump_efficiency if latest_srp else 80.0,
            "rod_floating_risk": latest_srp.rod_floating_risk if latest_srp else 15.0,
        } if latest_srp else None,
        equipment_alerts_count=unresolved_events,
        health_score=health_score
    )

# ==============================================================================
# 3. PRODUCTION HISTORY
# ==============================================================================
@app.get("/api/wells/{well_id}/production", response_model=List[schemas.ProductionRecordSchema], tags=["Production"])
def get_well_production(well_id: int, limit: int = 30, db: Session = Depends(get_db)):
    records = db.query(ProductionHistory).filter(ProductionHistory.well_id == well_id)\
                .order_by(desc(ProductionHistory.date))\
                .limit(limit)\
                .all()
    # Return in chronological order
    return list(reversed(records))

# ==============================================================================
# 4. CSS (CYCLIC STEAM STIMULATION)
# ==============================================================================
@app.get("/api/wells/{well_id}/css", tags=["CSS"])
def get_well_css(well_id: int, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    cycles = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(CssCycle.cycle_number).all()
    latest_cycle = cycles[-1] if cycles else None
    
    return {
        "well_id": well.id,
        "well_name": well.well_name,
        "current_temperature": well.reservoir_temperature,
        "current_viscosity": well.oil_viscosity,
        "total_cycles_completed": len(cycles),
        "latest_cycle": latest_cycle,
        "cycles": cycles
    }

@app.post("/api/wells/{well_id}/css/simulate", response_model=schemas.CssSimulationResponse, tags=["CSS"])
def simulate_css(
    well_id: int,
    request: schemas.CssSimulationRequest,
    db: Session = Depends(get_db)
):
    well = db.query(Well).filter(Well.id == well_id).first()
    api_grav = well.api_gravity if well else 18.0
    
    sim_result = simulate_css_cycle(
        steam_volume_m3=request.steam_volume,
        injection_pressure_bar=request.injection_pressure,
        injection_duration_days=request.injection_duration,
        soak_time_days=request.soak_time,
        production_cutoff_bpd=request.production_cutoff,
        native_temp_c=47.0,
        api_gravity=api_grav
    )
    return schemas.CssSimulationResponse(**sim_result)

@app.post("/api/wells/{well_id}/css/apply", tags=["CSS"])
def apply_css_simulation(
    well_id: int,
    request: schemas.CssSimulationRequest,
    db: Session = Depends(get_db)
):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    sim_result = simulate_css_cycle(
        steam_volume_m3=request.steam_volume,
        injection_pressure_bar=request.injection_pressure,
        injection_duration_days=request.injection_duration,
        soak_time_days=request.soak_time,
        production_cutoff_bpd=request.production_cutoff,
        native_temp_c=47.0,
        api_gravity=well.api_gravity
    )
    
    # Update well status and parameters with simulation result
    well.reservoir_temperature = sim_result["predicted_reservoir_temperature"]
    well.oil_viscosity = sim_result["estimated_viscosity"]
    well.production_rate = sim_result["predicted_production"]
    well.status = "PEAK_PRODUCTION" if well.reservoir_temperature > 110 else "NORMAL"
    
    # Add new CSS cycle record
    latest_c = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(desc(CssCycle.cycle_number)).first()
    next_num = (latest_c.cycle_number + 1) if latest_c else 1
    new_cycle = CssCycle(
        well_id=well.id,
        steam_volume=request.steam_volume,
        injection_pressure=request.injection_pressure,
        injection_duration=request.injection_duration,
        soak_time=request.soak_time,
        production_cutoff=request.production_cutoff,
        cycle_number=next_num,
        cycle_start=datetime.now().strftime("%Y-%m-%d"),
        cycle_end=None
    )
    db.add(new_cycle)
    db.commit()
    db.refresh(well)
    
    return {
        "message": f"CSS simulation successfully applied to {well.well_name} digital twin.",
        "well_name": well.well_name,
        "new_temperature": well.reservoir_temperature,
        "new_viscosity": well.oil_viscosity,
        "new_production": well.production_rate
    }

# ==============================================================================
# 5. SRP (SUCKER ROD PUMP)
# ==============================================================================
@app.get("/api/wells/{well_id}/srp", tags=["SRP"])
def get_well_srp(well_id: int, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    if not latest_srp:
        # Default fallback
        sim = simulate_srp_dynamics(100.0, 6.0, 45.0, well.oil_viscosity)
        latest_srp = SrpOperation(
            well_id=well.id,
            stroke_length=100.0,
            spm=6.0,
            vfd_frequency=45.0,
            pump_efficiency=sim["pump_efficiency"],
            rod_load=sim["rod_load"],
            impact_loading=sim["impact_loading"],
            rod_floating_risk=sim["rod_floating_risk"],
            pump_unsetting_risk=sim["pump_unsetting_risk"]
        )
    else:
        sim = simulate_srp_dynamics(
            stroke_length_in=latest_srp.stroke_length,
            spm=latest_srp.spm,
            vfd_frequency_hz=latest_srp.vfd_frequency,
            oil_viscosity_cp=well.oil_viscosity
        )
        
    return {
        "well_id": well.id,
        "well_name": well.well_name,
        "stroke_length": latest_srp.stroke_length,
        "spm": latest_srp.spm,
        "vfd_frequency": latest_srp.vfd_frequency,
        "pump_efficiency": latest_srp.pump_efficiency,
        "rod_load": latest_srp.rod_load,
        "impact_loading": latest_srp.impact_loading,
        "rod_floating_risk": latest_srp.rod_floating_risk,
        "pump_unsetting_risk": latest_srp.pump_unsetting_risk,
        "rod_floating_severity": sim["rod_floating_severity"],
        "dynacard": sim["dynacard"],
        "analysis_notes": sim["analysis_notes"]
    }

@app.post("/api/wells/{well_id}/srp/simulate", response_model=schemas.SrpSimulationResponse, tags=["SRP"])
def simulate_srp(
    well_id: int,
    request: schemas.SrpSimulationRequest,
    db: Session = Depends(get_db)
):
    well = db.query(Well).filter(Well.id == well_id).first()
    visc = well.oil_viscosity if well else 2500.0
    
    sim_res = simulate_srp_dynamics(
        stroke_length_in=request.stroke_length,
        spm=request.spm,
        vfd_frequency_hz=request.vfd_frequency,
        oil_viscosity_cp=visc
    )
    return schemas.SrpSimulationResponse(**sim_res)

@app.post("/api/wells/{well_id}/srp/apply", tags=["SRP"])
def apply_srp_simulation(
    well_id: int,
    request: schemas.SrpSimulationRequest,
    db: Session = Depends(get_db)
):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    sim_res = simulate_srp_dynamics(
        stroke_length_in=request.stroke_length,
        spm=request.spm,
        vfd_frequency_hz=request.vfd_frequency,
        oil_viscosity_cp=well.oil_viscosity
    )
    
    # Record updated SRP operation
    new_srp = SrpOperation(
        well_id=well.id,
        stroke_length=request.stroke_length,
        spm=request.spm,
        vfd_frequency=request.vfd_frequency,
        pump_efficiency=sim_res["pump_efficiency"],
        rod_load=sim_res["rod_load"],
        impact_loading=sim_res["impact_loading"],
        rod_floating_risk=sim_res["rod_floating_risk"],
        pump_unsetting_risk=sim_res["pump_unsetting_risk"]
    )
    db.add(new_srp)
    
    # If rod floating was severe and user lowered SPM, update well status
    if sim_res["rod_floating_risk"] < 25.0 and well.status in ["CRITICAL_ALERT", "ATTENTION_REQUIRED"]:
        well.status = "NORMAL"
    elif sim_res["rod_floating_risk"] >= 65.0:
        well.status = "CRITICAL_ALERT"
    elif sim_res["rod_floating_risk"] >= 35.0:
        well.status = "ATTENTION_REQUIRED"
        
    db.commit()
    
    return {
        "message": f"SRP parameters updated for {well.well_name}.",
        "new_spm": request.spm,
        "new_stroke": request.stroke_length,
        "rod_floating_risk": sim_res["rod_floating_risk"],
        "well_status": well.status
    }

# ==============================================================================
# 6. EQUIPMENT HEALTH & ALERTS
# ==============================================================================
@app.get("/api/wells/{well_id}/equipment", tags=["Equipment"])
def get_well_equipment(well_id: int, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    events = db.query(EquipmentEvent).filter(EquipmentEvent.well_id == well_id).order_by(desc(EquipmentEvent.id)).all()
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    
    rod_risk = latest_srp.rod_floating_risk if latest_srp else 12.0
    impact = latest_srp.impact_loading if latest_srp else 8.0
    unsetting = latest_srp.pump_unsetting_risk if latest_srp else 10.0
    efficiency = latest_srp.pump_efficiency if latest_srp else 82.0
    
    return {
        "well_id": well.id,
        "well_name": well.well_name,
        "rod_failure_risk": round(rod_risk * 0.8 + (impact / 30.0) * 20.0, 1),
        "rod_floating_risk": rod_risk,
        "impact_loading_kn": impact,
        "pump_unsetting_risk": unsetting,
        "pump_efficiency": efficiency,
        "overall_health_score": max(15.0, round(100.0 - (rod_risk * 0.5 + impact * 0.9), 1)),
        "events": events
    }

@app.patch("/api/equipment/{event_id}/resolve", tags=["Equipment"])
def resolve_equipment_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(EquipmentEvent).filter(EquipmentEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.resolved = True
    db.commit()
    return {"message": f"Event {event_id} resolved successfully", "event": event}

# ==============================================================================
# 7. DIGITAL TWIN (COUPLED WELL-TO-SURFACE ENGINE)
# ==============================================================================
@app.get("/api/wells/{well_id}/digital-twin", response_model=schemas.DigitalTwinState, tags=["Digital Twin"])
def get_digital_twin_state(well_id: int, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    latest_css = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(desc(CssCycle.cycle_number)).first()
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    active_alerts = db.query(EquipmentEvent).filter(EquipmentEvent.well_id == well_id, EquipmentEvent.resolved == False).all()
    
    stroke = latest_srp.stroke_length if latest_srp else 100.0
    spm = latest_srp.spm if latest_srp else 6.0
    vfd_hz = latest_srp.vfd_frequency if latest_srp else 45.0
    
    srp_sim = simulate_srp_dynamics(
        stroke_length_in=stroke,
        spm=spm,
        vfd_frequency_hz=vfd_hz,
        oil_viscosity_cp=well.oil_viscosity
    )
    
    mobility = calculate_oil_mobility(well.oil_viscosity)
    cum_oil_m3 = max(well.production_rate * 75.0 * 0.158987, 10.0)
    steam_v = latest_css.steam_volume if latest_css else 2200.0
    sor = round(steam_v / cum_oil_m3, 2)
    sor = max(1.8, min(6.5, sor))
    
    health_score = max(15.0, round(100.0 - (srp_sim["rod_floating_risk"] * 0.5 + srp_sim["impact_loading"] * 0.8 + len(active_alerts) * 8.0), 1))
    
    # Physics chain causality data for interactive UI node tracking
    physics_chain = [
        {
            "step": 1,
            "layer": "Reservoir",
            "name": "Jodhpur Sandstone Temp",
            "value": f"{well.reservoir_temperature:.1f} °C",
            "status": "Optimal" if well.reservoir_temperature > 100 else ("Warning" if well.reservoir_temperature < 60 else "Moderate"),
            "impact": "Controls thermal kinetic energy and crude molecular bonding."
        },
        {
            "step": 2,
            "layer": "Fluid Properties",
            "name": "Crude Viscosity",
            "value": f"{well.oil_viscosity:.0f} cP",
            "status": "Critical" if well.oil_viscosity > 3000 else ("Warning" if well.oil_viscosity > 1000 else "Good"),
            "impact": "Governs downstroke viscous drag and Darcy reservoir flow."
        },
        {
            "step": 3,
            "layer": "Flow Dynamics",
            "name": "Oil Mobility Index",
            "value": f"{mobility:.3f} mD/cP",
            "status": "Good" if mobility > 0.4 else "Poor",
            "impact": "Determines near-wellbore inflow potential into pump intake."
        },
        {
            "step": 4,
            "layer": "Wellbore Mechanics",
            "name": "Rod String Drag & Float Risk",
            "value": f"{srp_sim['rod_floating_risk']:.1f} %",
            "status": srp_sim["rod_floating_severity"],
            "impact": "Opposes downward rod descent, triggering buckling and impact load."
        },
        {
            "step": 5,
            "layer": "Subsurface Pump",
            "name": "SRP Volumetric Efficiency",
            "value": f"{srp_sim['pump_efficiency']:.1f} %",
            "status": "Good" if srp_sim['pump_efficiency'] > 75 else "Warning",
            "impact": "Ratio of lifted heavy oil volume to swept plunger displacement."
        },
        {
            "step": 6,
            "layer": "Surface Production",
            "name": "Production & SOR",
            "value": f"{well.production_rate:.1f} bpd | SOR {sor:.2f}",
            "status": "Good" if well.production_rate > 70 else "Attention",
            "impact": "Net economic recovery efficiency and steam utilization."
        }
    ]
    
    return schemas.DigitalTwinState(
        well_id=well.id,
        well_name=well.well_name,
        status=well.status,
        api_gravity=well.api_gravity,
        reservoir_temperature=well.reservoir_temperature,
        reservoir_pressure=well.reservoir_pressure,
        oil_viscosity=well.oil_viscosity,
        oil_mobility_indicator=mobility,
        stroke_length=stroke,
        spm=spm,
        vfd_frequency=vfd_hz,
        pump_efficiency=srp_sim["pump_efficiency"],
        rod_load_kn=srp_sim["rod_load"],
        impact_loading_kn=srp_sim["impact_loading"],
        rod_floating_risk_pct=srp_sim["rod_floating_risk"],
        pump_unsetting_risk_pct=srp_sim["pump_unsetting_risk"],
        current_css_cycle=latest_css.cycle_number if latest_css else 1,
        steam_volume_m3=steam_v,
        days_since_steam=34,
        production_rate_bpd=well.production_rate,
        water_cut_pct=well.water_cut,
        energy_kwh_bbl=srp_sim["energy_consumption"],
        sor=sor,
        equipment_health_score=health_score,
        dynacard=srp_sim["dynacard"],
        physics_chain=physics_chain,
        active_alerts=[
            schemas.EquipmentEventSchema(
                id=a.id,
                well_id=a.well_id,
                well_name=well.well_name,
                event_type=a.event_type,
                severity=a.severity,
                description=a.description,
                event_date=a.event_date,
                resolved=a.resolved
            ) for a in active_alerts
        ]
    )

# ==============================================================================
# 8. OPTIMIZATION
# ==============================================================================
@app.post("/api/wells/{well_id}/optimize", response_model=schemas.OptimizationResponse, tags=["Optimization"])
def run_well_optimization(
    well_id: int,
    request: Optional[schemas.OptimizeRequest] = None,
    db: Session = Depends(get_db)
):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    latest_css = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(desc(CssCycle.cycle_number)).first()
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    
    priority = request.prioritize if request and request.prioritize else "BALANCED"
    
    opt_result = optimize_well_operations(
        well_data={
            "id": well.id,
            "well_name": well.well_name,
            "reservoir_temperature": well.reservoir_temperature,
            "oil_viscosity": well.oil_viscosity,
            "production_rate": well.production_rate,
            "api_gravity": well.api_gravity
        },
        current_css={
            "steam_volume": latest_css.steam_volume if latest_css else 2200.0,
            "injection_pressure": latest_css.injection_pressure if latest_css else 100.0,
            "soak_time": latest_css.soak_time if latest_css else 6.0,
            "production_cutoff": latest_css.production_cutoff if latest_css else 12.0
        },
        current_srp={
            "stroke_length": latest_srp.stroke_length if latest_srp else 100.0,
            "spm": latest_srp.spm if latest_srp else 6.5,
            "vfd_frequency": latest_srp.vfd_frequency if latest_srp else 45.0
        },
        priority=priority
    )
    
    # Save optimization history to DB
    new_opt_record = OptimizationResult(
        well_id=well.id,
        current_production=opt_result["current_window"].production,
        predicted_production=opt_result["recommended_window"].production,
        recommended_steam_volume=opt_result["recommended_window"].steam_volume,
        recommended_soak_time=opt_result["recommended_window"].soak_time,
        recommended_stroke=opt_result["recommended_window"].stroke_length,
        recommended_spm=opt_result["recommended_window"].spm,
        recommended_vfd=opt_result["recommended_window"].vfd_frequency,
        predicted_sor=opt_result["recommended_window"].sor,
        predicted_energy=opt_result["recommended_window"].energy,
        rod_failure_risk=opt_result["recommended_window"].rod_floating_risk,
        optimization_score=opt_result["optimization_score"],
        why_explanation=opt_result["why_explanation"],
        created_at=datetime.utcnow()
    )
    db.add(new_opt_record)
    db.commit()
    
    return schemas.OptimizationResponse(
        well_id=well.id,
        well_name=well.well_name,
        current_window=opt_result["current_window"],
        recommended_window=opt_result["recommended_window"],
        production_delta_pct=opt_result["production_delta_pct"],
        sor_delta_pct=opt_result["sor_delta_pct"],
        energy_delta_pct=opt_result["energy_delta_pct"],
        rod_risk_delta_pct=opt_result["rod_risk_delta_pct"],
        optimization_score=opt_result["optimization_score"],
        why_explanation=opt_result["why_explanation"],
        explanation_points=opt_result["explanation_points"],
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )

@app.get("/api/wells/{well_id}/optimization/latest", tags=["Optimization"])
def get_latest_optimization(well_id: int, db: Session = Depends(get_db)):
    opt = db.query(OptimizationResult).filter(OptimizationResult.well_id == well_id).order_by(desc(OptimizationResult.id)).first()
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
        
    if not opt:
        # Run optimization on demand if none exists
        return run_well_optimization(well_id=well_id, db=db)
        
    latest_css = db.query(CssCycle).filter(CssCycle.well_id == well_id).order_by(desc(CssCycle.cycle_number)).first()
    latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == well_id).order_by(desc(SrpOperation.id)).first()
    
    return {
        "well_id": well.id,
        "well_name": well.well_name,
        "current_production": opt.current_production,
        "predicted_production": opt.predicted_production,
        "recommended_steam_volume": opt.recommended_steam_volume,
        "recommended_soak_time": opt.recommended_soak_time,
        "recommended_stroke": opt.recommended_stroke,
        "recommended_spm": opt.recommended_spm,
        "recommended_vfd": opt.recommended_vfd,
        "predicted_sor": opt.predicted_sor,
        "predicted_energy": opt.predicted_energy,
        "rod_failure_risk": opt.rod_failure_risk,
        "optimization_score": opt.optimization_score,
        "why_explanation": opt.why_explanation,
        "created_at": opt.created_at.strftime("%Y-%m-%d %H:%M:%S") if opt.created_at else None
    }

# ==============================================================================
# 9. FIELD OVERVIEW & DASHBOARD SUMMARY
# ==============================================================================
@app.get("/api/field/overview", response_model=schemas.FieldOverview, tags=["Field"])
def get_field_overview(db: Session = Depends(get_db)):
    wells = db.query(Well).all()
    if not wells:
        return schemas.FieldOverview(
            total_wells=0, active_wells=0, avg_temperature=47.0, avg_viscosity=4800.0,
            total_field_production=0.0, average_sor=0.0, average_energy_per_barrel=0.0, wells=[]
        )
        
    active_count = sum(1 for w in wells if w.status not in ["SOAKING", "STEAM_INJECTION"])
    total_prod = sum(w.production_rate for w in wells)
    avg_temp = sum(w.reservoir_temperature for w in wells) / len(wells)
    avg_visc = sum(w.oil_viscosity for w in wells) / len(wells)
    
    well_list = []
    for w in wells:
        latest_srp = db.query(SrpOperation).filter(SrpOperation.well_id == w.id).order_by(desc(SrpOperation.id)).first()
        rod_risk = latest_srp.rod_floating_risk if latest_srp else 15.0
        health = max(15.0, round(100.0 - (rod_risk * 0.6), 1))
        
        # Color status mapping
        if w.status == "CRITICAL_ALERT":
            color = "red"
        elif w.status in ["ATTENTION_REQUIRED", "SOAKING"]:
            color = "amber"
        else:
            color = "green"
            
        well_list.append({
            "id": w.id,
            "name": w.well_name,
            "latitude": w.latitude,
            "longitude": w.longitude,
            "status": w.status,
            "color": color,
            "production_bpd": w.production_rate,
            "temperature_c": w.reservoir_temperature,
            "viscosity_cp": w.oil_viscosity,
            "rod_risk": rod_risk,
            "health_score": health
        })
        
    return schemas.FieldOverview(
        total_wells=len(wells),
        active_wells=active_count,
        avg_temperature=round(avg_temp, 1),
        avg_viscosity=round(avg_visc, 1),
        total_field_production=round(total_prod, 1),
        average_sor=3.42,
        average_energy_per_barrel=31.8,
        wells=well_list
    )

@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummary, tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    wells = db.query(Well).all()
    active_wells = sum(1 for w in wells if w.status not in ["SOAKING", "STEAM_INJECTION"])
    total_prod = sum(w.production_rate for w in wells)
    
    status_distribution = {}
    for w in wells:
        status_distribution[w.status] = status_distribution.get(w.status, 0) + 1
        
    attention_wells = db.query(Well).filter(Well.status.in_(["ATTENTION_REQUIRED", "CRITICAL_ALERT"])).all()
    recent_events = db.query(EquipmentEvent).order_by(desc(EquipmentEvent.id)).limit(6).all()
    
    # 30-day aggregate field production trend
    trend = []
    base_prod = total_prod
    for d in range(30):
        trend.append({
            "day": d + 1,
            "field_production": round(base_prod * (0.94 + 0.003 * d + (0.02 if d % 4 == 0 else -0.01)), 1),
            "steam_injected_m3": 2400 if d in [3, 16] else 0,
            "avg_sor": round(3.2 + (0.01 * d), 2)
        })
        
    return schemas.DashboardSummary(
        active_wells=active_wells,
        total_production=round(total_prod, 1),
        average_sor=3.35,
        average_energy_per_barrel=32.4,
        average_equipment_health=82.6,
        wells_requiring_attention=len(attention_wells),
        status_distribution=status_distribution,
        attention_wells=attention_wells,
        recent_equipment_events=recent_events,
        production_trend_30d=trend
    )

# ==============================================================================
# 10. AUTHENTICATION & DEMO LOGIN
# ==============================================================================
DEMO_USERS = {
    "demo@wellnex.com": {
        "password": "WellNex@123",
        "name": "Petroleum Operations Engineer",
        "role": "Lead Petroleum Operations Engineer",
        "asset": "Baghewala Heavy Oil Asset, Jodhpur Sandstone"
    },
    "engineer@wellnex.ai": {
        "password": "Baghewala2026",
        "name": "Dr. Rajesh Sharma",
        "role": "Lead Petroleum Operations Engineer",
        "asset": "Baghewala Heavy Oil Asset, Jodhpur Sandstone"
    },
    "admin": {
        "password": "wellnex123",
        "name": "Asset Director",
        "role": "Chief Reservoir & Production Engineer",
        "asset": "Western Onshore Asset, Bikaner-Nagaur Basin"
    },
    "operator@baghewala.in": {
        "password": "WellNex2026",
        "name": "S. K. Choudhary",
        "role": "CSS Thermal Lift Field Specialist",
        "asset": "Baghewala Field Station 4"
    }
}

@app.post("/api/auth/login", response_model=schemas.LoginResponse, tags=["Authentication"])
def login(request: schemas.LoginRequest):
    username = request.username.strip()
    password = request.password.strip()

    # Check known demo accounts
    if username in DEMO_USERS:
        user_info = DEMO_USERS[username]
        if user_info["password"] == password:
            return schemas.LoginResponse(
                access_token=f"wellnex-jwt-{username}-auth",
                user=schemas.UserProfile(
                    username=username,
                    name=user_info["name"],
                    role=user_info["role"],
                    asset=user_info["asset"]
                )
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password for demo user. Demo credentials: engineer@wellnex.ai / Baghewala2026"
            )

    # Allow flexible demo login for petroleum engineers if valid username and password provided
    if len(username) >= 3 and len(password) >= 6:
        display_name = username.split("@")[0].replace(".", " ").title()
        return schemas.LoginResponse(
            access_token=f"wellnex-jwt-{username}-auth",
            user=schemas.UserProfile(
                username=username,
                name=f"Eng. {display_name}",
                role="Petroleum Production Engineer",
                asset="Baghewala Heavy Oil Asset"
            )
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Please use demo credentials: engineer@wellnex.ai / Baghewala2026"
    )

@app.get("/api/auth/me", response_model=schemas.UserProfile, tags=["Authentication"])
def get_current_user():
    return schemas.UserProfile(
        username="engineer@wellnex.ai",
        name="Dr. Rajesh Sharma",
        role="Lead Petroleum Operations Engineer",
        asset="Baghewala Heavy Oil Asset, Jodhpur Sandstone"
    )

