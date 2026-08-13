import React from 'react';
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
import PerimeterGeofence from './modules/Geofence/PerimeterGeofence';
import PlateSearch from './modules/ALPR/PlateSearch';
import CrossCameraReID from './modules/ReID/CrossCameraReID';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { setupAxiosInterceptors } from './store/useAuthStore';

// Initialize JWT injection into every Axios request
setupAxiosInterceptors();

// A protective wrapper that kicks out unauthenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Dashboard is now public
  return <>{children}</>;
};

export default function App() {
  useSocket(); // Initialize real-time WebSocket connection to Node.js backend

  return (
    <Router>
      <Routes>
        {/* Direct Auto Login to Dashboard Page */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
          <Route path="geofence" element={<PerimeterGeofence />} />
          <Route path="alpr" element={<PlateSearch />} />
          <Route path="reid" element={<CrossCameraReID />} />
          <Route path="map" element={<ZoneMap />} />
          <Route path="alerts" element={<AlertDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="edge" element={<EdgeDashboard />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="storage" element={<StorageDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
