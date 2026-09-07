import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth, tokenStorage } from '../../features/auth';
import type { UserRole } from '../../features/auth';
import { INAAQC_THEME } from '../../config/theme';
import { Button } from '../common/Button';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, hasRole, user } = useAuth();
  const navigate = useNavigate();
  const adobe = INAAQC_THEME.palette;

  if (!isAuthenticated && !tokenStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md border"
          style={{ backgroundColor: `${adobe.base}10`, borderColor: `${adobe.base}30` }}
        >
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: adobe.base }}>
          Acceso Restringido (403)
        </h2>
        <p className="text-sm text-slate-600 max-w-md mb-2 leading-relaxed">
          Su rol institucional actual (<strong className="text-teal-700">{user?.rol || 'Sin Rol'}</strong>) no cuenta con privilegios suficientes para operar en este módulo.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Si considera que esto es un error, por favor contacte al Administrador del Sistema.
        </p>
        <Button
          variant="primary"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Volver al Panel Principal
        </Button>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
