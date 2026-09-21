import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { tokenStorage } from '../utils/tokenStorage';
import { INAAQC_THEME } from '../../../config/theme';

import logoInaaqc from '../../../assets/logo_inaaqc.svg';
import loginBg from '../../../assets/fondo_inaaqc.jpg';

export const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { palette } = INAAQC_THEME;

  // Si el usuario ya está autenticado, redirigir inmediatamente al dashboard
  useEffect(() => {
    if (isAuthenticated || tokenStorage.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login({
        username,
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMsg('Credenciales inválidas. Verifique su usuario y contraseña.');
      } else {
        setErrorMsg('Error al conectar con el servidor de autenticación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white dark:bg-[#0F1A24] overflow-hidden selection:bg-[#87C7FF] selection:text-white transition-colors duration-200">
      {/* SECCIÓN IZQUIERDA: Formulario de Autenticación */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-20 z-10 relative bg-white dark:bg-[#0F1A24] transition-colors duration-200">
        {/* Cabecera / Identidad */}
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <div
            className="mb-5 shadow-lg rounded-full overflow-hidden border-2 h-24 w-24 bg-white dark:bg-[#15232F] flex justify-center items-center transition-transform hover:scale-105 border-[#87C7FF]"
          >
            <img src={logoInaaqc} alt="Logo INAAQC" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-center text-[#1E3040] dark:text-[#F1F5F9]">
            INAAQC
          </h1>
          <p
            className="text-xs sm:text-sm mt-1.5 font-bold uppercase tracking-widest text-center"
            style={{ color: palette.highlight }}
          >
            Sistema Experto de Ingesta Clínica
          </p>
          <div
            className="h-1 w-12 rounded-full mt-3"
            style={{ backgroundColor: palette.highlight }}
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5 max-w-sm mx-auto w-full my-8 flex-grow flex flex-col justify-center">
          {errorMsg && (
            <div
              className="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border animate-shake"
              style={{
                backgroundColor: INAAQC_THEME.status.warning.bg,
                color: INAAQC_THEME.status.warning.text,
                borderColor: INAAQC_THEME.status.warning.border,
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Campo Usuario */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#334759] dark:text-slate-300">
              Usuario Institucional
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#1E3040] dark:group-focus-within:text-[#87C7FF] text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="username"
                className="block w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-slate-50/50 dark:bg-[#15232F] border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 focus:border-[#87C7FF] focus:ring-2 focus:ring-[#87C7FF]/20"
                placeholder="Ej: doc.armin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#334759] dark:text-slate-300">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#1E3040] dark:group-focus-within:text-[#87C7FF] text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="block w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-slate-50/50 dark:bg-[#15232F] border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 focus:border-[#87C7FF] focus:ring-2 focus:ring-[#87C7FF]/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Botón de Entrada */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 mt-3 rounded-xl shadow-md text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: palette.highlight,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Pie de Página */}
        <div className="text-center pt-6 border-t border-slate-200 dark:border-[#334759]">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Módulo de Acceso Restringido • Hospital Erasme • INAAQC
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Imagen de Fondo y Banner Clínico */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        {/* Capa de mezcla tonal INAAQC */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-multiply"
          style={{ backgroundColor: palette.base }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `linear-gradient(to top, ${palette.base} 0%, ${palette.base}B3 50%, transparent 100%)`,
          }}
        />

        <div className="absolute bottom-16 left-12 right-12 text-white">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: `${palette.highlight}25`,
              borderColor: `${palette.highlight}60`,
              color: palette.highlight,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: palette.highlight }} />
            Seguridad Clínica y Trazabilidad
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight leading-snug text-white">
            Monitoreo Clínico y Análisis Predictivo
          </h2>
          <p className="text-sm lg:text-base leading-relaxed max-w-lg text-slate-200">
            Plataforma centralizada para la ingesta, validación OCR determinista y cálculo automatizado de escalas de severidad SOFA y SAPS 3 en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
