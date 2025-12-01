import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, BarChart3, ArrowLeft, LogOut } from 'lucide-react';
import AuthService from '../services/AuthService';

const TimeEntryDashboard = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const handleLogout = () => {
        if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
            AuthService.logout();
            navigate('/');
        }
    };

    const CardModule = ({ icon: Icon, title, description, bgColor, path, disabled }) => {
        const handleClick = () => {
            if (disabled) return;
            if (path) navigate(path);
        };

        return (
            <div
                onClick={handleClick}
                className={`group cursor-pointer block p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`flex items-center justify-center h-24 w-24 rounded-full ${bgColor} transition-colors duration-300`}>
                        <Icon className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="mt-2 text-base text-gray-500">{description}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-sans">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/modulos')}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                title="Volver a Módulos"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div className="flex flex-col border-l border-gray-200 pl-4 h-8">
                                <h1 className="text-xl font-bold text-gray-900">Carga de Horas - Manager</h1>
                                <span className="text-sm text-gray-500">Panel de Gestión</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="hidden sm:block font-medium text-gray-500">
                                {user?.name || 'Manager'}
                            </span>
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                            Menú Principal
                        </h1>
                        <p className="mt-4 text-lg text-gray-500">
                            Seleccione una opción para gestionar horas o generar reportes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-3xl mx-auto">
                        <CardModule
                            icon={Check}
                            title="Aprobar Carga de Horas"
                            description="Revisar y aprobar las horas cargadas por los recursos."
                            bgColor="bg-blue-600"
                            path="/manager/aprobar-horas"
                        />

                        <CardModule
                            icon={BarChart3}
                            title="Ver Reportes"
                            description="Acceder a reportes de horas y costos por proyecto."
                            bgColor="bg-indigo-600"
                            path="/manager/reportes"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TimeEntryDashboard;