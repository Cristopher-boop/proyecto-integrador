import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import UploadResults from './pages/Ingestion';
import Admissions from './pages/Admissions';
import Labs from './pages/Laboratory';
import Patients from './pages/Patients';
import LabTrends from './pages/LabTrends';
import BioSimulation from './pages/BioSimulation';
import ExpertSystemView from './pages/ExpertSystemView';
import ReportsView from './pages/ReportsView';
import LogsView from './pages/LogsView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta base redirige al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Pantalla de Login */}
          <Route path="/login" element={<Login />} />
          
          {/* RUTAS DEL DASHBOARD (Protegidas por autenticación y envueltas en el Layout) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Panel Principal: Acceso para todos los roles autenticados */}
            <Route index element={<DashboardHome />} />
            
            {/* Padrón de Pacientes: TI (solo lectura), Investigador, Doctor, Superadmin (CRUD) */}
            <Route path="patients" element={<Patients />} />

            {/* Admisiones UCI: TI (solo lectura), Investigador, Doctor, Superadmin (CRUD) */}
            <Route path="admissions" element={<Admissions />} />

            {/* Ingesta Documental & OCR: TI (subida y asignación), Investigador, Doctor, Superadmin */}
            <Route path="upload" element={<UploadResults />} />

            {/* Laboratorios Clínicos: TI (solo lectura), Investigador, Doctor, Superadmin (CRUD) */}
            <Route path="laboratory" element={<Labs />} />

            {/* Simulaciones Biomédicas: Bloqueado para TI; Permitido para Investigador, Doctor, Superadmin */}
            <Route 
              path="trends" 
              element={
                <ProtectedRoute allowedRoles={['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN']}>
                  <LabTrends />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="biosim" 
              element={
                <ProtectedRoute allowedRoles={['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN']}>
                  <BioSimulation />
                </ProtectedRoute>
              } 
            />

            {/* Inteligencia Clínica & BI: Bloqueado para TI e Investigador; Permitido para Doctor y Superadmin */}
            <Route 
              path="expert-system" 
              element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'SUPERADMIN']}>
                  <ExpertSystemView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="reports" 
              element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'SUPERADMIN']}>
                  <ReportsView />
                </ProtectedRoute>
              } 
            />

            {/* Auditoría & Logs: Exclusivo para Superadmin (Solo ver y filtrar, inmutable) */}
            <Route 
              path="logs" 
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <LogsView />
                </ProtectedRoute>
              } 
            />
            
            <Route path="settings" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;