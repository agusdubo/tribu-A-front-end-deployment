import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

// ID de Roles
// ID '1f14...': Aparece en Martin, Lucia, Mariana -> Asumimos DEVELOPER
const ROL_ID_DEVELOPER = "1f14a491-e26d-4092-86ea-d76f20c165d1";
// ID '6e6e...': Aparece solo en Horacio -> Asumimos MANAGER
const ROL_ID_MANAGER = "6e6ecd47-fa18-490e-b25a-c9101a398b6d";


const LoginPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeCode, setEmployeeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState('');


  // ========================
  // LOGICA DINAMICA DE ROLES
  // ========================
  const determineRole = (rolId) => {
    if (!rolId) return 'DEVELOPER';

    if (rolId === ROL_ID_MANAGER) {
      return 'MANAGER';
    }

    return 'DEVELOPER'
  };

  // Helper para mostrar un nombre legible en el select
  const getRoleLabel = (rolId) => {
    if (rolId === ROL_ID_MANAGER) return 'Manager';
    if (rolId === ROL_ID_DEVELOPER) return 'Desarrollador';
    return 'Desconocido';
  }

  // Carga inicial de los empleados
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);

        if (!response.ok) {
          throw new Error('No se pudo conectar con el sistema de RRHH')
        }

        const data = await response.json();
        console.log('Empleados cargados:', data);
        setEmployees(data);
        setLoadingEmployees(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Error de conexión con el servidor');
        setLoadingEmployees(false);
      }
    };

    // Limpiamos sesión vieja al entrar al login
    sessionStorage.clear();
    loadEmployees();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!employeeCode) {
      setError('Por favor seleccione un usuario');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Encontramos el empleado seleccionado
      const employee = employees.find(emp => emp.id === employeeCode);
      if (!employee) throw new Error('Empleado no encontrado');

      // 2. Determinamos su rol real
      const realRole = determineRole(employee.rolId);

      console.log(`Login: ${employee.nombre} ${employee.apellido}`);
      console.log(`Rol ID: ${employee.rolId} -> Rol Sistema: ${realRole}`);

      // 3. Guardamos la sesión compatible con ambos squads
      const userData = {
        id: employee.id,
        employeeCode: employee.id,
        name: `${employee.nombre} ${employee.apellido}`,
        role: realRole,
        originalRole: employee.rol?.nombre
      };

      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('isAuthenticated', 'true');

      // 4. Redirección inteligente
      // Si es Manager, va al selector general
      // Si es Dev, va directo a carga de horas
      if (realRole === 'MANAGER') {
        navigate('/modulos');
      } else {
        navigate('/desarrollador/seleccion-proyectos');
      }

    } catch (error) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 text-gray-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">PSA</h1>
          <p className="text-gray-500 mt-1">Sistema de Gestión Integrado</p>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900">Bienvenido</h2>
        
        {error && (
           <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
             {error}
           </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Identifíquese</label>
            <div className="mt-1">
                {loadingEmployees ? (
                    <div className="flex justify-center py-3 text-gray-500 text-sm">
                        <Loader className="w-5 h-5 animate-spin mr-2"/> Conectando...
                    </div>
                ) : (
                    <select 
                        className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Seleccionar usuario...</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.nombre} {emp.apellido} ({getRoleLabel(emp.rolId)})
                            </option>
                        ))}
                    </select>
                )}
            </div>
          </div>
          
          <button 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
            type="submit"
            disabled={loading || loadingEmployees || !employeeCode}
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          © 2025 PSA Systems
        </p>
      </div>
    </div>
  );
};

export default LoginPage;