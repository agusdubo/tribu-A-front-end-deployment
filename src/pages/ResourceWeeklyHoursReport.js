import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, Filter } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import APIClient from '../services/APIClient';


const ResourceWeeklyHoursReport = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const employeeId = searchParams.get('id');
    const employeeName = `${searchParams.get('nombre')} ${searchParams.get('apellido')}`;

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const traducirEstado = (status) => {
        const estados = { 'DRAFT': 'Borrador', 'SUBMITTED': 'Enviado', 'APPROVED': 'Aprobado', 'REJECTED': 'Rechazado' };
        return estados[status] || status;
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const generarReporte = async () => {
        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
            alert('Seleccione un rango de fechas válido.');
            return;
        }

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const reporteData = await APIClient.getWeeklyHoursReport(employeeId, startDate, endDate);
            setReport(reporteData);
        } catch (err) {
            setError(`Error al generar reporte: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Generar reporte al cargar el componente con fechas por defecto
    useEffect(() => {
        if (employeeId) generarReporte();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]); // Se ejecuta solo al montar o si cambia el ID

    if (!employeeId) return <p className="text-red-500 p-4">Error: No se especificó un empleado.</p>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title={`Reporte Semanal de Horas: ${employeeName}`}
                subtitle="Filtro por período"
                showBack={true}
                backPath="/manager/reportes/horas-semanales"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="startDate">Fecha Inicio:</label>
                            <input type="date" id="startDate" className="w-full border border-gray-300 rounded-md p-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="endDate">Fecha Fin:</label>
                            <input type="date" id="endDate" className="w-full border border-gray-300 rounded-md p-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
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

                {report && (
                    <div className="report-container mt-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Período</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(report.startDate)} - {formatDate(report.endDate)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total de Horas</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{report.totalHours?.toFixed(2) || '0.00'} hs</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Semanas Incluidas</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{report.weeks?.length || 0}</p>
                            </div>
                        </div>

                        {/* Weekly Breakdown */}
                        {report.weeks && report.weeks.length > 0 ? (
                            report.weeks.map((week, index) => (
                                <div key={index} className="week-section mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-blue-600 text-white p-3 font-semibold flex justify-between items-center">
                                        <span>Semana {week.weekNumber} ({formatDate(week.weekStart)} - {formatDate(week.weekEnd)})</span>
                                        <span>Total: {week.weekTotalHours.toFixed(2)} hs</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Proyecto</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Horas</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Descripción</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Estado</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {week.days.map((entry, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatDate(entry.date)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{entry.projectName}</td>
                                                    <td className="px-6 py-4 text-sm text-right text-gray-600">{entry.hours.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{entry.description || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                entry.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                                    entry.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {traducirEstado(entry.status)}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                                <p className="text-lg font-medium text-gray-600">No se encontraron registros de horas para el período seleccionado.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

// Al final del archivo
export default ResourceWeeklyHoursReport;