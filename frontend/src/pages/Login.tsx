import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importante para redirigir
import axios from 'axios'; // Importante para hacer la petición al backend

import logoInaaqc from '../assets/logo_inaaqc.svg';
import loginBg from '../assets/fondo_inaaqc.jpg';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Estado para mostrar errores
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); // Limpiamos errores previos
    
    try {
      // 1. El Disparo Real a Django
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });

      // 2. Si Django responde 200 OK, sacamos los tokens de la respuesta
      const { access, refresh } = response.data;

      // 3. Guardamos los tokens en la caja fuerte del navegador (Local Storage)
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // 4. ¡Redirigimos al Dashboard!
      navigate('/dashboard'); 

    } catch (error: any) {
      // Si el servidor responde con error 401 (No autorizado) o está caído
      if (error.response && error.response.status === 401) {
        setErrorMsg('Usuario o contraseña incorrectos.');
      } else {
        setErrorMsg('Error al conectar con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA: Formulario (50%) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 lg:p-24 z-10 relative bg-white">
        
        {/* Cabecera */}
        <div className="flex flex-col items-center mt-8">
          <div className="mb-6 shadow-xl rounded-full overflow-hidden border-4 border-slate-100 h-28 w-28 bg-white flex justify-center items-center">
            <img src={logoInaaqc} alt="Logo INAAQC" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-950 tracking-tight">INAAQC</h1>
          <p className="text-blue-600 text-sm mt-2 font-medium uppercase tracking-wider">
            Sistema Experto de Ingesta Clínica
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto w-full mt-12 flex-grow">
          
          {/* Mensaje de Error (Aparece solo si hay un error) */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Input Usuario */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">🧑‍⚕️ Usuario Institucional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50 outline-none transition-all text-slate-700 font-medium"
                placeholder="Ej: doc.armin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">🔑 Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50 outline-none transition-all text-slate-700 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-6 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Ingresar al Sistema
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center pb-4 pt-12 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Módulo de Acceso Restringido • Hospital Erasme</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Imagen de Fondo */}
      <div 
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-blue-900 mix-blend-multiply opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/40 to-transparent opacity-90"></div>
        
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Precisión y Trazabilidad</h2>
          <p className="text-blue-100 text-lg opacity-90 leading-relaxed max-w-lg">
            Plataforma centralizada para la ingesta y análisis de parámetros biomédicos en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;