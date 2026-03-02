import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Patients from './pages/patients/Patients';
import Agenda from './pages/agenda/Agenda';
import History from './pages/history/History';
import Settings from './pages/settings/Settings';
import MainLayout from './components/layout/MainLayout';
import PatientProfileView from './components/PatientProfileView';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import Register from './pages/auth/Register';
import Finance from './pages/finance/Finance';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/20 to-transparent"></div>
      <Loader2 className="animate-spin text-cyan-600 w-10 h-10 relative z-10" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.needsSetup) return <Navigate to="/setup" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup" element={<OnboardingWizard />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/expediente/:id/:module?" element={<ProtectedRoute><PatientProfileView /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
