import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import AuthService from '../services/AuthService';

const Header = ({ title, subtitle, showBack = false, backPath, backLabel = "Volver" }) => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const handleBack = () => {
        if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    const handleLogout = () => {
        if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
            AuthService.logout();
            navigate('/');
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* IZQUIERDA: Botón volver + Título */}
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                title={backLabel}
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        )}
                        <div className={`flex flex-col ${showBack ? 'border-l border-gray-200 pl-4' : ''}`}>
                            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
                        </div>
                    </div>

                    {/* DERECHA: Info del usuario + Logout */}
                    <div className="flex items-center space-x-3">
                        <span className="hidden sm:block font-medium text-gray-500">
                            {user?.name || 'Usuario'}
                        </span>
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'U'}
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
    );
};

export default Header;