import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import APIClient from '../services/APIClient';

// ✅ ID del rol de Manager (Horacio)
const ROL_ID_MANAGER = "6e6ecd47-fa18-490e-b25a-c9101a398b6d";

const WeeklyHoursResourceSelection = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResources = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await APIClient.getAllResources();

                // ✅ FILTRAR: Excluir empleados con rol de MANAGER
                const filteredResources = data.filter(resource =>
                    resource.rolId !== ROL_ID_MANAGER
                );

                console.log(`📊 Total empleados: ${data.length}`);
                console.log(`✅ Empleados (sin managers): ${filteredResources.length}`);

                setResources(filteredResources);
            } catch (err) {
                setError(`Error al cargar empleados: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadResources();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Reporte de Horas Semanales"
                subtitle="Seleccione un empleado"
                showBack={true}
                backPath="/manager/reportes"
            />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && <LoadingState message="Cargando lista de empleados..." />}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">{error}</div>}

                {!loading && resources.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {resources.map(resource => (
                                <li key={resource.id} className="hover:bg-gray-50 transition-colors">
                                    <button
                                        onClick={() => navigate(`/manager/reportes/reporte-recurso?id=${resource.id}&nombre=${resource.nombre}&apellido=${resource.apellido}`)}
                                        className="w-full text-left p-4 flex justify-between items-center text-gray-900 font-medium"
                                    >
                                        <div>
                                            <span className="text-base">{`${resource.nombre} ${resource.apellido}`}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                (Desarrollador)
                                            </span>
                                        </div>
                                        <ArrowLeft size={20} className="rotate-180 text-blue-500" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {!loading && resources.length === 0 && !error && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium">No hay empleados disponibles para reportes.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Los managers no aparecen en esta lista.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WeeklyHoursResourceSelection;