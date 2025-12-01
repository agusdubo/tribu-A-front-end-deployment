import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import APIClient from '../services/APIClient';

const ProjectCostSelection = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const today = new Date();

    // ✅ CAMBIO: Ahora son AÑOS en lugar de MESES
    const YEARS = useMemo(() => {
        const currentYear = today.getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            years.push({ value: year, text: year.toString() });
        }
        return years;
    }, [today]);

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await APIClient.getAllProjects();
                setProjects(data);
            } catch (err) {
                setError(`Error al cargar proyectos: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadProjects();
    }, []);

    const handleReportSubmit = (e, projectId, projectName) => {
        e.preventDefault();
        const year = e.target.year.value;
        navigate(`/manager/reportes/reporte-costos?id=${projectId}&name=${encodeURIComponent(projectName)}&year=${year}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Reporte de Costos por Proyecto"
                subtitle="Seleccione un proyecto y año"
                showBack={true}
                backPath="/manager/reportes"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && <LoadingState message="Cargando lista de proyectos..." />}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">{error}</div>}

                {!loading && projects.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[300px]">Seleccionar Año y Generar</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map(proyecto => (
                                <tr key={proyecto.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{proyecto.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{proyecto.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <form className="flex gap-2 items-center" onSubmit={(e) => handleReportSubmit(e, proyecto.id, proyecto.nombre)}>
                                            <select name="year" required className="bg-gray-50 border border-gray-300 rounded-md p-2 text-sm">
                                                {YEARS.map(y => (
                                                    <option key={y.value} value={y.value}>{y.text}</option>
                                                ))}
                                            </select>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                Ver Reporte
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && projects.length === 0 && !error && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Folder className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium">No hay proyectos disponibles.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectCostSelection;