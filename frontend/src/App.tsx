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
import NeuralPrototype from './pages/NeuralPrototype';
import UISandbox from './pages/UISandbox';
import { AuditSplitView } from './features/visualizer/views/AuditSplitView';
import { LaboratoryView } from './features/laboratory/views/LaboratoryView';

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

          <Route path="prototype" element={<NeuralPrototype />} />

          <Route path="sandbox" element={<UISandbox />} />

          <Route path="pruebas/auditoria" element={
            <AuditSplitView 
              onClose={() => alert('Cerrando')} 
              idArchivo="123" 
              nombreArchivo="LAB_ANALISIS_001.pdf" 
              tipo="PDF" 
              documentoUrl="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
            />
          } />

          <Route path="pruebas/laboratory" element={< LaboratoryView />} />

          <Route path="labs" element={<Labs />} />
          
          <Route path="upload" element={<UploadResults />} />
          
          <Route path="reports" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Reportes y Analítica</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="settings" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
        
        </Route>

      </Routes>
    </Router>
  );
}

export default App;