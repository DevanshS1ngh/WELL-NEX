import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Flame,
  Gauge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { api } from '../api/client';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('demo@wellnex.com');
  const [password, setPassword] = useState<string>('WellNex@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessTransition, setIsSuccessTransition] = useState<boolean>(false);

  const demoAccounts = [
    {
      label: 'Demo Account',
      username: 'demo@wellnex.com',
      password: 'WellNex@123',
      badge: 'Recommended',
    },
    {
      label: 'Operations Engineer',
      username: 'engineer@wellnex.ai',
      password: 'Baghewala2026',
      badge: 'Lead Eng',
    },
    {
      label: 'Asset Director',
      username: 'admin',
      password: 'wellnex123',
      badge: 'Supervisor',
    },
    {
      label: 'Field Specialist',
      username: 'operator@baghewala.in',
      password: 'WellNex2026',
      badge: 'CSS / SRP',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Real backend authentication call
      const res = await api.login({ username, password });

      // Save user session
      if (rememberMe) {
        localStorage.setItem('wellnex_user', JSON.stringify(res.user));
        localStorage.setItem('wellnex_token', res.access_token);
      } else {
        sessionStorage.setItem('wellnex_user', JSON.stringify(res.user));
        sessionStorage.setItem('wellnex_token', res.access_token);
      }

      // Smooth transition to Home / Landing Page
      setIsSuccessTransition(true);
      setTimeout(() => {
        onLoginSuccess(res.user);
        navigate('/home');
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleSelectDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div
      className={`min-h-screen bg-cream-soft flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-opacity duration-300 ${
        isSuccessTransition ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Petroleum Desert Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#163B4508_1px,transparent_1px),linear-gradient(to_bottom,#163B4508_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Main Centered 2-Column Split Portal Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl border-2 border-sand-warm/70 shadow-soft-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Petroleum Engineering Identity & Visual Digital Twin Concept */}
        <div className="lg:col-span-6 bg-gradient-to-br from-petroleum-navy via-petroleum-deep to-petroleum-dark text-sand-light p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-muted/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-copper/15 blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-soft-sm">
                <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7 text-sand-warm">
                  <line x1="8" y1="8" x2="32" y2="8" stroke="#D8C5A3" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="8" r="2.5" fill="#FAF9F5" stroke="#B77B45" strokeWidth="1.5" />
                  <line x1="20" y1="8" x2="20" y2="34" stroke="#4F8585" strokeWidth="2" />
                  <circle cx="20" cy="18" r="2.8" fill="#B77B45" stroke="#FAF9F5" strokeWidth="1" />
                  <ellipse cx="20" cy="27" rx="6" ry="2.5" stroke="#D8C5A3" strokeWidth="1.2" strokeDasharray="2 1.5" />
                  <circle cx="20" cy="27" r="2" fill="#789681" />
                  <path d="M12 34 Q 20 31 28 34" stroke="#D8C5A3" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-display font-extrabold tracking-tight text-sand-warm">
                  WELL<span className="text-amber-copper">-</span>NEX
                </h2>
                <span className="text-xs font-display font-medium text-sand-warm/80 tracking-wide">
                  Well-to-Surface Intelligence
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-sand-warm/90">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-copper" />
              <span>Baghewala Field • Jodhpur Sandstone • 18° API</span>
            </div>
          </div>

          {/* Center: Digital Twin Concept Graphic (Reservoir -> Wellbore -> SRP -> Surface) */}
          <div className="relative z-10 my-8 py-5 px-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sand-warm/70 font-semibold block">
              Integrated Digital Twin Architecture
            </span>

            {/* Visual Node Flow Line */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-muted/30 border border-teal-muted/40 flex items-center justify-center text-teal-light shrink-0">
                  <Activity className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-sand-warm">Surface Pumping Unit & VFD</div>
                  <div className="text-[11px] text-sand-warm/70">Motor speed, torque, electrical lifting energy</div>
                </div>
              </div>

              <div className="w-0.5 h-3 bg-white/20 ml-3.5" />

              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-copper/30 border border-amber-copper/40 flex items-center justify-center text-amber-warm shrink-0">
                  <Gauge className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-sand-warm">Sucker Rod String & SRP Plunger</div>
                  <div className="text-[11px] text-sand-warm/70">Downstroke viscous drag & rod floating prevention</div>
                </div>
              </div>

              <div className="w-0.5 h-3 bg-white/20 ml-3.5" />

              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-sage-green/30 border border-sage-green/40 flex items-center justify-center text-sage-light shrink-0">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-sand-warm">CSS Thermal Steam Stimulation</div>
                  <div className="text-[11px] text-sand-warm/70">Near-wellbore heat transfer & viscosity reduction</div>
                </div>
              </div>

              <div className="w-0.5 h-3 bg-white/20 ml-3.5" />

              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-sand-warm/20 border border-sand-warm/30 flex items-center justify-center text-sand-warm shrink-0">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-sand-warm">Jodhpur Sandstone Reservoir</div>
                  <div className="text-[11px] text-sand-warm/70">Heavy crude mobility, permeability, inflow</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="relative z-10 pt-2 border-t border-white/10 text-xs text-sand-warm/80 leading-relaxed font-sans">
            "Integrated intelligence for heavy-oil thermal recovery and artificial-lift optimization."
          </div>
        </div>

        {/* Right Column: Clean Login Card */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-white space-y-6">
          
          <div>
            <div className="mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-copper bg-amber-pale px-2.5 py-1 rounded-full border border-amber-copper/30 inline-block mb-2">
                OPERATIONS PORTAL
              </span>
              <h3 className="text-2xl font-display font-extrabold text-petroleum-navy">
                Welcome to WELL-NEX
              </h3>
              <p className="text-xs text-petroleum-light mt-1">
                Sign in to access the Baghewala Field Digital Twin.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-alert-pale border border-alert-red/30 text-xs text-alert-dark flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-alert-red shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username/Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-petroleum-navy block">
                  Username or Operations Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-petroleum-light">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="engineer@wellnex.ai"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-petroleum-navy bg-cream-soft border border-sand-warm rounded-xl focus:outline-none focus:ring-2 focus:ring-petroleum-navy focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-petroleum-navy">Password</label>
                  <span className="text-[11px] text-petroleum-light font-mono">Demo: Baghewala2026</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-petroleum-light">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-petroleum-navy bg-cream-soft border border-sand-warm rounded-xl focus:outline-none focus:ring-2 focus:ring-petroleum-navy focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-petroleum-light hover:text-petroleum-navy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-petroleum-navy">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-sand-warm text-petroleum-navy focus:ring-petroleum-navy w-4 h-4 cursor-pointer accent-petroleum-navy"
                  />
                  <span>Remember me on this workstation</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-petroleum-navy hover:bg-petroleum-dark text-sand-warm text-xs font-bold transition-all shadow-soft flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Digital Twin'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Quick Demo Credentials Autofill Section */}
            <div className="mt-6 pt-5 border-t border-sand-light">
              <span className="text-[11px] font-mono text-petroleum-light uppercase font-semibold block mb-2">
                Quick Demo Access (One-Click Sign In)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectDemo(acc.username, acc.password)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                      username === acc.username
                        ? 'border-petroleum-navy bg-desert-beige/70 font-semibold shadow-xs'
                        : 'border-sand-warm/60 bg-cream-soft hover:bg-desert-beige/40 text-petroleum-light'
                    }`}
                  >
                    <div className="font-bold text-petroleum-navy line-clamp-1">{acc.label}</div>
                    <div className="text-[10px] font-mono text-amber-copper">{acc.badge}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-sand-light flex items-center justify-between text-[11px] text-petroleum-light">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-green" />
              <span>FastAPI Secured Session</span>
            </span>
            <span className="font-mono text-sand-dark">Demonstration Data</span>
          </div>

        </div>

      </div>
    </div>
  );
};
