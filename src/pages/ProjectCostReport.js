import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, Filter } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import APIClient from '../services/APIClient';

const ProjectCostReport = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');
    const projectName = searchParams.get('name');
    const initialYear = searchParams.get('year') || new Date().getFullYear();

    const [year, setYear] = useState(initialYear);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    // Generar opciones de años (últimos 5 años)
    const YEARS = [];
    for (let i = 0; i < 5; i++) {
        const y = currentYear - i;
        YEARS.push(y);
    }

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    const generarReporte = async () => {
        if (!year) {
            alert('Por favor seleccione un año.');
            return;
        }

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            console.log('📊 Generando reporte para proyecto:', projectId, 'año:', year);

            // CAMBIO IMPORTANTE: Usar el método correcto con los parámetros en el orden correcto
            const reporteData = await APIClient.getProjectResourcesReport(projectId, year);

            console.log('✅ Reporte recibido:', reporteData);

            // Validar estructura del reporte
            if (!reporteData) {
                throw new Error('El servidor no devolvió datos');
            }

            if (!reporteData.resources || Object.keys(reporteData.resources).length === 0) {
                console.warn('⚠️ No hay recursos en el reporte');
            }

            if (!reporteData.months || reporteData.months.length === 0) {
                console.warn('⚠️ No hay datos mensuales en el reporte');
            }

            setReport(reporteData);

        } catch (err) {
            console.error('❌ Error completo:', err);
            setError(`Error al generar reporte: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (projectId && year) generarReporte();
    }, [projectId, year]);

    if (!projectId) return <p className="text-red-500 p-4">Error: No se especificó un proyecto.</p>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Reporte de Costos por Proyecto"
                subtitle={`${projectName} (ID: ${projectId})`}
                showBack={true}
                backPath="/manager/reportes/costos-proyecto"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="yearSelect">Seleccionar Año:</label>
                            <select
                                id="yearSelect"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-md p-2 text-sm"
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={generarReporte}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Filter size={18} />} Generar Reporte
                        </button>
                    </div>
                </div>

                {loading && <LoadingState message="Generando reporte..." />}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mt-6">{error}</div>}

                {report && renderReport(report, monthNames)}
            </main>
        </div>
    );
};

function renderReport(report, monthNames) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const resourceEntries = Object.entries(report.resources || {});

    if (resourceEntries.length === 0 || !report.months || report.months.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-lg font-medium text-gray-600">No hay datos de costos para este proyecto y año.</p>
            </div>
        );
    }

    // Calcular matriz de costos: costByResourceAndMonth[resourceId][month] = costo
    const costByResourceAndMonth = {};
    resourceEntries.forEach(([resourceId]) => {
        costByResourceAndMonth[resourceId] = {};
        months.forEach(m => costByResourceAndMonth[resourceId][m] = 0);
    });

    // Rellenar con los datos del reporte
    (report.months || []).forEach(mData => {
        const month = mData.month; // 1-12
        (mData.costs || []).forEach(c => {
            if (costByResourceAndMonth[c.resourceId]) {
                costByResourceAndMonth[c.resourceId][month] += c.totalCost || 0;
            }
        });
    });

    // Calcular subtotales
    const subtotalPorRecurso = {};
    const subtotalPorMes = {};
    months.forEach(m => subtotalPorMes[m] = 0);
    let grandTotal = 0;

    resourceEntries.forEach(([resourceId]) => {
        let totalRecurso = 0;
        months.forEach(m => {
            const val = costByResourceAndMonth[resourceId][m] || 0;
            totalRecurso += val;
            subtotalPorMes[m] += val;
        });
        subtotalPorRecurso[resourceId] = totalRecurso;
        grandTotal += totalRecurso;
    });

    const recursosConCosto = resourceEntries.length;
    const mesesConDatos = (report.months || []).length;

    return (
        <div className="report-container">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Costo Total Proyecto</p>
                    <p className="text-xl font-bold text-red-600 mt-1">${grandTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Año</p>
                    <p className="text-xl font-bold text-blue-600 mt-1">{report.year}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Recursos</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{recursosConCosto}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Meses con datos</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{mesesConDatos}</p>
                </div>
            </div>

            {/* Tabla de costos mensuales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                            Recurso
                        </th>
                        {monthNames.map((month, idx) => (
                            <th key={idx} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {month}
                            </th>
                        ))}
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100">
                            Total Recurso
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {resourceEntries.map(([resourceId, info]) => {
                        const nombre = info.fullName ||
                            `${info.nombre || ''} ${info.apellido || ''}`.trim() ||
                            resourceId;

                        return (
                            <tr key={resourceId} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800 sticky left-0 bg-white z-10">
                                    {nombre}
                                </td>
                                {months.map(m => {
                                    const val = costByResourceAndMonth[resourceId][m] || 0;
                                    return (
                                        <td key={m} className="px-3 py-4 text-center text-sm text-gray-600">
                                            {val > 0 ? `$${val.toFixed(2)}` : '-'}
                                        </td>
                                    );
                                })}
                                <td className="px-6 py-4 text-center font-bold text-gray-900 bg-gray-50">
                                    ${subtotalPorRecurso[resourceId].toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}

                    {/* Fila de totales por mes */}
                    <tr className="bg-blue-100 font-bold border-t-4 border-blue-600">
                        <td className="px-6 py-3 text-left text-sm text-gray-900">
                            TOTAL MES
                        </td>
                        {months.map(m => (
                            <td key={m} className="px-3 py-3 text-center text-sm text-gray-900">
                                ${subtotalPorMes[m].toFixed(2)}
                            </td>
                        ))}
                        <td className="px-6 py-3 text-center text-lg text-blue-800 bg-blue-200">
                            ${grandTotal.toFixed(2)}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProjectCostReport;