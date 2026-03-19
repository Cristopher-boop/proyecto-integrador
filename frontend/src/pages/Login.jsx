import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ nombre_usuario: '', password: '' });
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Herramienta para cambiar de página automáticamente

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null); setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setMensaje('¡Login Exitoso!');
        // Aquí en el futuro lo enviaremos al Dashboard: navigate('/dashboard');
      } else {
        setError(data.error ? data.error[0] : (data.detail || 'Credenciales incorrectas.'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2">INAAQC</h2>
          <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder</p>
        </div>

        {mensaje && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm">{mensaje}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
            <input type="text" name="nombre_usuario" onChange={handleChange} required className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-blue-500" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mt-4">Iniciar Sesión</button>
        </form>

        <div className="mt-6 text-center">
          {/* Usamos el componente Link en lugar de la etiqueta <a> para que la página no recargue */}
          <Link to="/registro" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;