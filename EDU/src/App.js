import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Toast from './components/Toast';

import Home                from './pages/Home';
import Login               from './pages/Login';
import Dashboard           from './pages/Dashboard';
import Forum               from './pages/Forum';
import StudyMaterials      from './pages/StudyMaterials';
import GPACalculator       from './pages/GPACalculator';
import ResultTracker       from './pages/ResultTracker';
import AttendanceCalculator from './pages/AttendanceCalculator';
import StudyPlanner        from './pages/StudyPlanner';
import AITools             from './pages/AITools';
import StudyGroups         from './pages/StudyGroups';
import Settings            from './pages/Settings';
import './index.css';

function Guard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/dashboard"  element={<Guard><Dashboard /></Guard>} />
      <Route path="/forum"      element={<Guard><Forum /></Guard>} />
      <Route path="/materials"  element={<Guard><StudyMaterials /></Guard>} />
      <Route path="/gpa"        element={<Guard><GPACalculator /></Guard>} />
      <Route path="/results"    element={<Guard><ResultTracker /></Guard>} />
      <Route path="/attendance" element={<Guard><AttendanceCalculator /></Guard>} />
      <Route path="/planner"    element={<Guard><StudyPlanner /></Guard>} />
      <Route path="/ai"         element={<Guard><AITools /></Guard>} />
      <Route path="/studygroups" element={<Guard><StudyGroups /></Guard>} />
      <Route path="/settings"   element={<Guard><Settings /></Guard>} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Toast />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
