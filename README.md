# WELL-NEX — Well-to-Surface Intelligence
### Engineering Digital Twin for Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Coupled Optimization in Heavy Oil Wells of Baghewala Field, Rajasthan

> **Notice:** All telemetry, wells, production history, and stimulation cycles in this system are **Demonstration / Synthetic Data** specifically calibrated for the thermodynamic and rheological parameters of the Baghewala Jodhpur Sandstone heavy oil reservoir.

---

## Demo Credentials (One-Click or Manual Login)

The application features a 2.4s initial opening animation (Reservoir → Wellbore → Pump → Surface) leading to the secure petroleum operations portal.

| Role | Username / Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Lead Petroleum Operations Engineer** (Recommended) | `engineer@wellnex.ai` | `Baghewala2026` | Full Baghewala Field Twin, CSS & SRP Simulators, Joint Optimizer |
| **Asset Optimization Director** | `admin` | `wellnex123` | Multi-Well Executive Oversight, Field SCADA Telemetry |
| **Thermal Lift Field Specialist** | `operator@baghewala.in` | `WellNex2026` | Dynamic Well Diagnostics, Rod Floating & Impact Risk Mitigations |

*(Quick-click demo buttons are also provided directly on the login card for instantaneous one-click sign in.)*

---

## Architecture Overview

```
Well-Nex/
│
├── backend/                        # Python FastAPI Backend & SQLite Database
│   ├── database.py                 # SQLAlchemy engine & sessionmaker (wellnex.db)
│   ├── models.py                   # 6 SQLAlchemy DB models (wells, css_cycles, srp, etc.)
│   ├── schemas.py                  # Pydantic validation & response schemas
│   ├── digital_twin.py             # Heavy oil physics engine (viscosity, rod drag, dynacards)
│   ├── optimizer.py                # Multi-objective balanced window optimizer + explainability
│   ├── seed.py                     # Populates 15 demonstration wells with realistic SCADA data
│   ├── main.py                     # FastAPI REST API with CORS and 21 endpoints
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, sqlalchemy, etc.)
│   └── wellnex.db                  # Local SQLite database file
│
└── frontend/                       # React 18 + Vite + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/client.ts           # Typed API client connected to backend
    │   ├── types/index.ts          # TypeScript interfaces matching backend models
    │   ├── components/
    │   │   ├── Logo.tsx            # Stylized wellbore & node icon branding
    │   │   ├── Navbar.tsx          # Navigation, live backend beacon, well switcher
    │   │   ├── Footer.tsx          # Technical specifications and legal notices
    │   │   ├── StatusBadge.tsx     # Color-coded operational status badges
    │   │   ├── LoadingSpinner.tsx  # Industrial loading spinner
    │   │   ├── ErrorMessage.tsx    # Connection alert with troubleshooting instructions
    │   │   └── DataPipelineFlow.tsx# Interactive 6-stage data flow visualization
    │   ├── pages/
    │   │   ├── LandingPage.tsx     # Value proposition & animated well cross-section
    │   │   ├── DashboardPage.tsx   # Field KPIs, 30-day production & SOR chart, status cards
    │   │   ├── DigitalTwinPage.tsx # Flagship interactive full-depth wellbore schematic
    │   │   ├── CssOptimizerPage.tsx# Steam slug simulation, temperature & viscosity decay
    │   │   ├── SrpOptimizerPage.tsx# SPM & stroke tuning, dynacards, rod floating risks
    │   │   ├── WhatIfSimulatorPage.tsx # "What happens if...?" multi-variable laboratory
    │   │   ├── FieldMapPage.tsx    # Leaflet map with 15 color-coded wells in Rajasthan
    │   │   ├── ProductionAnalyticsPage.tsx # Historical production, steam, SOR, and forecasts
    │   │   ├── EquipmentHealthPage.tsx # Mechanical risk gauges, alerts, and resolve action
    │   │   ├── OptimizationPage.tsx# Current vs Recommended Window & "Why?" explainability
    │   │   └── SettingsPage.tsx    # Diagnostics, API test, Baghewala reference datasheet
    │   ├── App.tsx                 # Router & global state
    │   ├── main.tsx                # React DOM root
    │   └── index.css               # Design tokens, Tailwind directives, custom scrollbars
    ├── tailwind.config.js          # Desert & petroleum navy color theme
    ├── .env                        # VITE_API_URL=http://localhost:8000/api
    └── package.json                # React, Lucide, Recharts, Leaflet dependencies
```

---

## Baghewala Heavy Oil Problem Formulation

Baghewala Field (Bikaner-Nagaur Basin, Western Rajasthan) produces heavy crude (~17–19° API) from the shallow Jodhpur Sandstone reservoir.
- **Native temperature:** ~46°–48°C
- **Native viscosity:** ~3,500–8,000 cP (poor primary mobility)
- **Coupled Challenge:**
  - CSS heats the near-wellbore formation (viscosity drops to 25–40 cP).
  - Over the production cycle, heat dissipates into bounding shale and overburden.
  - Temperature drops $\rightarrow$ viscosity increases exponentially $\rightarrow$ downstroke viscous drag on sucker rod string increases $\rightarrow$ buoyant rod weight is unable to overcome fluid friction.
  - Sucker rods **float** on the viscous column; when the surface walking beam reverses direction at bottom of stroke, it strikes the stalled polished rod with extreme **Impact Loading** (80–120 kN), precipitating rod buckling, thread fatigue, and surface unit vibration.
  - **WELL-NEX** provides the first coupled digital twin that balances thermal heat input with artificial lift kinematics.

---

## Beginner-Friendly Commands for Windows

### Step 1: Open PowerShell or Command Prompt
Navigate to the root project directory:
```powershell
cd c:\Users\user\Desktop\PROTOTYTPE\Well-Nex
```

### Step 2: Backend Setup (Python & FastAPI)
```powershell
# 1. Navigate to backend
cd backend

# 2. (Optional) Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install required Python packages
python -m pip install -r requirements.txt

# 4. Initialize and seed the SQLite database with 15 Baghewala wells
python seed.py

# 5. Start the FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
> The backend will be live at: **http://127.0.0.1:8000**  
> Interactive Swagger API Documentation: **http://127.0.0.1:8000/docs**

---

### Step 3: Frontend Setup (React & Vite)
Open a **new** PowerShell / Command Prompt terminal window:
```powershell
# 1. Navigate to frontend
cd c:\Users\user\Desktop\PROTOTYTPE\Well-Nex\frontend

# 2. Install dependencies (Node.js & npm)
npm install

# 3. Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
> The frontend application will be live at: **http://127.0.0.1:5173**

---

## Core Application Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | System health & metadata check |
| `/api/wells` | GET | Lists all 15 demonstration wells |
| `/api/wells/{id}` | GET | Detailed well properties & latest telemetry |
| `/api/wells/{id}/production` | GET | 30-day time-series production, steam, SOR, and energy |
| `/api/wells/{id}/css` | GET | Historical and active CSS cycles |
| `/api/wells/{id}/css/simulate` | POST | Thermodynamic near-wellbore thermal stimulation simulator |
| `/api/wells/{id}/css/apply` | POST | Updates well twin with simulated CSS parameters |
| `/api/wells/{id}/srp` | GET | SRP operating settings and dynamic card data |
| `/api/wells/{id}/srp/simulate` | POST | Mechanistic SRP simulation (PPRL, rod floating risk, dynacard) |
| `/api/wells/{id}/srp/apply` | POST | Applies simulated stroke length and SPM to the well |
| `/api/wells/{id}/equipment` | GET | Mechanical risk gauges and equipment alerts |
| `/api/equipment/{id}/resolve` | PATCH | Operator acknowledge & resolve action for mechanical alerts |
| `/api/wells/{id}/digital-twin` | GET | Coupled well-to-surface digital twin state with physics causality chain |
| `/api/wells/{id}/optimize` | POST | Joint multi-objective optimizer with explainable "Why?" reasons |
| `/api/wells/{id}/optimization/latest` | GET | Latest optimization recommendation |
| `/api/field/overview` | GET | Geospatial telemetry for Leaflet field map |
| `/api/dashboard/summary` | GET | Aggregate field KPIs, production trends, and attention alerts |

---

## Design System Tokens
- **Deep Petroleum Navy:** `#163B45`
- **Warm Sand:** `#D8C5A3`
- **Desert Beige:** `#F4EFE6`
- **Soft Cream:** `#FAF9F5`
- **Muted Teal:** `#4F8585`
- **Sage Green:** `#789681`
- **Copper / Amber:** `#B77B45`
- **Muted Red (Alerts only):** `#C25450`
