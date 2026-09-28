import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OpeningAnimation } from './components/OpeningAnimation';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { CssOptimizerPage } from './pages/CssOptimizerPage';
import { SrpOptimizerPage } from './pages/SrpOptimizerPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { FieldMapPage } from './pages/FieldMapPage';
import { ProductionAnalyticsPage } from './pages/ProductionAnalyticsPage';
import { EquipmentHealthPage } from './pages/EquipmentHealthPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api/client';
import { UserProfile, WellSummary } from './types';

// Scroll to top upon navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Initial Opening Animation (Splash Screen) state on open/reload
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // 2. Authentication session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('wellnex_user') || sessionStorage.getItem('wellnex_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [wells, setWells] = useState<WellSummary[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<number>(1);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  const checkConnectivityAndWells = async () => {
    try {
      const [health, wellsList] = await Promise.all([
        api.getHealth(),
        api.getWells(),
      ]);
      setIsBackendConnected(true);
      if (wellsList && wellsList.length > 0) {
        setWells(wellsList);
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    checkConnectivityAndWells();
    const interval = setInterval(checkConnectivityAndWells, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Splash Complete after ~2.2 - 2.4s
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Handle Login Success
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('wellnex_user');
    localStorage.removeItem('wellnex_token');
    sessionStorage.removeItem('wellnex_user');
    sessionStorage.removeItem('wellnex_token');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <>
      {/* 1. Initial Opening Animation (Splash Screen) */}
      {showSplash && <OpeningAnimation onComplete={handleSplashComplete} />}

      {/* 2. Main Application Flow */}
      <div
        className={`min-h-screen flex flex-col bg-cream-soft font-sans text-petroleum-navy transition-opacity duration-500 ${
          showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Render Navbar only when user is logged in and not on login page */}
        {currentUser && location.pathname !== '/login' && (
          <Navbar
            selectedWellId={selectedWellId}
            onSelectWell={(id) => setSelectedWellId(id)}
            wells={wells}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1">
          <Routes>
            {/* If not logged in and on root or login, render LoginPage */}
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/home" replace />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Root Route: If logged in -> Home / Landing Page, If not logged in -> LoginPage */}
            <Route
              path="/"
              element={
                currentUser ? (
                  <Navigate to="/home" replace />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* WELL-NEX HOME / LANDING PAGE: Main Engineering Hub */}
            <Route
              path="/home"
              element={
                currentUser ? (
                  <HomePage
                    selectedWellId={selectedWellId}
                    wells={wells}
                    onSelectWell={(id) => setSelectedWellId(id)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Overview / Landing view when authenticated */}
            <Route
              path="/overview"
              element={<LandingPage selectedWellId={selectedWellId} />}
            />

            {/* Dashboard: The primary destination after login */}
            <Route
              path="/dashboard"
              element={
                currentUser ? (
                  <DashboardPage onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/digital-twin"
              element={
                currentUser ? (
                  <DigitalTwinPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/digital-twin/:id"
              element={
                currentUser ? (
                  <DigitalTwinPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/css-optimizer"
              element={
                currentUser ? (
                  <CssOptimizerPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/css-optimizer/:id"
              element={
                currentUser ? (
                  <CssOptimizerPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/srp-optimizer"
              element={
                currentUser ? (
                  <SrpOptimizerPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/srp-optimizer/:id"
              element={
                currentUser ? (
                  <SrpOptimizerPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/what-if"
              element={
                currentUser ? (
                  <WhatIfSimulatorPage
                    selectedWellId={selectedWellId}
                    wells={wells}
                    onSelectWell={(id) => setSelectedWellId(id)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/field-map"
              element={
                currentUser ? (
                  <FieldMapPage onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/production"
              element={
                currentUser ? (
                  <ProductionAnalyticsPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/production/:id"
              element={
                currentUser ? (
                  <ProductionAnalyticsPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/equipment"
              element={
                currentUser ? (
                  <EquipmentHealthPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/equipment/:id"
              element={
                currentUser ? (
                  <EquipmentHealthPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/optimization"
              element={
                currentUser ? (
                  <OptimizationPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/optimization/:id"
              element={
                currentUser ? (
                  <OptimizationPage wellId={selectedWellId} onSelectWell={(id) => setSelectedWellId(id)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/settings"
              element={
                currentUser ? (
                  <SettingsPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer rendered only when logged in and not on login page */}
        {currentUser && location.pathname !== '/login' && <Footer />}
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
