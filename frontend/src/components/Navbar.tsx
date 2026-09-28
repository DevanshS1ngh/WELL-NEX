import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Activity,
  Flame,
  Gauge,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Settings as SettingsIcon,
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile, WellSummary } from '../types';

interface NavbarProps {
  selectedWellId: number;
  onSelectWell: (id: number) => void;
  wells: WellSummary[];
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedWellId,
  onSelectWell,
  wells,
  currentUser,
  onLogout,
}) => {
  const location = useLocation();

  // Navigation Links structured with clear engineering hierarchy:
  // Primary Engineering -> Secondary Surveillance & Analytics -> Utility Settings
  const primaryLinks = [
    { to: '/home', label: 'Home', icon: Home },
    { to: `/digital-twin/${selectedWellId}`, label: 'Digital Twin', icon: Activity },
    { to: `/css-optimizer/${selectedWellId}`, label: 'CSS Optimizer', icon: Flame },
    { to: `/srp-optimizer/${selectedWellId}`, label: 'SRP Optimizer', icon: Gauge },
  ];

  const secondaryLinks = [
    { to: `/production/${selectedWellId}`, label: 'Production', icon: TrendingUp },
    { to: `/equipment/${selectedWellId}`, label: 'Equipment Health', icon: ShieldAlert },
    { to: `/optimization/${selectedWellId}`, label: 'Optimization', icon: Sliders },
  ];

  const utilityLinks = [
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-light/95 backdrop-blur-md border-b border-sand-warm/50 shadow-soft-sm">
      {/* Top Bar: Clean Enterprise Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* LEFT: WELL-NEX Logo + Subtitle + Field Tag */}
        <div className="flex items-center gap-3">
          <NavLink to="/home" className="hover:opacity-90 transition-opacity">
            <Logo size="md" showSubtitle={true} />
          </NavLink>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-sand-warm/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-petroleum-light font-bold">
              FIELD:
            </span>
            <span className="text-xs font-semibold text-petroleum-navy">
              Baghewala Heavy Oil
            </span>
          </div>
        </div>

        {/* CENTER / LEFT: Active Well Quick-Selector */}
        {wells.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-petroleum-light hidden sm:inline">
              Active Well:
            </span>
            <div className="relative">
              <select
                value={selectedWellId}
                onChange={(e) => onSelectWell(Number(e.target.value))}
                className="appearance-none bg-white border border-sand-warm rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-petroleum-navy shadow-soft-sm hover:border-petroleum-navy focus:outline-none focus:ring-1 focus:ring-petroleum-navy cursor-pointer transition-colors"
              >
                {wells.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.well_name} • {w.reservoir_temperature.toFixed(0)}°C ({w.production_rate.toFixed(0)} bpd)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-petroleum-light absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* RIGHT: Subtle Synthetic Data Indicator + User Profile + Logout */}
        <div className="flex items-center gap-3">
          {/* Subtle Demonstration Data badge (Non-dominant) */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-light/60 border border-sand-warm/40 text-[10px] font-mono text-petroleum-light">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-copper/80" />
            <span>Demonstration Data</span>
          </div>

          {/* User profile & Logout action */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-sand-warm/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-petroleum-navy text-sand-warm flex items-center justify-center font-bold text-xs shadow-2xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-petroleum-navy leading-tight line-clamp-1">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-amber-copper leading-tight line-clamp-1">
                    {currentUser.role.split(' ')[0]} Engineer
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-white border border-sand-warm text-petroleum-light hover:text-alert-red hover:border-alert-red/40 transition-colors shadow-2xs cursor-pointer ml-1"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-sand-light/70 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between py-1 min-w-max">
          
          {/* Left Group: Primary Engineering Modules + Secondary */}
          <div className="flex items-center space-x-1">
            {/* Primary Engineering */}
            {primaryLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                (item.to !== '/home' && location.pathname.startsWith(item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to));
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-petroleum-navy text-sand-warm shadow-soft font-semibold'
                      : 'text-petroleum-navy/80 hover:text-petroleum-navy hover:bg-sand-light/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="h-4 w-px bg-sand-warm/60 mx-1" />

            {/* Secondary Surveillance & Analytics */}
            {secondaryLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to);
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-petroleum-navy text-sand-warm shadow-soft font-semibold'
                      : 'text-petroleum-navy/75 hover:text-petroleum-navy hover:bg-sand-light/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Group: Utility Settings */}
          <div className="flex items-center space-x-1 pl-2">
            {utilityLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-petroleum-navy text-sand-warm shadow-soft font-semibold'
                      : 'text-petroleum-navy/70 hover:text-petroleum-navy hover:bg-sand-light/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

        </div>
      </nav>
    </header>
  );
};
