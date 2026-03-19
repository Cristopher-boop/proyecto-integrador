import { useState } from 'react'

function App() {
  // Estado para saber si estamos en modo Login (true) o modo Registro (false)
  const [isLogin, setIsLogin] = useState(true); 
  
  // Estado unificado para todos los datos posibles
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',            // Usado para el Login de Django
    contraseña: '',          // Usado para tu servicio de Registro
    nombre_completo: '',     // Solo Registro
    correo_electronico: ''   // Solo Registro
  });
  
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función para alternar entre Login y Registro y limpiar mensajes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMensaje(null);
    setError(null);
    setFormData({ nombre_usuario: '', password: '', contraseña: '', nombre_completo: '', correo_electronico: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    // Decidimos a qué URL golpear dependiendo del modo actual
    const url = isLogin 
      ? 'http://127.0.0.1:8000/api/login/' 
      : 'http://127.0.0.1:8000/api/usuarios/registro/';
    
    // Preparamos el paquete de datos dependiendo del modo
    const bodyData = isLogin 
      ? { nombre_usuario: formData.nombre_usuario, password: formData.password }
      : { 
          nombre_usuario: formData.nombre_usuario, 
          contraseña: formData.contraseña, 
          nombre_completo: formData.nombre_completo, 
          correo_electronico: formData.correo_electronico 
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setMensaje(`¡Login Exitoso! Tu token VIP está guardado.`);
        } else {
          setMensaje(`¡Usuario ${data.nombre_usuario} creado! Cambiando a Login...`);
          // Si el registro es exitoso, esperamos 2 segundos y cambiamos la pantalla a Login automáticamente
          setTimeout(() => { setIsLogin(true); setMensaje(null); }, 2000);
        }
        // Limpiamos el formulario
        setFormData({ nombre_usuario: '', password: '', contraseña: '', nombre_completo: '', correo_electronico: '' });
      } else {
        // Manejo de errores dinámico
        setError(data.error ? data.error[0] : (data.detail || 'Error en las credenciales o datos.'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor. ¿Django está encendido?');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2">INAAQC</h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Ingresa tus credenciales para acceder' : 'Completa tus datos para crear una cuenta'}
          </p>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r shadow-sm text-sm">
            {mensaje}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r shadow-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Este campo se muestra en AMBOS modos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
            <input 
              type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChange} required 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Estos campos SOLO se muestran si estamos en modo REGISTRO (!isLogin) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Contraseña: Cambia el 'name' dependiendo del modo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input 
              type={isLogin ? "password" : "text"} /* En registro dejamos que la vea, en login la ocultamos */
              name={isLogin ? "password" : "contraseña"} 
              value={isLogin ? formData.password : formData.contraseña} 
              onChange={handleChange} required 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors mt-4">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        {/* El botón mágico para cambiar de pantalla */}
        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default App