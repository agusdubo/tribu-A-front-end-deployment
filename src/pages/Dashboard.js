import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt,       
  TrendingUp,    
  TrendingDown,  
  BarChart3,     
  Settings,
  ArrowLeft
} from 'lucide-react';
import AuthService from '../services/AuthService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-sans">
      
      {/* Header Superior */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Izquierda: Flecha + Logo */}
            <div className="flex items-center gap-4">
              {/* Botón Volver */}
              <button 
                onClick={() => navigate('/modulos')}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                title="Volver a Selección de Módulos"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 h-8">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"></path>
                </svg>
                <span className="text-xl font-bold tracking-tight text-gray-900">PSA Systems</span>
              </div>
            </div>

            {/* Derecha: Usuario */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block font-medium text-gray-500">{user?.name || 'Manager'}</span>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'M'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Menú Principal - Finanzas
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Seleccione una opción para comenzar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* 1. Botón: Configuración de Costos */}
            <div 
              onClick={() => navigate('/finanzas/costos')}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                  <Settings className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Configuración de Costos
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Administrar tarifas de mano de obra y vigencias
                </p>
              </div>
            </div>

            {/* 2. Botón: Ingresos */}
            <div 
              onClick={() => alert("Esta funcionalidad no se encuentra disponible")}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-75"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
                  <TrendingUp className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Ingresos
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Registrar ventas de licencias e implementaciones
                </p>
              </div>
            </div>

            {/* 3. Botón: Costos Operativos */}
            <div 
              onClick={() => alert("Esta funcionalidad no se encuentra disponible")}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-75"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors duration-300">
                  <TrendingDown className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Egresos / Costos Op.
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Cargar gastos de infraestructura o licencias
                </p>
              </div>
            </div>

            {/* 4. Botón: Reportes */}
            <div 
              onClick={() => navigate('/finanzas/reportes')}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                  <BarChart3 className="h-12 w-12 text-purple-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Reportes
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Ver desglose de costos
                </p>
              </div>
            </div>

            {/* 5. Botón: Facturación */}
            <div 
              onClick={() => alert("Esta funcionalidad no se encuentra disponible")}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-75"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                  <Receipt className="h-12 w-12 text-orange-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Facturación
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Gestión de hitos de facturación automática
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;