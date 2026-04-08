import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';

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
          
          {/* Rutas temporales funcionales para el menú clínico */}
          <Route path="admissions" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Módulo de Admisiones</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="patients" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Directorio de Pacientes</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="labs" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Resultados de Laboratorio</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="upload" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Ingesta de Datos (Drag & Drop)</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="reports" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Reportes y Analítica</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
          
          <Route path="settings" element={<div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2><p className="text-slate-500 mt-2">Área en construcción...</p></div>} />
        
        </Route>

      </Routes>
    </Router>
  );
}

export default App;