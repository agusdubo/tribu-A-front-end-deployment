import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, Trash2, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import AuthService from '../services/AuthService';
import APIClient from '../services/APIClient';
import Header from '../components/Header';

const MyHours = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const employeeId = user?.employeeCode;

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ FUNCIÓN PARA OBTENER FECHAS DE LA SEMANA ACTUAL
    const getCurrentWeekDates = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ...
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar al lunes

        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { monday, sunday };
    };

    // ========================================
    // CARGAR HORAS DEL EMPLEADO (SOLO SEMANA ACTUAL)
    // ========================================
    useEffect(() => {
        if (!employeeId) {
            navigate('/');
            return;
        }
        loadMyHours();
    }, [employeeId]);

    const loadMyHours = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('📋 Cargando mis horas de la semana actual...');

            // ✅ OBTENER FECHAS DE LA SEMANA ACTUAL
            const { monday, sunday } = getCurrentWeekDates();
            const startDate = monday.toISOString().split('T')[0];
            const endDate = sunday.toISOString().split('T')[0];

            console.log('📅 Filtrando por semana actual:', { startDate, endDate });

            // ✅ LLAMAR A LA API CON FILTRO DE FECHAS
            const data = await APIClient.getTimeEntries(employeeId, startDate, endDate);

            // Ordenar por fecha descendente
            const sorted = data.sort((a, b) =>
                new Date(b.workDate) - new Date(a.workDate)
            );

            setEntries(sorted);
            console.log('✅ Horas cargadas (solo semana actual):', sorted.length);

            // 🔍 DEBUG: Ver qué datos vienen del backend
            if (sorted.length > 0) {
                console.log('🔍 Primera entrada:', sorted[0]);
                console.log('🔍 Campos disponibles:', Object.keys(sorted[0]));
                console.log('🔍 projectName:', sorted[0].projectName);
                console.log('🔍 taskName:', sorted[0].taskName);
            }
        } catch (err) {
            console.error('❌ Error al cargar horas:', err);
            setError('Error al cargar tus horas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // SELECCIÓN DE ENTRADAS
    // ========================================
    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const selectAllDrafts = () => {
        const draftIds = entries
            .filter(e => e.status === 'DRAFT')
            .map(e => e.id);
        setSelectedIds(draftIds);
    };

    // ========================================
    // ENVIAR A SUPERVISOR
    // ========================================
    const handleSubmit = async () => {
        if (selectedIds.length === 0) {
            alert('⚠️ Selecciona al menos una entrada para enviar');
            return;
        }

        if (!window.confirm(`¿Enviar ${selectedIds.length} entrada(s) al supervisor para aprobación?`)) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            console.log('📤 Enviando para aprobación:', selectedIds);

            await APIClient.submitTimeEntries(selectedIds);

            alert(`✅ Se enviaron ${selectedIds.length} entrada(s) para aprobación!`);

            // Limpiar selección y recargar
            setSelectedIds([]);
            await loadMyHours();

        } catch (err) {
            console.error('❌ Error al enviar:', err);
            setError('Error al enviar para aprobación: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========================================
    // ELIMINAR ENTRADA
    // ========================================
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta entrada?')) return;

        try {
            await APIClient.deleteTimeEntry(id);
            alert('✅ Entrada eliminada');
            await loadMyHours();
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    // ========================================
    // HELPERS
    // ========================================
    const getStatusInfo = (status) => {
        const statuses = {
            'DRAFT': { text: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: Clock },
            'SUBMITTED': { text: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Send },
            'APPROVED': { text: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'REJECTED': { text: 'Rechazado', color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };
        return statuses[status] || statuses['DRAFT'];
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateForDisplay = (date) => {
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // ✅ HELPERS PARA MOSTRAR NOMBRES
    const getProjectDisplay = (entry) => {
        if (entry.projectName) {
            return entry.projectName;
        }
        return entry.projectId.substring(0, 12) + '...';
    };

    const getTaskDisplay = (entry) => {
        if (entry.taskName && entry.taskName !== 'Sin tarea asignada') {
            return entry.taskName;
        }
        if (entry.taskId) {
            return entry.taskId.substring(0, 12) + '...';
        }
        return 'Sin tarea';
    };

    // Agrupar por estado
    const draftEntries = entries.filter(e => e.status === 'DRAFT');
    const submittedEntries = entries.filter(e => e.status === 'SUBMITTED');
    const approvedEntries = entries.filter(e => e.status === 'APPROVED');
    const rejectedEntries = entries.filter(e => e.status === 'REJECTED');

    // ✅ OBTENER FECHAS PARA MOSTRAR EN EL HEADER
    const { monday, sunday } = getCurrentWeekDates();

    // ========================================
    // RENDER: LOADING
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600 text-lg">Cargando tus horas...</p>
                    </div>
                </main>
            </div>
        );
    }

    // ========================================
    // RENDER: PRINCIPAL
    // ========================================
    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                title="Mis Horas - Semana Actual"
                subtitle={`Del ${formatDateForDisplay(monday)} al ${formatDateForDisplay(sunday)}`}
                showBack={true}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Info sobre semana actual */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Solo se muestran las horas de la semana actual.</strong> Las semanas anteriores están cerradas y no se pueden modificar.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Borradores" count={draftEntries.length} color="gray" />
                    <StatCard label="Enviadas" count={submittedEntries.length} color="blue" />
                    <StatCard label="Aprobadas" count={approvedEntries.length} color="green" />
                    <StatCard label="Rechazadas" count={rejectedEntries.length} color="red" />
                </div>

                {/* Acciones para Borradores */}
                {draftEntries.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={selectAllDrafts}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Seleccionar todos los borradores
                                </button>
                                {selectedIds.length > 0 && (
                                    <span className="text-sm text-gray-600">
                                        {selectedIds.length} seleccionada(s)
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedIds.length === 0 || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Enviar a Supervisor
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla de Entradas */}
                {entries.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                        Selec.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                        Proyecto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                        Tarea
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                                        Horas
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map(entry => {
                                    const statusInfo = getStatusInfo(entry.status);
                                    const StatusIcon = statusInfo.icon;
                                    const hours = (entry.workedMinutes / 60).toFixed(1);
                                    const canDelete = entry.status === 'DRAFT';
                                    const canSelect = entry.status === 'DRAFT';

                                    return (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {canSelect && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(entry.id)}
                                                        onChange={() => toggleSelection(entry.id)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatDate(entry.workDate)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600" title={entry.projectId}>
                                                {getProjectDisplay(entry)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600" title={entry.taskId}>
                                                {getTaskDisplay(entry)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                                                {hours} hs
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                    <StatusIcon size={14} />
                                                    {statusInfo.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600">No tienes horas registradas esta semana</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Ve a "Selección de Proyectos" para comenzar a cargar horas
                        </p>
                        <button
                            onClick={() => navigate('/desarrollador/seleccion-proyectos')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Ir a Proyectos
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

// ========================================
// COMPONENTE STATCARD
// ========================================
const StatCard = ({ label, count, color }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-800 border-gray-300',
        blue: 'bg-blue-100 text-blue-800 border-blue-300',
        green: 'bg-green-100 text-green-800 border-green-300',
        red: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${colors[color]}`}>
            <p className="text-xs font-semibold uppercase opacity-75">{label}</p>
            <p className="text-3xl font-bold mt-1">{count}</p>
        </div>
    );
};

export default MyHours;