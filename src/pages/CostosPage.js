import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Plus, Edit2, Loader, ArrowLeft, Calendar, Filter, Layers, Trash2 } from 'lucide-react'; 
import { ApiService } from '../services/api';
import AuthService from '../services/AuthService';

const CostosPage = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const [costos, setCostos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Catálogo completo de roles (ID, Nombre, Experiencia)
    const [allRolesData, setAllRolesData] = useState([]);

    // Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMassModalOpen, setIsMassModalOpen] = useState(false);

    // Filtros
    const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
    const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

    // Form individual
    const [formData, setFormData] = useState({
        rol: '',
        seniority: '',
        costo: '',
        moneda: 'USD',
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear()
    });

    // Form masivo
    const [massFormData, setMassFormData] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        porcentaje: ''
    });

    // Edición individual
    const [usarPorcentaje, setUsarPorcentaje] = useState(false);
    const [porcentaje, setPorcentaje] = useState('');
    const [costoBase, setCostoBase] = useState(0);
    const [editingId, setEditingId] = useState(null);

    const MESES = [
        { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
        { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
        { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
        { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
    ];

    // --- Lógica de carga de datos ---
    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Traemos Costos y Roles (objetos completos) en paralelo
            const [dataCostos, dataRolesCompletos] = await Promise.all([
                ApiService.obtenerCostosVigentes(),
                ApiService.obtenerTodosLosRoles() 
            ]);

            // Guardamos el catálogo completo para usarlo en el formulario
            setAllRolesData(dataRolesCompletos || []);

            // 2. Cruzamos la información para la tabla
            const datosProcesados = dataCostos.map(item => {
                const rolEncontrado = dataRolesCompletos.find(r => r.id === item.rolId);
                
                const rolDisplay = rolEncontrado ? rolEncontrado.nombre : 'Rol Desconocido';
                const seniorityDisplay = rolEncontrado ? rolEncontrado.experiencia : 'N/A';

                return { ...item, rolDisplay, seniorityDisplay };
            });
            
            setCostos(datosProcesados);
        } catch (error) {
            console.error("Error cargando costos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const costosFiltrados = costos.filter(c => {
        if (!c.fecha) return false;
        const partes = c.fecha.split('-'); // "YYYY-MM-DD"
        const anioCosto = parseInt(partes[0]);
        const mesCosto = parseInt(partes[1]);
        return anioCosto === parseInt(filtroAnio) && mesCosto === parseInt(filtroMes);
    });

    const calcularValorConPorcentaje = (valorBase, porc) => {
        if (!valorBase || isNaN(valorBase) || !porc || isNaN(porc)) return valorBase;
        const base = parseFloat(valorBase);
        const p = parseFloat(porc);
        const resultado = base + (base * (p / 100));
        
        // Retornamos string fijo, pero validamos negativo después
        return resultado.toFixed(2);
    };

    useEffect(() => {
        if (usarPorcentaje && editingId) {
            const nuevoValor = calcularValorConPorcentaje(costoBase, porcentaje);
            setFormData(prev => ({ ...prev, costo: nuevoValor }));
        }
    }, [porcentaje, usarPorcentaje, costoBase, editingId]);

    // Obtener lista de Nombres de Roles Únicos para el select
    const uniqueRoles = [...new Set(allRolesData.map(r => r.nombre))].sort();

    // Obtener lista de Experiencias filtradas por el Rol seleccionado
    const filteredExperiencias = allRolesData
        .filter(r => r.nombre === formData.rol)
        .map(r => r.experiencia)
        .sort();

    const handleEdit = (item) => {
        setEditingId(item.id);

        let mesEdit = new Date().getMonth() + 1;
        let anioEdit = new Date().getFullYear();

        if (item.fecha) {
            const partes = item.fecha.split('-');
            if (partes.length >= 2) {
                anioEdit = parseInt(partes[0]);
                mesEdit = parseInt(partes[1]);
            }
        }

        setCostoBase(item.costo);
        setUsarPorcentaje(false);
        setPorcentaje('');

        setFormData({
            rol: item.rolDisplay,
            seniority: item.seniorityDisplay !== 'N/A' ? item.seniorityDisplay : '',
            costo: item.costo,
            moneda: 'USD',
            mes: mesEdit,
            anio: anioEdit
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este costo? Esta acción no se puede deshacer.")) {
            try {
                await ApiService.eliminarCosto(id);
                alert("Costo eliminado correctamente");
                loadData();
            } catch (error) {
                console.error(error);
                alert("Error al eliminar el costo");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // --- VALIDACIÓN DE COSTO NEGATIVO ---
        if (parseFloat(formData.costo) < 0) {
            alert("El costo no puede ser negativo. Por favor ingrese un valor válido.");
            return;
        }
        // ------------------------------------

        // --- VALIDACIÓN DE DUPLICADOS ---
        const existeDuplicado = costos.some(c => {
            // Si estamos editando, no comparamos contra el mismo registro
            if (editingId && c.id === editingId) return false;

            // Obtenemos mes y año del costo existente
            if (!c.fecha) return false;
            const [anioStr, mesStr] = c.fecha.split('-');
            const anioCosto = parseInt(anioStr);
            const mesCosto = parseInt(mesStr);

            // Comparamos: Rol (nombre), Seniority, Mes y Año
            return (
                c.rolDisplay === formData.rol &&
                c.seniorityDisplay === formData.seniority &&
                anioCosto === parseInt(formData.anio) &&
                mesCosto === parseInt(formData.mes)
            );
        });

        if (existeDuplicado) {
            alert(`Ya existe un costo registrado para el rol "${formData.rol}" (${formData.seniority}) en este período.`);
            return; // Detenemos la ejecución aquí
        }
        // ---------------------------------

        const datosCosto = { 
            rolId: formData.rol, 
            nombre: formData.rol, 
            experiencia: formData.seniority,
            costo: formData.costo.toString(),
            mes: parseInt(formData.mes),
            anio: parseInt(formData.anio)
        };

        try {
            if (editingId) {
                await ApiService.actualizarCosto(editingId, datosCosto);
                alert("Costo mensual actualizado correctamente");
            } else {
                await ApiService.crearCosto(datosCosto);
                alert("Nuevo costo mensual registrado");
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setUsarPorcentaje(false);
            setPorcentaje('');
            
            setFiltroMes(parseInt(formData.mes));
            setFiltroAnio(parseInt(formData.anio));

            loadData();
        } catch (e2) { 
            console.error(e2);
            alert("Error al guardar la operación. Verifique los datos"); 
        }
    };

    const handleNuevoCosto = () => {
        setFormData({
            rol: '',
            seniority: '',
            costo: '',
            mes: filtroMes,
            anio: filtroAnio
        });
        setEditingId(null);
        setUsarPorcentaje(false);
        setIsModalOpen(true);
    };

    const handleMassUpdate = async (e) => {
        e.preventDefault();

        const costosAfectados = costos.filter(c => {
            if (!c.fecha) return false;
            const partes = c.fecha.split('-');
            const anioCosto = parseInt(partes[0]);
            const mesCosto = parseInt(partes[1]);
            return anioCosto === parseInt(massFormData.anio) && mesCosto === parseInt(massFormData.mes);
        });

        if (costosAfectados.length === 0) {
            alert("No hay costos registrados para el mes seleccionado");
            return;
        }

        // --- VALIDACIÓN PREVIA: ¿Algún costo queda negativo? ---
        const algunNegativo = costosAfectados.some(c => {
            const nuevoValor = calcularValorConPorcentaje(c.costo, massFormData.porcentaje);
            return parseFloat(nuevoValor) < 0;
        });

        if (algunNegativo) {
            alert("La operación no se puede realizar porque resultaría en costos negativos para uno o más roles.");
            return;
        }
        // -------------------------------------------------------

        if (!window.confirm(`Se actualizarán ${costosAfectados.length} costos con un ${massFormData.porcentaje}%. ¿Continuar?`)) {
            return;
        }

        setLoading(true);
        try {
            const promesas = costosAfectados.map(costo => {
                const nuevoValor = calcularValorConPorcentaje(costo.costo, massFormData.porcentaje);

                const datosCosto = {
                    costo: nuevoValor.toString(),
                    mes: parseInt(massFormData.mes),
                    anio: parseInt(massFormData.anio)
                };

                return ApiService.actualizarCosto(costo.id, datosCosto);
            });

            await Promise.all(promesas);

            alert("Actualización masiva completada con éxito");
            setIsMassModalOpen(false);
            setFiltroMes(parseInt(massFormData.mes));
            setFiltroAnio(parseInt(massFormData.anio));
            loadData();

        } catch (error) {
            console.error("Error en actualización masiva:", error);
            alert("Ocurrió un error durante la actualización masiva. Algunos costos pueden no haberse actualizado");
            loadData();
        } finally {
            setLoading(false);
        }
    };

    const formatVigencia = (fechaString) => {
        if (!fechaString) return '-';
        const partes = fechaString.split('-');
        if (partes.length < 2) return fechaString;
        const anio = partes[0];
        const mesIndex = parseInt(partes[1]) - 1;
        const nombreMes = MESES[mesIndex] ? MESES[mesIndex].nombre : partes[1];
        return `${nombreMes} ${anio}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/finanzas/dashboard')}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                title="Volver al Menú"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 h-8">
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    Gestión de Costos
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="hidden sm:block font-medium text-gray-500">
                                {user?.name || 'Manager'}
                            </span>
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* BARRA DE FILTROS Y ACCIONES */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <span>Periodo:</span>
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                value={filtroMes}
                                onChange={e => setFiltroMes(parseInt(e.target.value))}
                            >
                                {MESES.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                            
                            <input
                                type="number"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-24 appearance-none"
                                value={filtroAnio}
                                onChange={e => setFiltroAnio(parseInt(e.target.value))}
                                min="2020"
                                max="2030"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setMassFormData({
                                    mes: filtroMes,
                                    anio: filtroAnio,
                                    porcentaje: ''
                                });
                                setIsMassModalOpen(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition justify-center text-sm"
                        >
                            <Layers size={18} /> Ajuste Masivo
                        </button>

                        <button
                            onClick={handleNuevoCosto}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition justify-center text-sm"
                        >
                            <Plus size={18} /> Nuevo Costo
                        </button>
                    </div>
                </div>

                {/* TABLA */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nombre del Rol</th>
                                <th className="px-6 py-4 font-semibold">Experiencia</th>
                                <th className="px-6 py-4 font-semibold">Costo por Hora</th>
                                <th className="px-6 py-4 font-semibold min-w-[150px]">Mes de Vigencia</th>
                                <th className="px-6 py-4 font-semibold text-right min-w-[120px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <Loader className="animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : (
                                costosFiltrados.length > 0 ? (
                                    costosFiltrados.map((c, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-800">{c.rolDisplay}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                        c.seniorityDisplay === 'Senior'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : c.seniorityDisplay === 'Semi-Senior'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    {c.seniorityDisplay}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-700 font-bold">
                                                USD {c.costo}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatVigencia(c.fecha)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(c)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 ml-2"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No hay costos cargados para <b>{MESES[filtroMes - 1].nombre} {filtroAnio}</b>.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* MODAL INDIVIDUAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">
                            {editingId ? 'Editar Costo Mensual' : 'Registrar Costo Mensual'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1 font-bold uppercase">
                                        Mes
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                        value={formData.mes}
                                        onChange={e => setFormData({ ...formData, mes: e.target.value })}
                                    >
                                        {MESES.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1 font-bold uppercase">
                                        Año
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm appearance-none" 
                                        min="2020"
                                        max="2030"
                                        value={formData.anio}
                                        onChange={e => setFormData({ ...formData, anio: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* ROL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    className={`w-full border rounded-lg p-2 ${
                                        editingId
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-300'
                                    }`}
                                    required
                                    value={formData.rol}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            rol: e.target.value,
                                            seniority: ''
                                        })
                                    }
                                    disabled={!!editingId}
                                >
                                    <option value="">Seleccionar...</option>
                                    {uniqueRoles.map(nombre => (
                                        <option key={nombre} value={nombre}>
                                            {nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* SENIORITY */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experiencia</label>
                                    <select
                                        className={`w-full border rounded-lg p-2 ${
                                            (!formData.rol || editingId)
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300'
                                        }`}
                                        value={formData.seniority}
                                        onChange={e => setFormData({ ...formData, seniority: e.target.value })}
                                        disabled={!formData.rol || !!editingId}
                                    >
                                        <option value="">
                                            {formData.rol ? "Seleccionar Nivel..." : "Seleccione Rol primero"}
                                        </option>
                                        {filteredExperiencias.map(exp => (
                                            <option key={exp} value={exp}>
                                                {exp}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* COSTO */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo (USD)</label>
                                    <input
                                        type="number"
                                        className={`w-full border rounded-lg p-2 appearance-none ${
                                            usarPorcentaje ? 'bg-gray-100' : 'border-gray-300'
                                        }`}
                                        required
                                        value={formData.costo}
                                        readOnly={usarPorcentaje}
                                        min="0" // Validación HTML básica
                                        onChange={e => setFormData({ ...formData, costo: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* AJUSTE POR PORCENTAJE (EDICIÓN) */}
                            {editingId && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="usarPorcentaje"
                                            checked={usarPorcentaje}
                                            onChange={e => {
                                                setUsarPorcentaje(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormData(prev => ({ ...prev, costo: costoBase }));
                                                    setPorcentaje('');
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label htmlFor="usarPorcentaje" className="text-sm font-medium text-gray-700">
                                            Ajustar por porcentaje
                                        </label>
                                    </div>
                                    {usarPorcentaje && (
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-1/2">
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 rounded-lg p-2 pr-8 appearance-none"
                                                    value={porcentaje}
                                                    onChange={e => setPorcentaje(e.target.value)}
                                                />
                                                <span className="absolute right-3 top-2 text-gray-500">%</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Base: <strong>${costoBase}</strong> → Nuevo:{' '}
                                                <strong>${formData.costo}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingId ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL MASIVO */}
            {isMassModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in border-t-4 border-purple-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <Layers className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Ajuste Masivo de Costos</h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Esta acción actualizará <strong>todos</strong> los costos registrados para el mes seleccionado aplicando el porcentaje indicado.
                        </p>

                        <form onSubmit={handleMassUpdate} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1 font-bold uppercase">
                                        Mes
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                        value={massFormData.mes}
                                        onChange={e => setMassFormData({ ...massFormData, mes: e.target.value })}
                                    >
                                        {MESES.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1 font-bold uppercase">
                                        Año
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm appearance-none"
                                        min="2020"
                                        max="2030"
                                        value={massFormData.anio}
                                        onChange={e => setMassFormData({ ...massFormData, anio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porcentaje de Ajuste
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-lg appearance-none"
                                        required
                                        placeholder="Ej: 20 o -5"
                                        value={massFormData.porcentaje}
                                        onChange={e => setMassFormData({ ...massFormData, porcentaje: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-500 font-bold">%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    * Use valores positivos para aumentos (ej: 20) y negativos para descuentos (ej: -10).
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsMassModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm"
                                >
                                    Aplicar Ajuste
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostosPage;