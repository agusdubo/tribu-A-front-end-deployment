import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';
import AuthService from '../services/AuthService';

const ReportesPage = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [anio, setAnio] = useState(2025); 

    const cargarDatos = async (anio) => {
        setLoading(true);
        try {
            // Llamada al endpoint que usa la Calculadora
            const dataReporte = await ApiService.obtenerReporteMensual(anio);
            
            const proyectosProcesados = dataReporte.map(item => {
                // Convertimos la lista de objetos a un array simple de 12 posiciones
                const arrayCostosMensuales = item.costoMes.map(cm => cm.costo);

                return {
                    id: item.proyecto.id,
                    nombre: item.proyecto.nombre,
                    costosMensuales: arrayCostosMensuales,
                    costoTotal: item.costoTotal
                };
            });
            
            setProyectos(proyectosProcesados);
        } catch (error) {
            console.error("Error cargando reporte", error);
            alert("No se pudo establecer conexión con el servidor de reportes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos(anio);
    }, [anio]);

    const proyectosFiltrados = proyectos.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/finanzas/dashboard')} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div className="border-l border-gray-200 pl-4 h-8 flex items-center">
                                <span className="text-xl font-bold tracking-tight text-gray-900">Reporte de Costos por Proyecto</span>
                            </div>
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

            {/* CONTENIDO */}
            <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* BARRA DE HERRAMIENTAS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Buscar por proyecto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <select 
                                value={anio} 
                                onChange={(e) => setAnio(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 p-0 cursor-pointer"
                            >
                                <option value="2025">Año 2025</option>
                                <option value="2024">Año 2024</option>
                            </select>
                        </div>
                        
                        {/* Botón Recalcular */}
                        <button 
                            onClick={() => cargarDatos(anio)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                            title="Recalcular costos en tiempo real"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar Datos
                        </button>
                    </div>
                </div>

                {/* TABLA DE DATOS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 shadow-sm w-64">
                                                Proyecto
                                            </th>
                                            {meses.map((mes) => (
                                                <th key={mes} scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                                    {mes}
                                                </th>
                                            ))}
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100 border-l border-gray-200">
                                                TOTAL
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="14" className="px-6 py-20 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-2"/>
                                                        <p className="font-medium">Procesando imputaciones y generando reporte financiero...</p>
                                                        <p className="text-xs mt-1 text-gray-400">Sincronizando datos de proyectos</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            proyectosFiltrados.length > 0 ? (
                                                proyectosFiltrados.map((proyecto) => (
                                                    <tr key={proyecto.id} className="hover:bg-blue-50 transition-colors group">
                                                        {/* Columna Proyecto */}
                                                        <td className="sticky left-0 z-10 bg-white px-6 py-4 border-r border-gray-200 group-hover:bg-blue-50">
                                                            <span className="text-sm font-bold text-gray-900 block truncate" title={proyecto.nombre}>
                                                                {proyecto.nombre}
                                                            </span>
                                                        </td>
                                                        
                                                        {proyecto.costosMensuales.map((costo, idx) => (
                                                            <td key={idx} className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                                                                {costo > 0 ? `$${costo.toLocaleString()}` : '-'}
                                                            </td>
                                                        ))}

                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 bg-gray-50 border-l border-gray-200 group-hover:bg-blue-100">
                                                            ${proyecto.costoTotal.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="14" className="px-6 py-10 text-center text-gray-500">
                                                        No se encontraron proyectos que coincidan con "{busqueda}"
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportesPage;