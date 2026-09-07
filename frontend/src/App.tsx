import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import UISandbox from './pages/UISandbox';
import ReportsView from './pages/ReportsView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta base redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Pantalla de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS DEL DASHBOARD (Envueltas en el Layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          <Route index element={<DashboardHome />} />
          
          {/* Ruta real para el Episodio Clínico */}
          <Route path="admissions" element={<Admissions />} />

          <Route path="patients" element={<Patients />} />

          <Route path="trends" element={<LabTrends />} />

          <Route path="biosim" element={<BioSimulation />} />

          <Route path="expert-system" element={<ExpertSystemView />} />

          <Route path="sandbox" element={<UISandbox />} />

          <Route path="laboratory" element={<Labs />} />
          
          <Route path="upload" element={<UploadResults />} />
          
          <Route path="reports" element={<ReportsView />} />
          
          <Route path="settings" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
        
        </Route>

      </Routes>
    </Router>
  );
}

export default App;