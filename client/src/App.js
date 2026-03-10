import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';

import Home           from './pages/Home';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Forum          from './pages/Forum';
import StudyMaterials from './pages/StudyMaterials';
import GPACalculator  from './pages/GPACalculator';
import './index.css';

function Guard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="/forum"     element={<Guard><Forum /></Guard>} />
      <Route path="/materials" element={<Guard><StudyMaterials /></Guard>} />
      <Route path="/gpa"       element={<Guard><GPACalculator /></Guard>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Toast />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
