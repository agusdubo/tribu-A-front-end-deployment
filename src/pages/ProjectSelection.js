import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ArrowLeft, Clock } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import AuthService from '../services/AuthService';
import APIClient from '../services/APIClient';

const ProjectSelection = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const resourceId = user?.employeeCode;

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!resourceId) {
            setError('Falta información del empleado. Redirigiendo a login...');
            AuthService.logout();
            navigate('/');
            return;
        }

        const loadProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const loadedProjects = await APIClient.getProjectsByEmployeeId(resourceId);
                setProjects(loadedProjects);
            } catch (err) {
                setError(`Error al cargar proyectos: ${err.message}`);
                console.error('Error al cargar proyectos:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [resourceId, navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Mis Proyectos"
                subtitle="Seleccione un proyecto para cargar horas"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botón Ver Mis Horas */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => navigate('/desarrollador/mis-horas')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Clock size={20} />
                        Ver Mis Horas
                    </button>
                </div>

                {loading && <LoadingState message="Cargando tus proyectos..." />}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                        <button className="ml-4 font-bold" onClick={() => window.location.reload()}>Recargar</button>
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Folder className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium">No tienes proyectos asignados</p>
                        <p className="text-sm text-gray-500">Contacta a tu manager para que te asigne proyectos.</p>
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/desarrollador/carga-horas?projectId=${project.id}&projectName=${encodeURIComponent(project.nombre)}`)}
                                className="group cursor-pointer block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <Folder className="h-6 w-6 text-blue-600 group-hover:text-blue-800" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">{project.nombre}</h3>
                                        <p className="text-sm text-gray-500">ID: {project.id}</p>
                                    </div>
                                    <ArrowLeft className="h-5 w-5 ml-auto rotate-180 text-gray-400 group-hover:text-blue-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectSelection;