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
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const GlobalErrorFallback = ({ error, resetErrorBoundary }) => {
  const handleReset = () => {
    localStorage.clear();
    resetErrorBoundary();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="h-20 w-20 bg-rose-50 rounded-[28px] flex items-center justify-center text-rose-500 mx-auto shadow-inner">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-800">Ups, algo salió mal</h1>
          <p className="text-sm text-slate-500 font-medium">
            La aplicación ha encontrado un error inesperado. Esto puede deberse a datos corruptos en la sesión.
          </p>
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-4 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detalles del error</p>
          <p className="text-[11px] font-mono text-rose-600 break-all bg-white p-2 rounded-lg border border-slate-100">
            {error?.message || 'Error desconocido'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <RefreshCw size={16} /> Reintentar Cargar
          </button>
          
          <button
            onClick={handleReset}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Limpiar Datos y Reiniciar
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 font-medium">
          Si el problema persiste, contacte con soporte técnico.
        </p>
      </div>
    </div>
  );
};

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
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
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
    </ErrorBoundary>
  );
}

export default App;
