import math
from typing import Dict, Any, List, Tuple
from schemas import DynaCardPoint

# ==============================================================================
# BAGHEWALA JODHPUR SANDSTONE HEAVY OIL DIGITAL TWIN PHYSICS MODULE
# ==============================================================================
# Real-world reservoir parameters:
# Formation: Jodhpur Sandstone (Cambrian)
# Basin: Bikaner-Nagaur Basin, Western Rajasthan
# Depth: ~1000 - 1100 m
# Native reservoir temp: 46 - 48 deg C
# Native reservoir pressure: 90 - 110 bar
# Heavy crude API: 17 - 19 deg API (Density ~ 0.945 - 0.955 g/cm3)
# Reservoir permeability: ~150 - 350 mD
# ==============================================================================

def calculate_oil_viscosity(temp_celsius: float, api_gravity: float = 18.0) -> float:
    """
    Calculates temperature-dependent dynamic viscosity for Baghewala heavy crude.
    Based on Arrhenius-Walther temperature correlation calibrated for 17-19 API.
    At 46 C (native), viscosity ~ 3,500 - 6,500 cP
    At 80 C, viscosity ~ 800 - 1,200 cP
    At 120 C, viscosity ~ 150 - 250 cP
    At 180 C (steam zone), viscosity ~ 20 - 45 cP
    """
    temp_k = temp_celsius + 273.15
    # Reference points: 46 C -> 4800 cP, 180 C -> 30 cP
    b_factor = 5475.0 + (19.0 - api_gravity) * 450.0
    a_factor = math.log(4800.0) - (b_factor / (46.0 + 273.15))
    
    ln_visc = a_factor + (b_factor / temp_k)
    viscosity = math.exp(ln_visc)
    # Clamp to realistic physical range
    return max(15.0, min(12000.0, round(viscosity, 2)))

def calculate_oil_mobility(viscosity_cp: float, permeability_md: float = 250.0) -> float:
    """
    Oil mobility = effective permeability / oil viscosity (mD / cP).
    Multiplied by 100 for intuitive index display.
    """
    if viscosity_cp <= 0:
        return 0.0
    mobility = (permeability_md / viscosity_cp) * 100.0
    return round(mobility, 3)

def simulate_css_cycle(
    steam_volume_m3: float,
    injection_pressure_bar: float,
    injection_duration_days: float,
    soak_time_days: float,
    production_cutoff_bpd: float,
    native_temp_c: float = 47.0,
    api_gravity: float = 18.0
) -> Dict[str, Any]:
    """
    Simulates thermal response of Cyclic Steam Stimulation.
    Couples thermal heat injection, heat losses, soak equilibration,
    and post-steam temperature and production decay.
    """
    # 1. Thermal energy input: Q = V_steam * rho * enthalpy
    # Latent heat + sensible heat factor ~ 2.6 GJ / m3
    steam_enthalpy_gj_per_m3 = 2.45 + (injection_pressure_bar / 100.0) * 0.25
    total_heat_input_gj = steam_volume_m3 * steam_enthalpy_gj_per_m3
    
    # 2. Soak factor:
    # 5-8 days is optimal for heat distribution in Jodhpur Sandstone.
    # <4 days causes premature steam breakthrough; >12 days leads to conductive heat loss to bounding shale.
    if 5.0 <= soak_time_days <= 8.0:
        soak_thermal_efficiency = 0.92
    elif soak_time_days < 5.0:
        soak_thermal_efficiency = 0.70 + (soak_time_days / 5.0) * 0.22
    else:
        # Heat loss factor
        excess_days = soak_time_days - 8.0
        soak_thermal_efficiency = max(0.65, 0.92 - (excess_days * 0.035))
        
    # 3. Peak Near-Wellbore Temperature
    # Base native is 47 C. Added temp proportional to heat input with diminishing returns.
    temp_gain = (total_heat_input_gj * soak_thermal_efficiency) / (steam_volume_m3 * 0.02 + 120.0)
    peak_temperature = min(215.0, native_temp_c + temp_gain)
    
    # Average cycle operating temperature (wellbore area during first 60 days)
    avg_cycle_temp = native_temp_c + (peak_temperature - native_temp_c) * 0.65
    
    # 4. Resulting viscosity & mobility
    viscosity = calculate_oil_viscosity(avg_cycle_temp, api_gravity)
    mobility = calculate_oil_mobility(viscosity)
    
    # 5. Production prediction:
    # Higher mobility -> higher inflow. Baghewala heavy oil wells typically deliver 40 - 180 bpd post-CSS.
    base_flow = 20.0
    mobility_boost = min(150.0, mobility * 14.5)
    predicted_production = round(base_flow + mobility_boost, 1)
    
    # 6. Steam-Oil Ratio (SOR):
    # SOR = Steam volume (m3) / Cumulative oil produced (m3).
    # 1 bbl = 0.158987 m3. 90-day cycle estimated cumulative oil:
    cum_oil_bbl = predicted_production * 75.0 # effective production days
    cum_oil_m3 = cum_oil_bbl * 0.158987
    predicted_sor = round(steam_volume_m3 / max(cum_oil_m3, 10.0), 2)
    # Realistic Baghewala SOR is 2.2 - 5.5 m3/m3
    predicted_sor = max(1.8, min(6.5, predicted_sor))
    
    # 7. Energy consumption (kWh / bbl):
    # Combined boiler thermal fuel equivalent + surface lifting
    thermal_kwh_per_bbl = (total_heat_input_gj * 277.78) / max(cum_oil_bbl, 10.0)
    lift_kwh_per_bbl = 14.0 + (viscosity / 400.0) * 5.0
    total_energy_kwh_per_bbl = round(thermal_kwh_per_bbl * 0.18 + lift_kwh_per_bbl, 1) # effective primary energy
    
    # 8. Heated radius (m)
    thermal_radius = round(math.sqrt((steam_volume_m3 * 0.8) / (math.pi * 12.0 * 0.35)), 2)
    
    # 9. Trajectory curves over 90 days
    temp_trajectory = []
    prod_trajectory = []
    for day in range(0, 95, 5):
        day_t = native_temp_c + (peak_temperature - native_temp_c) * math.exp(-0.022 * day)
        day_visc = calculate_oil_viscosity(day_t, api_gravity)
        day_mob = calculate_oil_mobility(day_visc)
        day_prod = max(production_cutoff_bpd, base_flow + min(150.0, day_mob * 14.5) * math.exp(-0.015 * day))
        temp_trajectory.append({"day": day, "temperature": round(day_t, 1), "viscosity": round(day_visc, 1)})
        prod_trajectory.append({"day": day, "oil_production": round(day_prod, 1), "water_cut": round(min(75.0, 15.0 + day * 0.45), 1)})
        
    explanation = (
        f"Steam injection of {steam_volume_m3:.0f} m³ at {injection_pressure_bar:.0f} bar heats near-wellbore formation "
        f"to {peak_temperature:.1f}°C (thermal radius {thermal_radius} m). Viscosity decreases from "
        f"~{calculate_oil_viscosity(native_temp_c):.0f} cP to {viscosity:.1f} cP, unlocking mobility of {mobility:.2f} "
        f"and delivering ~{predicted_production:.1f} bpd with an estimated SOR of {predicted_sor:.2f} m³/m³."
    )
    
    return {
        "predicted_reservoir_temperature": round(avg_cycle_temp, 1),
        "estimated_viscosity": round(viscosity, 1),
        "estimated_oil_mobility": round(mobility, 3),
        "predicted_production": round(predicted_production, 1),
        "predicted_sor": round(predicted_sor, 2),
        "energy_consumption": round(total_energy_kwh_per_bbl, 1),
        "recovery_indicator": round(min(100.0, (predicted_production / 140.0) * 100.0), 1),
        "thermal_radius_m": thermal_radius,
        "temperature_trajectory": temp_trajectory,
        "production_trajectory": prod_trajectory,
        "explanation": explanation
    }

def simulate_srp_dynamics(
    stroke_length_in: float,
    spm: float,
    vfd_frequency_hz: float,
    oil_viscosity_cp: float,
    well_depth_m: float = 1050.0,
    pump_diameter_in: float = 2.25
) -> Dict[str, Any]:
    """
    Simulates Sucker Rod Pump (SRP) mechanics and viscous fluid coupling.
    Calculates downstroke viscous drag, rod floating risk, impact loading on reversal,
    volumetric efficiency, and dynamometer card points.
    """
    # 1. Pump displacement:
    # Displacement (bpd) = 0.1166 * (D_pump)^2 * Stroke(in) * SPM (API formula)
    theoretical_disp_bpd = 0.1166 * (pump_diameter_in ** 2) * stroke_length_in * spm
    
    # 2. Viscous Drag on Sucker Rod String:
    # In heavy oil, during downstroke, rod travels downward through high viscosity fluid.
    # Downstroke velocity v_max = pi * S * SPM / 60 (m/s)
    stroke_m = stroke_length_in * 0.0254
    v_max = (math.pi * stroke_m * spm) / 60.0
    
    # Viscous drag force (kN): proportional to viscosity, velocity, and string length
    # Calibrated for 1050 m string with 7/8" - 1" rods
    drag_coefficient = 0.00038
    viscous_drag_down_kn = drag_coefficient * (oil_viscosity_cp ** 0.65) * (v_max * 1.5) * (well_depth_m / 1000.0)
    
    # Buoyant rod string weight (approx 34 kN for 1050 m string)
    buoyant_rod_weight_kn = 34.5
    
    # Fluid column load on upstroke: approx 22 kN
    fluid_column_load_kn = 22.0 * (1.0 + (oil_viscosity_cp / 8000.0) * 0.3)
    
    # Peak Polished Rod Load (PPRL):
    # PPRL = Buoyant Rod Weight + Fluid Load + Viscous Upstroke Drag + Inertial Accel
    inertial_factor = 1.0 + (stroke_length_in * (spm ** 2)) / 70500.0
    pprl_kn = (buoyant_rod_weight_kn * inertial_factor) + fluid_column_load_kn + (viscous_drag_down_kn * 0.8)
    
    # Rod Floating Physics:
    # On downstroke, gravity accelerates rod down. Viscous drag opposes it.
    # If drag approaches or exceeds buoyant rod weight, rod floats / hangs up!
    drag_to_weight_ratio = viscous_drag_down_kn / max(buoyant_rod_weight_kn, 10.0)
    rod_floating_risk_pct = min(100.0, max(0.0, (drag_to_weight_ratio - 0.25) / 0.55 * 100.0))
    
    # Impact Loading:
    # If rod floats, walking beam accelerates ahead of rod string on downstroke.
    # At reversal, the bridle/carrier bar collides with the falling rod clamp!
    if rod_floating_risk_pct > 30.0:
        impact_multiplier = 1.0 + ((rod_floating_risk_pct - 30.0) / 70.0) * 1.8
        impact_loading_kn = round(pprl_kn * 0.35 * impact_multiplier, 1)
    else:
        impact_loading_kn = round(5.0 + (spm / 10.0) * 6.0, 1)
        
    # Pump Unsetting Risk:
    # High upstroke viscous suction + sticking plunger
    pump_unsetting_risk_pct = min(100.0, max(0.0, (viscous_drag_down_kn * 0.9 / 28.0) * 100.0 + (spm > 8.0) * 15.0))
    
    # Volumetric Pump Efficiency:
    # In heavy oil, valve ball travel is retarded and slippage occurs.
    # High viscosity drops efficiency if SPM is high.
    visc_loss = min(35.0, (oil_viscosity_cp / 5000.0) * 20.0 + (spm / 10.0) * 15.0)
    pump_efficiency_pct = max(45.0, min(94.0, 92.0 - visc_loss))
    
    # Effective production:
    predicted_production_bpd = round(theoretical_disp_bpd * (pump_efficiency_pct / 100.0), 1)
    
    # Energy consumption (Lifting):
    # Hydraulic power = Q * deltaP / eff
    lifting_kw = (pprl_kn * stroke_m * (spm / 60.0)) * 1.45 # motor electrical losses included
    energy_kwh_per_bbl = round((lifting_kw * 24.0) / max(predicted_production_bpd, 5.0), 1)
    
    # Severity classification:
    if rod_floating_risk_pct >= 70.0:
        severity = "CRITICAL"
    elif rod_floating_risk_pct >= 40.0:
        severity = "HIGH"
    elif rod_floating_risk_pct >= 20.0:
        severity = "MODERATE"
    else:
        severity = "LOW"
        
    # Generate DynaCard (Surface Card and Pump Card):
    dynacard = generate_dynacard(
        stroke_length_in=stroke_length_in,
        pprl_kn=pprl_kn,
        min_load_kn=max(8.0, buoyant_rod_weight_kn - viscous_drag_down_kn),
        viscosity_cp=oil_viscosity_cp,
        rod_floating_risk_pct=rod_floating_risk_pct
    )
    
    # Analysis notes:
    notes = []
    if rod_floating_risk_pct > 50.0:
        notes.append(
            f"CRITICAL ROD FLOATING: Viscous drag ({viscous_drag_down_kn:.1f} kN) opposes {buoyant_rod_weight_kn:.1f} kN rod weight. "
            f"At {spm:.1f} SPM, downstroke velocity is too high for {oil_viscosity_cp:.0f} cP oil."
        )
    if impact_loading_kn > 25.0:
        notes.append(
            f"SEVERE IMPACT LOADING: Peak shock load estimated at {impact_loading_kn:.1f} kN upon walking beam bottom reversal."
        )
    if pump_unsetting_risk_pct > 40.0:
        notes.append(
            f"PUMP UNSETTING ALERT: Upstroke friction ({viscous_drag_down_kn * 0.9:.1f} kN) threatens to overcome mechanical hold-down."
        )
    if not notes:
        notes.append("SRP mechanical dynamics operating within safe, balanced API envelope.")
        
    return {
        "pump_efficiency": round(pump_efficiency_pct, 1),
        "rod_load": round(pprl_kn, 1),
        "impact_loading": impact_loading_kn,
        "rod_floating_risk": round(rod_floating_risk_pct, 1),
        "pump_unsetting_risk": round(pump_unsetting_risk_pct, 1),
        "predicted_production": predicted_production_bpd,
        "energy_consumption": energy_kwh_per_bbl,
        "rod_floating_severity": severity,
        "dynacard": dynacard,
        "analysis_notes": notes
    }

def generate_dynacard(
    stroke_length_in: float,
    pprl_kn: float,
    min_load_kn: float,
    viscosity_cp: float,
    rod_floating_risk_pct: float
) -> List[DynaCardPoint]:
    """
    Generates synthetic dynamometer card data points (Position % vs Surface & Pump Load in kN).
    Captures heavy oil signature: viscous slope delay, rod floating deformation, and reversal impact spikes.
    """
    points: List[DynaCardPoint] = []
    num_steps = 36 # 10-degree increments
    
    for i in range(num_steps + 1):
        angle_rad = (2.0 * math.pi * i) / num_steps
        # Normalized position [0, 100%]
        # Upstroke: 0 -> pi (position 0% -> 100%)
        # Downstroke: pi -> 2pi (position 100% -> 0%)
        pos_pct = round(50.0 * (1.0 - math.cos(angle_rad)), 1)
        
        # Upstroke vs Downstroke load profiles
        if i <= num_steps // 2:
            # UPSTROKE: Traveling valve closed, lifting fluid column
            # Viscous friction adds drag during initial acceleration
            accel = math.sin(angle_rad)
            surface_load = pprl_kn - 4.0 * (1.0 - accel) + (viscosity_cp / 5000.0) * 3.5 * accel
            pump_load = pprl_kn - 14.0 * (1.0 - 0.7 * accel)
        else:
            # DOWNSTROKE: Standing valve closed, traveling valve open
            # If rod floats, load doesn't drop immediately, or drops then spikes upon bottom collision!
            progress = (i - num_steps // 2) / (num_steps // 2) # 0 to 1
            if rod_floating_risk_pct > 40.0 and progress > 0.8:
                # Bottom reversal impact spike
                surface_load = min_load_kn + (rod_floating_risk_pct / 100.0) * 22.0
            else:
                surface_load = min_load_kn + 6.0 * (1.0 - progress) * (viscosity_cp / 4000.0)
            pump_load = min_load_kn * 0.75
            
        points.append(DynaCardPoint(
            position_pct=pos_pct,
            surface_load_kn=round(max(5.0, surface_load), 1),
            pump_load_kn=round(max(2.0, pump_load), 1)
        ))
        
    return points
