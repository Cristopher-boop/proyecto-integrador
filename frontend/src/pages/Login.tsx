import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

// Importamos tus imágenes directamente de la carpeta assets
import logoInaaqc from '../assets/logo_inaaqc.svg';
// Asegúrate de que el nombre coincida con tu imagen sin franjas negras
import loginBg from '../assets/fondo_inaaqc.jpg'; 

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulamos una carga de 2 segundos para dar el "efecto real" en la presentación
    setTimeout(() => {
      console.log('Iniciando sesión con:', username);
      alert(`¡Login Exitoso, ${username}! (Conectaremos la API de Django después de la presentación)`);
      setIsLoading(false);
      setUsername('');
      setPassword('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA: Formulario (50%) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 lg:p-24 z-10 relative bg-white">
        
        {/* Cabecera con tu Logo SVG */}
        <div className="flex flex-col items-center mt-8">
          
          {/* LA CORRECCIÓN DEL LOGO: Limpio, circular y sin forzar el escalado que lo volvía negro */}
          <div className="mb-6 shadow-xl rounded-full overflow-hidden border-4 border-slate-100 h-28 w-28 bg-white flex justify-center items-center">
            <img 
              src={logoInaaqc} 
              alt="Logo INAAQC" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <h1 className="text-4xl font-extrabold text-blue-950 tracking-tight">
            INAAQC
          </h1>
          <p className="text-blue-600 text-sm mt-2 font-medium uppercase tracking-wider">
            Sistema Experto de Ingesta Clínica
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto w-full mt-12 flex-grow">
          
          {/* Input Usuario */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Usuario Institucional
            </label>
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
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Contraseña
            </label>
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
        
        {/* Footer del Formulario */}
        <div className="text-center pb-4 pt-12 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Módulo de Acceso Restringido • Hospital Erasme
          </p>
        </div>

      </div>

      {/* SECCIÓN DERECHA: Imagen de Fondo (50%) */}
      <div 
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        // bg-cover asegura que la imagen llene el espacio, y tú ya solucionaste lo de las franjas
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        {/* Capas superpuestas (Overlay) para un tono azul institucional profesional */}
        <div className="absolute inset-0 bg-blue-900 mix-blend-multiply opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/40 to-transparent opacity-90"></div>
        
        {/* Texto sobre la imagen */}
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