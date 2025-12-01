import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Search, Clock, Loader } from 'lucide-react';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import APIClient from '../services/APIClient';

const ApproveHours = () => {
    const navigate = useNavigate();
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const loadApprovals = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('📋 Cargando registros pendientes...');

            const data = await APIClient.getPendingApproval();

            console.log('✅ Datos recibidos:', data);

            if (!data || data.length === 0) {
                console.log('ℹ️ No hay registros pendientes');
                setApprovals([]);
            } else {
                setApprovals(data);
            }

        } catch (err) {
            console.error('❌ Error al cargar pendientes:', err);
            setError(`Error al cargar pendientes: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, []);

    const handleAction = async (id, action) => {
        const actionText = action === 'approve' ? 'APROBAR' : 'RECHAZAR';

        if (!window.confirm(`¿Confirma ${actionText} el registro ${id}?`)) {
            return;
        }

        try {
            if (action === 'approve') {
                await APIClient.approveTimeEntry(id);
                alert('✅ Horas aprobadas correctamente.');
            } else {
                const reason = window.prompt('Ingrese el motivo del rechazo:');
                if (!reason || reason.trim() === '') {
                    alert('El rechazo requiere un motivo.');
                    return;
                }
                await APIClient.rejectTimeEntry(id);
                alert('❌ Horas rechazadas y empleado notificado.');
            }

            // ✅ Recargar la lista después de la acción
            loadApprovals();

        } catch (err) {
            console.error('❌ Error al realizar la acción:', err);
            alert(`Error al realizar la acción: ${err.message}`);
        }
    };

    // ✅ Renderizar tabla detallada de horas (ahora con datos reales)
    // ✅ REEMPLAZAR LA FUNCIÓN renderDetailedHours EN ApproveHours.js

    const renderDetailedHours = (entry) => {
        const daysOfWeek = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];

        // ✅ CALCULAR EL ÍNDICE CORRECTO DEL DÍA
        const workDate = new Date(entry.workDate + 'T00:00:00');
        const dayOfWeek = workDate.getDay(); // 0=Domingo, 1=Lunes, ..., 5=Viernes, 6=Sábado

        // Convertir a índice de array (0=Lunes, 1=Martes, ..., 4=Viernes)
        let dayIndex;
        if (dayOfWeek === 0) { // Domingo
            dayIndex = -1; // No debería pasar, pero por las dudas
        } else if (dayOfWeek === 6) { // Sábado
            dayIndex = -1; // No debería pasar
        } else {
            dayIndex = dayOfWeek - 1; // 1(Lun)→0, 2(Mar)→1, 3(Mié)→2, 4(Jue)→3, 5(Vie)→4
        }

        // ✅ CREAR ARRAY DE HORAS CON EL VALOR EN EL DÍA CORRECTO
        const hoursArray = [0, 0, 0, 0, 0]; // Inicializar todo en 0
        if (dayIndex >= 0 && dayIndex < 5) {
            hoursArray[dayIndex] = entry.totalHours || (entry.workedMinutes / 60);
        }

        const detailedTasks = [
            {
                project: entry.projectName || entry.projectId,
                task: entry.taskName || entry.taskId || 'Sin tarea',
                hours: hoursArray // ✅ Ahora con el día correcto
            }
        ];

        return (
            <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-blue-700">
                    Detalle de la Tarea en la Semana {entry.week}
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">
                                PROYECTO
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">
                                TAREA
                            </th>
                            {daysOfWeek.map(day => (
                                <th key={day} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {day}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {detailedTasks.map((task, index) => (
                            <tr key={index} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800">{task.project}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{task.task}</td>
                                {task.hours.map((h, i) => (
                                    <td key={i} className="px-3 py-4 text-center text-sm font-bold">
                                        {h > 0 ? h.toFixed(1) : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* ℹ️ Info adicional */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                        <strong>Fecha:</strong> {workDate.toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })} •
                        <strong className="ml-2">Empleado:</strong> {entry.employeeName} •
                        <strong className="ml-2">Descripción:</strong> {entry.description || 'Sin descripción'}
                    </p>
                </div>
            </div>
        );
    };
    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Aprobación de Horas"
                subtitle="Revisión de registros pendientes"
                showBack={true}
                backPath="/manager/home-carga-horas"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && <LoadingState message="Cargando registros pendientes..." />}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                {!loading && approvals.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Empleado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Proyecto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Tarea
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Horas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {approvals.map(entry => (
                                <tr key={entry.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {entry.employeeName || entry.employeeId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {entry.projectName || entry.projectId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {entry.taskName || entry.taskId || 'Sin tarea'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(entry.workDate + 'T00:00:00').toLocaleDateString('es-AR')}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                        {entry.totalHours?.toFixed(1) || (entry.workedMinutes / 60).toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleAction(entry.id, 'approve')}
                                                className="p-1.5 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors"
                                                title="Aprobar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(entry.id, 'reject')}
                                                className="p-1.5 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                title="Rechazar"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedEntry(
                                                    selectedEntry?.id === entry.id ? null : entry
                                                )}
                                                className="p-1.5 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                title="Ver Detalle"
                                            >
                                                <Search size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && selectedEntry && renderDetailedHours(selectedEntry)}

                {!loading && approvals.length === 0 && !error && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Clock className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium">No hay registros pendientes de aprobación.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Los registros aparecerán aquí cuando los empleados envíen sus horas para revisión.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ApproveHours;