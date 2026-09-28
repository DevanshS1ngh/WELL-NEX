import os
import math
import random
from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
from models import Well, CssCycle, SrpOperation, ProductionHistory, EquipmentEvent, OptimizationResult
from digital_twin import calculate_oil_viscosity, simulate_srp_dynamics
from optimizer import optimize_well_operations

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if wells already exist
    existing_wells_count = db.query(Well).count()
    if existing_wells_count >= 15:
        print(f"Database already contains {existing_wells_count} wells. Seeding skipped.")
        db.close()
        return

    # Clear existing to guarantee fresh clean state
    print("Clearing any partial data...")
    db.query(OptimizationResult).delete()
    db.query(EquipmentEvent).delete()
    db.query(ProductionHistory).delete()
    db.query(SrpOperation).delete()
    db.query(CssCycle).delete()
    db.query(Well).delete()
    db.commit()

    print("Generating 15 demonstration wells for Baghewala Field...")
    
    # 15 distinct well profiles in Baghewala Field (Bikaner-Nagaur Basin, Rajasthan)
    # Coordinates centered around 27.95 N, 72.00 E
    well_configs = [
        {"name": "BW-01", "lat": 27.9542, "lon": 71.9821, "temp": 54.0, "status": "ATTENTION_REQUIRED", "cycle": 3, "api": 17.8},
        {"name": "BW-02", "lat": 27.9621, "lon": 71.9950, "temp": 142.0, "status": "PEAK_PRODUCTION", "cycle": 2, "api": 18.2},
        {"name": "BW-03", "lat": 27.9485, "lon": 72.0125, "temp": 82.0, "status": "NORMAL", "cycle": 4, "api": 18.0},
        {"name": "BW-04", "lat": 27.9710, "lon": 71.9780, "temp": 49.5, "status": "CRITICAL_ALERT", "cycle": 3, "api": 17.5},
        {"name": "BW-05", "lat": 27.9390, "lon": 72.0050, "temp": 128.0, "status": "PEAK_PRODUCTION", "cycle": 1, "api": 18.5},
        {"name": "BW-06", "lat": 27.9815, "lon": 72.0210, "temp": 76.0, "status": "NORMAL", "cycle": 2, "api": 18.1},
        {"name": "BW-07", "lat": 27.9450, "lon": 71.9680, "temp": 52.0, "status": "ATTENTION_REQUIRED", "cycle": 5, "api": 17.6},
        {"name": "BW-08", "lat": 27.9685, "lon": 72.0350, "temp": 158.0, "status": "PEAK_PRODUCTION", "cycle": 2, "api": 18.4},
        {"name": "BW-09", "lat": 27.9580, "lon": 72.0180, "temp": 88.0, "status": "NORMAL", "cycle": 3, "api": 17.9},
        {"name": "BW-10", "lat": 27.9320, "lon": 71.9890, "temp": 47.0, "status": "SOAKING", "cycle": 4, "api": 17.7},
        {"name": "BW-11", "lat": 27.9760, "lon": 71.9610, "temp": 115.0, "status": "NORMAL", "cycle": 1, "api": 18.3},
        {"name": "BW-12", "lat": 27.9410, "lon": 72.0280, "temp": 50.5, "status": "CRITICAL_ALERT", "cycle": 4, "api": 17.4},
        {"name": "BW-13", "lat": 27.9890, "lon": 71.9990, "temp": 95.0, "status": "NORMAL", "cycle": 2, "api": 18.0},
        {"name": "BW-14", "lat": 27.9510, "lon": 72.0420, "temp": 68.0, "status": "NORMAL", "cycle": 3, "api": 18.2},
        {"name": "BW-15", "lat": 27.9650, "lon": 71.9520, "temp": 48.0, "status": "STEAM_INJECTION", "cycle": 5, "api": 17.8},
    ]

    base_date = datetime.now() - timedelta(days=90)

    for cfg in well_configs:
        temp = cfg["temp"]
        api = cfg["api"]
        visc = calculate_oil_viscosity(temp, api)
        
        # Calculate realistic initial production rate
        if cfg["status"] == "PEAK_PRODUCTION":
            prod_rate = round(random.uniform(115.0, 155.0), 1)
            water_cut = round(random.uniform(12.0, 22.0), 1)
        elif cfg["status"] == "NORMAL":
            prod_rate = round(random.uniform(65.0, 95.0), 1)
            water_cut = round(random.uniform(22.0, 38.0), 1)
        elif cfg["status"] == "ATTENTION_REQUIRED":
            prod_rate = round(random.uniform(28.0, 48.0), 1)
            water_cut = round(random.uniform(35.0, 52.0), 1)
        elif cfg["status"] == "CRITICAL_ALERT":
            prod_rate = round(random.uniform(18.0, 32.0), 1)
            water_cut = round(random.uniform(42.0, 60.0), 1)
        else: # SOAKING or STEAM_INJECTION
            prod_rate = 0.0
            water_cut = 0.0

        # Pressures around 90 - 105 bar
        pressure = round(random.uniform(92.0, 106.0), 1)

        well = Well(
            well_name=cfg["name"],
            latitude=cfg["lat"],
            longitude=cfg["lon"],
            reservoir="Jodhpur Sandstone",
            api_gravity=api,
            reservoir_temperature=temp,
            reservoir_pressure=pressure,
            oil_viscosity=visc,
            production_rate=prod_rate,
            water_cut=water_cut,
            status=cfg["status"],
            created_at=datetime.utcnow() - timedelta(days=random.randint(180, 500))
        )
        db.add(well)
        db.flush()

        # Seed CSS Cycle history
        current_cycle_num = cfg["cycle"]
        for c_idx in range(1, current_cycle_num + 1):
            s_vol = round(random.uniform(2000.0, 2800.0), 0)
            c_start = (base_date + timedelta(days=(c_idx - 1) * 75)).strftime("%Y-%m-%d")
            c_end = (base_date + timedelta(days=(c_idx - 1) * 75 + 16)).strftime("%Y-%m-%d")
            
            css = CssCycle(
                well_id=well.id,
                steam_volume=s_vol,
                injection_pressure=round(random.uniform(95.0, 115.0), 1),
                injection_duration=round(random.uniform(12.0, 16.0), 1),
                soak_time=round(random.uniform(5.0, 8.0), 1),
                production_cutoff=12.0,
                cycle_number=c_idx,
                cycle_start=c_start,
                cycle_end=c_end
            )
            db.add(css)

        # Seed SRP telemetry
        if cfg["status"] in ["ATTENTION_REQUIRED", "CRITICAL_ALERT"]:
            # Well is running with inappropriately high SPM for cooled heavy oil
            spm = round(random.uniform(7.5, 9.2), 1)
            stroke = 86.0
            vfd_hz = round(spm * 6.5, 1)
        elif cfg["status"] == "PEAK_PRODUCTION":
            spm = round(random.uniform(6.0, 7.5), 1)
            stroke = 120.0
            vfd_hz = round(spm * 6.8, 1)
        else:
            spm = round(random.uniform(4.5, 6.2), 1)
            stroke = 100.0
            vfd_hz = round(spm * 7.2, 1)

        srp_sim = simulate_srp_dynamics(
            stroke_length_in=stroke,
            spm=spm,
            vfd_frequency_hz=vfd_hz,
            oil_viscosity_cp=visc
        )

        srp = SrpOperation(
            well_id=well.id,
            stroke_length=stroke,
            spm=spm,
            vfd_frequency=vfd_hz,
            pump_efficiency=srp_sim["pump_efficiency"],
            rod_load=srp_sim["rod_load"],
            impact_loading=srp_sim["impact_loading"],
            rod_floating_risk=srp_sim["rod_floating_risk"],
            pump_unsetting_risk=srp_sim["pump_unsetting_risk"],
            recorded_at=datetime.utcnow()
        )
        db.add(srp)

        # Seed Production History (30 daily time-series records)
        for d in range(30):
            day_offset = 30 - d
            h_date = (datetime.now() - timedelta(days=day_offset)).strftime("%Y-%m-%d")
            
            # Historical trend mimicking temperature decay or peak
            decay = math.exp(-0.012 * d)
            hist_prod = max(5.0, round(prod_rate * (0.85 + 0.15 * decay + random.uniform(-0.05, 0.05)), 1))
            hist_water = round(hist_prod * (water_cut / 100.0), 1)
            hist_steam = 0.0
            if d == 0 and cfg["cycle"] > 1:
                hist_steam = 2400.0
                
            hist_sor = round(2200.0 / max(hist_prod * 75 * 0.158987, 10.0), 2)
            hist_energy = round(srp_sim["energy_consumption"] + random.uniform(-1.5, 1.5), 1)

            history_rec = ProductionHistory(
                well_id=well.id,
                date=h_date,
                oil_production=hist_prod,
                water_production=hist_water,
                steam_injection=hist_steam,
                energy_consumption=hist_energy,
                sor=max(1.8, min(6.0, hist_sor))
            )
            db.add(history_rec)

        # Seed Equipment Events
        if cfg["status"] == "CRITICAL_ALERT":
            event1 = EquipmentEvent(
                well_id=well.id,
                event_type="ROD_FLOATING",
                severity="CRITICAL",
                description=f"Severe rod floating detected on downstroke in {cfg['name']}. Viscosity reached {visc:.0f} cP; buoyant rod weight insufficient to overcome viscous friction at {spm:.1f} SPM.",
                event_date=(datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M"),
                resolved=False
            )
            event2 = EquipmentEvent(
                well_id=well.id,
                event_type="IMPACT_LOADING",
                severity="HIGH",
                description=f"Walking beam bottom reversal impact load spiked to {srp_sim['impact_loading']:.1f} kN due to stalled polished rod string.",
                event_date=(datetime.now() - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
                resolved=False
            )
            db.add(event1)
            db.add(event2)
        elif cfg["status"] == "ATTENTION_REQUIRED":
            event = EquipmentEvent(
                well_id=well.id,
                event_type="ROD_FLOATING",
                severity="HIGH",
                description=f"Elevated rod-loading risk detected in {cfg['name']}. Rod floating probability at {srp_sim['rod_floating_risk']:.1f}%. Recommend lowering SPM.",
                event_date=(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M"),
                resolved=False
            )
            db.add(event)
        else:
            # Resolved past maintenance event
            if random.random() > 0.5:
                past_event = EquipmentEvent(
                    well_id=well.id,
                    event_type="MAINTENANCE",
                    severity="LOW",
                    description=f"Routine sucker rod string inspection and polished rod packing replacement completed.",
                    event_date=(datetime.now() - timedelta(days=random.randint(15, 60))).strftime("%Y-%m-%d"),
                    resolved=True
                )
                db.add(past_event)

        # Seed initial Optimization Result
        db.flush()
        opt_data = optimize_well_operations(
            well_data={
                "id": well.id,
                "well_name": well.well_name,
                "reservoir_temperature": well.reservoir_temperature,
                "oil_viscosity": well.oil_viscosity,
                "production_rate": well.production_rate,
                "api_gravity": well.api_gravity
            },
            current_css={
                "steam_volume": 2200.0,
                "injection_pressure": 100.0,
                "soak_time": 6.0,
                "production_cutoff": 12.0
            },
            current_srp={
                "stroke_length": stroke,
                "spm": spm,
                "vfd_frequency": vfd_hz
            }
        )

        opt_result = OptimizationResult(
            well_id=well.id,
            current_production=opt_data["current_window"].production,
            predicted_production=opt_data["recommended_window"].production,
            recommended_steam_volume=opt_data["recommended_window"].steam_volume,
            recommended_soak_time=opt_data["recommended_window"].soak_time,
            recommended_stroke=opt_data["recommended_window"].stroke_length,
            recommended_spm=opt_data["recommended_window"].spm,
            recommended_vfd=opt_data["recommended_window"].vfd_frequency,
            predicted_sor=opt_data["recommended_window"].sor,
            predicted_energy=opt_data["recommended_window"].energy,
            rod_failure_risk=opt_data["recommended_window"].rod_floating_risk,
            optimization_score=opt_data["optimization_score"],
            why_explanation=opt_data["why_explanation"],
            created_at=datetime.utcnow()
        )
        db.add(opt_result)

    db.commit()
    print(f"Successfully seeded database with 15 wells and comprehensive Baghewala simulation datasets.")
    db.close()

if __name__ == "__main__":
    seed_database()
