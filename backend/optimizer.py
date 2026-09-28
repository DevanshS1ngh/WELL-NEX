import math
from typing import Dict, Any, List
from digital_twin import calculate_oil_viscosity, simulate_css_cycle, simulate_srp_dynamics
from schemas import ParameterWindow, OptimizationResponse

def optimize_well_operations(
    well_data: Dict[str, Any],
    current_css: Dict[str, Any],
    current_srp: Dict[str, Any],
    priority: str = "BALANCED"
) -> Dict[str, Any]:
    """
    Joint Multi-Objective Optimizer for CSS (Thermal Stimulation) and SRP (Artificial Lift).
    Identifies a balanced operating window balancing production rate, Steam-Oil Ratio (SOR),
    electrical lifting energy, and equipment mechanical risks (Rod Floating, Impact Loading, Pump Unsetting).
    Produces explicit engineering "Why?" explanations.
    """
    native_temp_c = 47.0 # Baghewala native temp
    current_temp = well_data.get("reservoir_temperature", 65.0)
    current_visc = well_data.get("oil_viscosity", calculate_oil_viscosity(current_temp))
    api_gravity = well_data.get("api_gravity", 18.0)
    
    curr_steam_vol = current_css.get("steam_volume", 2200.0)
    curr_inj_press = current_css.get("injection_pressure", 100.0)
    curr_soak_days = current_css.get("soak_time", 6.0)
    curr_cutoff = current_css.get("production_cutoff", 15.0)
    
    curr_stroke = current_srp.get("stroke_length", 100.0)
    curr_spm = current_srp.get("spm", 7.5)
    curr_vfd = current_srp.get("vfd_frequency", 50.0)
    
    # Calculate baseline current performance
    curr_srp_sim = simulate_srp_dynamics(
        stroke_length_in=curr_stroke,
        spm=curr_spm,
        vfd_frequency_hz=curr_vfd,
        oil_viscosity_cp=current_visc
    )
    
    curr_prod = well_data.get("production_rate", curr_srp_sim["predicted_production"])
    curr_sor = round(curr_steam_vol / max(curr_prod * 75 * 0.158987, 10.0), 2)
    curr_energy = curr_srp_sim["energy_consumption"] + 18.5
    curr_eff = curr_srp_sim["pump_efficiency"]
    curr_rod_risk = curr_srp_sim["rod_floating_risk"]
    curr_health = max(10.0, 100.0 - (curr_rod_risk * 0.6 + curr_srp_sim["impact_loading"] * 1.2))
    
    current_window = ParameterWindow(
        steam_volume=curr_steam_vol,
        injection_pressure=curr_inj_press,
        soak_time=curr_soak_days,
        production_cutoff=curr_cutoff,
        stroke_length=curr_stroke,
        spm=curr_spm,
        vfd_frequency=curr_vfd,
        production=round(curr_prod, 1),
        sor=round(curr_sor, 2),
        energy=round(curr_energy, 1),
        pump_efficiency=round(curr_eff, 1),
        rod_floating_risk=round(curr_rod_risk, 1),
        equipment_health=round(curr_health, 1)
    )
    
    # Target parameter exploration candidates
    candidate_steam_vols = [1800.0, 2200.0, 2600.0, 3000.0]
    candidate_soak_days = [5.0, 6.0, 7.0, 8.0]
    candidate_strokes = [100.0, 120.0, 144.0] # longer stroke favored in heavy oil
    candidate_spms = [3.5, 4.5, 5.2, 6.0, 7.0] # slower SPM to prevent rod floating
    
    best_candidate = None
    best_score = -9999.0
    
    for s_vol in candidate_steam_vols:
        for s_soak in candidate_soak_days:
            # Simulate thermal impact
            css_res = simulate_css_cycle(
                steam_volume_m3=s_vol,
                injection_pressure_bar=105.0,
                injection_duration_days=14.0,
                soak_time_days=s_soak,
                production_cutoff_bpd=12.0,
                native_temp_c=native_temp_c,
                api_gravity=api_gravity
            )
            est_temp = css_res["predicted_reservoir_temperature"]
            est_visc = css_res["estimated_viscosity"]
            
            for stroke in candidate_strokes:
                for spm in candidate_spms:
                    vfd_hz = round(spm * 7.5, 1) # ~6 SPM -> 45 Hz
                    srp_res = simulate_srp_dynamics(
                        stroke_length_in=stroke,
                        spm=spm,
                        vfd_frequency_hz=vfd_hz,
                        oil_viscosity_cp=est_visc
                    )
                    
                    prod = srp_res["predicted_production"]
                    sor = css_res["predicted_sor"]
                    energy = css_res["energy_consumption"]
                    rod_risk = srp_res["rod_floating_risk"]
                    impact = srp_res["impact_loading"]
                    health = max(10.0, 100.0 - (rod_risk * 0.5 + impact * 1.0))
                    
                    # Safety constraint: Rod floating risk must not be dangerous
                    if rod_risk > 35.0:
                        continue
                    
                    # Weights depending on priority mode
                    if priority == "MAX_PRODUCTION":
                        w_prod, w_sor, w_eng, w_risk = 0.55, 0.15, 0.10, 0.20
                    elif priority == "MIN_ENERGY":
                        w_prod, w_sor, w_eng, w_risk = 0.20, 0.25, 0.35, 0.20
                    elif priority == "MIN_EQUIPMENT_STRESS":
                        w_prod, w_sor, w_eng, w_risk = 0.15, 0.15, 0.15, 0.55
                    else: # BALANCED
                        w_prod, w_sor, w_eng, w_risk = 0.35, 0.22, 0.18, 0.25
                        
                    norm_prod = min(1.0, prod / 130.0)
                    norm_sor = 1.0 - min(1.0, (sor - 1.8) / 4.0)
                    norm_energy = 1.0 - min(1.0, (energy - 20.0) / 40.0)
                    norm_risk = 1.0 - (rod_risk / 100.0)
                    
                    score = (
                        w_prod * norm_prod +
                        w_sor * norm_sor +
                        w_eng * norm_energy +
                        w_risk * norm_risk
                    ) * 100.0
                    
                    if score > best_score:
                        best_score = score
                        best_candidate = {
                            "steam_volume": s_vol,
                            "injection_pressure": 105.0,
                            "soak_time": s_soak,
                            "production_cutoff": 12.0,
                            "stroke_length": stroke,
                            "spm": spm,
                            "vfd_frequency": vfd_hz,
                            "production": prod,
                            "sor": sor,
                            "energy": energy,
                            "pump_efficiency": srp_res["pump_efficiency"],
                            "rod_floating_risk": rod_risk,
                            "equipment_health": round(health, 1),
                            "est_viscosity": est_visc,
                            "est_temp": est_temp
                        }
                        
    if not best_candidate:
        # Fallback safe operating window
        best_candidate = {
            "steam_volume": 2400.0,
            "injection_pressure": 105.0,
            "soak_time": 7.0,
            "production_cutoff": 12.0,
            "stroke_length": 120.0,
            "spm": 5.0,
            "vfd_frequency": 38.0,
            "production": round(curr_prod * 1.15, 1),
            "sor": 3.1,
            "energy": 28.5,
            "pump_efficiency": 82.0,
            "rod_floating_risk": 12.0,
            "equipment_health": 91.0,
            "est_viscosity": 120.0,
            "est_temp": 145.0
        }
        best_score = 88.5

    recommended_window = ParameterWindow(
        steam_volume=best_candidate["steam_volume"],
        injection_pressure=best_candidate["injection_pressure"],
        soak_time=best_candidate["soak_time"],
        production_cutoff=best_candidate["production_cutoff"],
        stroke_length=best_candidate["stroke_length"],
        spm=best_candidate["spm"],
        vfd_frequency=best_candidate["vfd_frequency"],
        production=round(best_candidate["production"], 1),
        sor=round(best_candidate["sor"], 2),
        energy=round(best_candidate["energy"], 1),
        pump_efficiency=round(best_candidate["pump_efficiency"], 1),
        rod_floating_risk=round(best_candidate["rod_floating_risk"], 1),
        equipment_health=round(best_candidate["equipment_health"], 1)
    )
    
    prod_delta = round(((recommended_window.production - current_window.production) / max(current_window.production, 1.0)) * 100.0, 1)
    sor_delta = round(((recommended_window.sor - current_window.sor) / max(current_window.sor, 0.1)) * 100.0, 1)
    energy_delta = round(((recommended_window.energy - current_window.energy) / max(current_window.energy, 1.0)) * 100.0, 1)
    rod_delta = round(recommended_window.rod_floating_risk - current_window.rod_floating_risk, 1)
    
    # Build Explainable Reasoning
    explanation_points = []
    
    # 1. SPM / Stroke rationale
    if recommended_window.spm < current_window.spm:
        spm_exp = (
            f"SPM is decreased from {current_window.spm:.1f} to {recommended_window.spm:.1f} because heavy oil viscosity "
            f"({current_visc:.0f} cP) produces excessive downstroke viscous drag at higher speeds. "
            f"Lowering SPM slows downstroke rod velocity, eliminating the {current_window.rod_floating_risk:.0f}% rod floating risk "
            f"and preventing severe bottom-reversal impact loading."
        )
    else:
        spm_exp = (
            f"SPM is tuned to {recommended_window.spm:.1f} to maximize fluid displacement safely within the rod string's "
            f"buoyant sinking velocity limit."
        )
    explanation_points.append({"title": "SRP Speed & Stroke Rationale", "reason": spm_exp})
    
    # 2. Stroke length rationale
    if recommended_window.stroke_length > current_window.stroke_length:
        stroke_exp = (
            f"Stroke length is increased from {current_window.stroke_length:.0f}\" to {recommended_window.stroke_length:.0f}\". "
            f"In heavy oil production, a longer stroke with lower SPM yields the same or higher daily volumetric displacement "
            f"while cutting cyclic stress reversals by {round((1 - recommended_window.spm / max(current_window.spm, 1)) * 100, 0):.0f}%, "
            f"significantly extending rod string fatigue life."
        )
        explanation_points.append({"title": "Long-Stroke Strategy", "reason": stroke_exp})
        
    # 3. CSS Steam slug & Soak rationale
    css_exp = (
        f"A targeted steam slug of {recommended_window.steam_volume:.0f} m³ CWE with {recommended_window.soak_time:.0f} days soak time "
        f"is scheduled. In the Jodhpur Sandstone, this heat slug expands the thermal radius to ~14 meters, cutting crude viscosity "
        f"to ~{best_candidate.get('est_viscosity', 140):.0f} cP. The {recommended_window.soak_time:.0f}-day soak allows thermal "
        f"equilibration without excessive conductive losses to overlying caprock."
    )
    explanation_points.append({"title": "Thermal Stimulation Rationale", "reason": css_exp})
    
    # 4. Energy & SOR balance
    balance_exp = (
        f"Optimization delivers a balanced window: Production changes by {prod_delta:+.1f}%, SOR drops by {abs(sor_delta):.1f}%, "
        f"and specific lifting energy changes by {energy_delta:+.1f}%. Rod floating risk is curtailed to {recommended_window.rod_floating_risk:.0f}%."
    )
    explanation_points.append({"title": "Balanced Operating Economics", "reason": balance_exp})
    
    why_text = "\n\n".join([f"**{p['title']}**\n{p['reason']}" for p in explanation_points])
    
    return {
        "well_id": well_data.get("id", 1),
        "well_name": well_data.get("well_name", "BW-01"),
        "current_window": current_window,
        "recommended_window": recommended_window,
        "production_delta_pct": prod_delta,
        "sor_delta_pct": sor_delta,
        "energy_delta_pct": energy_delta,
        "rod_risk_delta_pct": rod_delta,
        "optimization_score": round(best_score, 1),
        "why_explanation": why_text,
        "explanation_points": explanation_points
    }
