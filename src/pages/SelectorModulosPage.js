import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const SelectorModulosPage = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header Superior */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-2">
              {/* Logo SVG simple */}
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"></path>
              </svg>
              <span className="text-xl font-bold tracking-tight text-gray-900">PSA Systems</span>
            </div>
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
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Seleccione un Módulo
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Bienvenido al Sistema de Gestión Integral
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
            
            {/* Tarjeta Finanzas */}
            <div 
              onClick={() => navigate('/finanzas/dashboard')}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
                  {/* Icono Dinero (SVG) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-bold text-gray-900">
                  Módulo de Finanzas
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Gestión de costos, ingresos y facturación.
                </p>
              </div>
            </div>

            {/* Tarjeta Carga de Horas */}
            <div 
              onClick={() => navigate('/manager/home-carga-horas')}
              className="group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-75 hover:opacity-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                  {/* Icono Reloj (SVG) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-bold text-gray-900">
                  Módulo de Carga de Horas
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Registro de horas y asignación de recursos.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default SelectorModulosPage;