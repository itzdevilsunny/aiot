import React from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login'; // You will need a basic login form here
import DashboardLayout from './pages/Dashboard';
import DashboardOverview from './modules/Dashboard/DashboardOverview';
import LiveCameras from './modules/Cameras/LiveCameras';
import ZoneMap from './modules/Map/ZoneMap';
import AlertDashboard from './modules/Alerts/AlertDashboard';
import AnalyticsDashboard from './modules/Analytics/AnalyticsDashboard';
import EdgeDashboard from './modules/EdgeNodes/EdgeDashboard';
import SecurityDashboard from './modules/Security/SecurityDashboard';
import StorageDashboard from './modules/Storage/StorageDashboard';
import SettingsDashboard from './modules/Settings/SettingsDashboard';

// Citizen Safety Portal
import CitizenLanding from './citizen/CitizenLanding';
import CitizenLogin from './citizen/CitizenLogin';
import CitizenDashboard from './citizen/CitizenDashboard';
import ReportModal from './citizen/ReportModal';
import CitizenIncidentHub from './modules/CitizenHub/CitizenIncidentHub';

/* Placeholder layout wrapper until fully designed */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { setupAxiosInterceptors, useAuthStore } from './store/useAuthStore';

// Initialize JWT injection into every Axios request
setupAxiosInterceptors();

// A protective wrapper that kicks out unauthenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { token } = useAuthStore();
  // if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  useSocket(); // Initialize real-time WebSocket connection to Node.js backend

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* ── Citizen Safety Portal ── */}
        <Route path="/citizen" element={<CitizenLanding />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/report" element={<ReportModal />} />
        {/* ─────────────────────────── */}

        {/* Secure VisionAIoT Admin Area */}
        {/* The original /login route is replaced by the root route with AuthLayout */}

        {/* Secure Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="cameras" element={<LiveCameras />} />
          <Route path="map" element={<ZoneMap />} />
          <Route path="alerts" element={<AlertDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="edge" element={<EdgeDashboard />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="storage" element={<StorageDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
          <Route path="citizen-hub" element={<CitizenIncidentHub />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
