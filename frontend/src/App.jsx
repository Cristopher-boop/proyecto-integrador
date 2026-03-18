import { useState } from 'react'

function App() {
  // 1. LOS ESTADOS: Aquí guardamos lo que el usuario escribe en tiempo real
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    nombre_completo: '',
    correo_electronico: '',
    contraseña: ''
  });
  
  // Estados para manejar mensajes visuales
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // 2. MANEJADOR DE CAMBIOS: Actualiza el estado cada vez que se teclea algo
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. EL ENVÍO (SUBMIT): Lo que pasa al hacer clic en "Registrarse"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento web antiguo)
    setMensaje(null);
    setError(null);

    try {
      // Usamos fetch para llamar al "mesero" (la API REST de Django)
      const response = await fetch('http://127.0.0.1:8000/api/usuarios/registro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Le decimos que hablamos en JSON
        },
        body: JSON.stringify(formData) // Empaquetamos los datos de React a JSON
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(`¡Éxito! Usuario ${data.nombre_usuario} creado correctamente.`);
        // Limpiamos el formulario
        setFormData({ nombre_usuario: '', nombre_completo: '', correo_electronico: '', contraseña: '' });
      } else {
        setError(data.error ? data.error[0] : 'Error al crear el usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  // 4. LA INTERFAZ (HTML + Tailwind CSS)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Registro INAAQC
        </h2>

        {/* Alertas de Éxito o Error */}
        {mensaje && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{mensaje}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <input 
              type="text" 
              name="nombre_usuario" 
              value={formData.nombre_usuario} 
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre_completo" 
              value={formData.nombre_completo} 
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo_electronico" 
              value={formData.correo_electronico} 
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="contraseña" 
              value={formData.contraseña} 
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Crear Cuenta
          </button>
        </form>
      </div>
    </div>
  )
}

export default App