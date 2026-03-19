import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Si alguien entra a la raíz, lo mandamos al login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Nuestras rutas definidas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;