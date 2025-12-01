import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Loader, Folder, Send, Save, AlertCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import AuthService from '../services/AuthService';
import APIClient from '../services/APIClient';
import { dateUtils } from '../utils/dateUtils';

const HourEntry = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('projectId');
    const projectName = searchParams.get('projectName') || 'Proyecto';

    const user = AuthService.getCurrentUser();
    const resourceId = user?.employeeCode;

    const [tasks, setTasks] = useState([]);
    const [hoursData, setHoursData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [savedEntryIds, setSavedEntryIds] = useState([]);

    const days = useMemo(() => ['mon', 'tue', 'wed', 'thu', 'fri'], []);

    // ✅ SIEMPRE LA SEMANA ACTUAL - NO PUEDE CAMBIAR
    const currentWeek = dateUtils.getCurrentWeekString();
    const [weekValue, setWeekValue] = useState(currentWeek);

    // ✅ VALIDAR SI LA SEMANA ESTÁ CERRADA
    const isWeekClosed = (weekString) => {
        return weekString !== currentWeek;
    };

    // ========================================
    // VALIDACIÓN INICIAL
    // ========================================
    useEffect(() => {
        if (!resourceId || !projectId) {
            alert('Faltan datos necesarios. Redirigiendo a selección de proyectos.');
            navigate('/desarrollador/seleccion-proyectos');
            return;
        }

        const loadTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('📋 Cargando tareas del proyecto:', projectId);
                const loadedTasks = await APIClient.getTasksByProject(projectId);

                if (!loadedTasks || loadedTasks.length === 0) {
                    setError('No hay tareas disponibles en este proyecto');
                    setTasks([]);
                    return;
                }

                setTasks(loadedTasks);

                // Inicializar estructura de datos de horas
                const initialHours = {};
                loadedTasks.forEach(task => {
                    initialHours[task.id] = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
                });
                setHoursData(initialHours);

                console.log('✅ Tareas cargadas:', loadedTasks.length);
            } catch (err) {
                console.error('❌ Error al cargar tareas:', err);
                setError('Error al cargar tareas: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [projectId, resourceId, navigate]);

    // ========================================
    // MANEJAR CAMBIO DE HORAS
    // ========================================
    const handleHourInput = (taskId, day, value) => {
        let hours = parseFloat(value) || 0;
        hours = Math.max(0, Math.min(24, hours));

        setHoursData(prev => ({
            ...prev,
            [taskId]: { ...prev[taskId], [day]: hours }
        }));
    };

    // ========================================
    // CALCULAR TOTALES
    // ========================================
    const totals = useMemo(() => {
        let grandTotal = 0;
        let dayTotals = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
        let taskTotals = {};

        tasks.forEach(task => {
            let taskTotal = 0;
            days.forEach(day => {
                const value = hoursData[task.id]?.[day] || 0;
                taskTotal += value;
                dayTotals[day] += value;
            });
            taskTotals[task.id] = taskTotal;
            grandTotal += taskTotal;
        });

        return { dayTotals, grandTotal, taskTotals };
    }, [hoursData, tasks, days]);

    // ========================================
    // RESETEAR TABLA
    // ========================================
    const resetTable = () => {
        const initialHours = {};
        tasks.forEach(task => {
            initialHours[task.id] = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
        });
        setHoursData(initialHours);
        setSavedEntryIds([]);
    };

    // ========================================
    // 💾 GUARDAR HORAS (Estado: DRAFT)
    // ========================================
    const saveHours = async () => {
        if (isWeekClosed(weekValue)) {
            alert('⛔ No puedes guardar horas en semanas cerradas. Solo se permite la semana actual.');
            return;
        }

        if (totals.grandTotal === 0) {
            alert('⚠️ No hay horas para guardar');
            return;
        }

        if (!window.confirm(`¿Confirma guardar ${totals.grandTotal.toFixed(1)} horas como BORRADOR para la semana actual?`)) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const monday = dateUtils.getMondayFromWeekInput(weekValue);
            const entriesToSave = [];
            const dayOffsets = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4 };

            tasks.forEach(task => {
                days.forEach(day => {
                    const hours = hoursData[task.id]?.[day] || 0;
                    if (hours > 0) {
                        const workDate = new Date(monday);
                        workDate.setDate(workDate.getDate() + dayOffsets[day]);

                        entriesToSave.push({
                            employeeId: resourceId,
                            projectId: projectId,
                            taskId: task.id,
                            workDate: workDate.toISOString().split('T')[0],
                            workedMinutes: Math.round(hours * 60),
                            description: `${task.nombre} - ${dateUtils.formatDate(workDate)}`
                        });
                    }
                });
            });

            console.log('💾 Guardando', entriesToSave.length, 'entradas como DRAFT');

            const newEntryIds = [];
            for (const entry of entriesToSave) {
                const result = await APIClient.createTimeEntry(entry);
                newEntryIds.push(result.id);
            }

            setSavedEntryIds(newEntryIds);

            // ✅ LIMPIAR LA TABLA DESPUÉS DE GUARDAR EXITOSAMENTE
            resetTable();

            alert(`✅ Se guardaron ${entriesToSave.length} registros como BORRADOR!\n\n📝 Ahora puedes enviarlos a aprobación usando el botón "Enviar a Supervisor".`);

        } catch (err) {
            console.error('❌ Error al guardar:', err);
            setError('❌ Error al guardar las horas: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ========================================
    // 📤 ENVIAR A SUPERVISOR (Estado: DRAFT → SUBMITTED)
    // ========================================
    const submitToSupervisor = async () => {
        if (savedEntryIds.length === 0) {
            alert('⚠️ Primero debes guardar las horas antes de enviarlas a aprobación');
            return;
        }

        if (isWeekClosed(weekValue)) {
            alert('⛔ No puedes enviar horas de semanas cerradas.');
            return;
        }

        if (!window.confirm(`¿Enviar ${savedEntryIds.length} registro(s) al supervisor para aprobación?\n\nUna vez enviadas, no podrás modificarlas.`)) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            console.log('📤 Enviando para aprobación:', savedEntryIds);

            await APIClient.submitTimeEntries(savedEntryIds);

            alert(`✅ ¡Horas enviadas exitosamente!\n\nSe enviaron ${savedEntryIds.length} registro(s) para aprobación del supervisor.`);

            resetTable();
            navigate('/desarrollador/mis-horas');

        } catch (err) {
            console.error('❌ Error al enviar:', err);
            setError('Error al enviar para aprobación: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========================================
    // RENDER: LOADING
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                <Header
                    title={`Proyecto: ${projectName}`}
                    subtitle="Carga de Horas Semanal"
                    showBack={true}
                    backPath="/desarrollador/seleccion-proyectos"
                />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600 text-lg">Cargando tareas del proyecto...</p>
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
                title={`Proyecto: ${projectName}`}
                subtitle="Carga de Horas Semanal"
                showBack={true}
                backPath="/desarrollador/seleccion-proyectos"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* SELECTOR DE SEMANA - BLOQUEADO A SEMANA ACTUAL */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Semana Actual:
                    </h2>
                    <div className="flex flex-col items-end gap-1">
                        <input
                            type="week"
                            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block p-2.5 w-48 cursor-not-allowed"
                            value={weekValue}
                            min={currentWeek}
                            max={currentWeek}
                            disabled={true}
                            readOnly
                        />
                        <span className="text-xs text-gray-500">
                            Solo se permiten horas de la semana actual
                        </span>
                    </div>
                </div>

                {/* ⚠️ ADVERTENCIA SI LA SEMANA ESTÁ CERRADA */}
                {isWeekClosed(weekValue) && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    <strong>⛔ Semana cerrada</strong> - Solo puedes cargar horas en la semana actual (Semana {currentWeek.split('-W')[1]}).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 📝 INDICADOR DE ESTADO */}
                {savedEntryIds.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Save className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Horas guardadas como borrador</strong> - Tienes {savedEntryIds.length} registro(s) pendientes de enviar al supervisor.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* TABLA DE HORAS */}
                {tasks.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">
                                        TAREA
                                    </th>
                                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'].map((day, index) => (
                                        <th key={index} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[80px]">
                                            {day}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100 min-w-[80px]">
                                        TOTAL
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.map(task => (
                                    <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {task.nombre}
                                        </td>
                                        {days.map(day => (
                                            <td key={day} className="px-3 py-2 text-center">
                                                <input
                                                    type="number"
                                                    className="w-full text-center border border-gray-300 rounded-md p-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    max="24"
                                                    step="0.5"
                                                    value={hoursData[task.id]?.[day] || ''}
                                                    onChange={(e) => handleHourInput(task.id, day, e.target.value)}
                                                    placeholder="0"
                                                    disabled={isWeekClosed(weekValue)}
                                                />
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-center font-bold text-gray-900 bg-gray-50">
                                            {totals.taskTotals[task.id]?.toFixed(1) || '0.0'}
                                        </td>
                                    </tr>
                                ))}

                                {/* FILA DE TOTALES */}
                                <tr className="bg-blue-100 font-bold border-t-4 border-blue-600">
                                    <td className="px-6 py-3 text-left text-sm text-gray-900">
                                        TOTAL POR DÍA
                                    </td>
                                    {days.map(day => (
                                        <td key={day} className="px-3 py-3 text-center text-sm text-gray-900">
                                            {totals.dayTotals[day].toFixed(1)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-3 text-center text-lg text-blue-800 bg-blue-200">
                                        {totals.grandTotal.toFixed(1)}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 bg-gray-50 border-t mt-6">
                            {/* IZQUIERDA: Navegación */}
                            <div className="flex gap-3">
                                {/* 📊 BOTÓN: VER MIS HORAS */}
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                    onClick={() => {
                                        localStorage.setItem('lastProject', JSON.stringify({
                                            projectId: projectId,
                                            projectName: projectName
                                        }));
                                        navigate('/desarrollador/mis-horas');
                                    }}
                                >
                                    <Clock size={18} /> Ver Mis Horas
                                </button>
                            </div>

                            {/* DERECHA: Acciones */}
                            <div className="flex gap-3">
                                {/* 💾 GUARDAR COMO BORRADOR */}
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={saveHours}
                                    disabled={isSaving || totals.grandTotal === 0 || isWeekClosed(weekValue)}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {isWeekClosed(weekValue) ? '⛔ Semana Cerrada' : 'Guardar como Borrador'}
                                        </>
                                    )}
                                </button>

                                {/* 📤 ENVIAR A SUPERVISOR */}
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={submitToSupervisor}
                                    disabled={isSubmitting || savedEntryIds.length === 0 || isWeekClosed(weekValue)}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            {isWeekClosed(weekValue) ? '⛔ Semana Cerrada' : 'Enviar a Supervisor'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600">No hay tareas disponibles en este proyecto</p>
                        <button
                            onClick={() => navigate('/desarrollador/seleccion-proyectos')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Volver a Proyectos
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HourEntry;