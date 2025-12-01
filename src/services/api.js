const BASE_URL = "https://tpg-squad-01-2025-2c.onrender.com/api"; 

export const ApiService = {

    // 1. Obtener Proyectos (GET)
    obtenerProyectos: async () => {
        try {
            const response = await fetch(`${BASE_URL}/proyectos`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudieron cargar los proyectos.`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error de red o servidor:", error);
            throw error; // Re-lanza el error para que la página lo maneje (muestre alerta, etc.)
        }
    },

    // 2. Obtener Costos (GET)
    obtenerCostosVigentes: async () => {
        try {
            const response = await fetch(`${BASE_URL}/costos-rol`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudieron cargar los costos.`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error de red o servidor:", error);
            throw error;
        }
    },

    // 3. Crear Costo (POST)
    crearCosto: async (nuevoCosto) => {
        try {
            const response = await fetch(`${BASE_URL}/costos-rol`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoCosto)
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error ${response.status}: ${errorBody || 'No se pudo guardar el costo.'}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return { success: true };
            }

        } catch (error) {
            console.error("Error guardando costo:", error);
            throw error;
        }
    }, 

    // 4. Actualizar Costo (PUT)
    actualizarCosto: async (id, datos) => {
        try {
            const response = await fetch(`${BASE_URL}/costos-rol/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (!response.ok) throw new Error("Error al actualizar");
            return await response.json();
        } catch (error) {
            console.error("Error actualizando:", error);
            throw error;
        }
    },

    // 5. Eliminar Costo (DELETE)
    eliminarCosto: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/costos-rol/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Error al eliminar");
            return true;
        } catch (error) {
            console.error("Error eliminando:", error);
            throw error;
        }
    },

    // 6. Reporte Calculado (GET)
    obtenerReporteMensual: async (anio) => {
        try {
            const response = await fetch(`${BASE_URL}/reportes/mensual/${anio}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo generar el reporte`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error obteniendo reporte:", error);
            throw error;
        }
    },

	// 7. Obtener Nombre roles (GET)
	obtenerNombreRoles: async () => {
	    try {
	        const response = await fetch(`${BASE_URL}/roles/nombres`);
	        if (!response.ok) {
	            throw new Error(`Error ${response.status}: No se pudieron cargar los nombres roles.`);
	        }
	        return await response.json();
	    } catch (error) {
	        console.error("Error de red o servidor:", error);
	        throw error;
	    }
	},

	// 8. Obtener Experiencias roles (GET)
	obtenerExperienciasRoles: async () => {
	    try {
	        const response = await fetch(`${BASE_URL}/roles/experiencias`);
	        if (!response.ok) {
	            throw new Error(`Error ${response.status}: No se pudieron cargar las experiencias roles.`);
	        }
	        return await response.json();
	    } catch (error) {
	        console.error("Error de red o servidor:", error);
	        throw error;
	    }
	},

    // 9. Obtener Lista Completa de Roles (Objetos con ID, Nombre, Exp)
    // Esto es necesario para cruzar el ID del costo con el nombre real
    obtenerTodosLosRoles: async () => {
        try {
            const response = await fetch(`${BASE_URL}/roles`); // Endpoint que devuelve List<Rol>
            if (!response.ok) throw new Error("Error al obtener roles completos");
            return await response.json();
        } catch (error) {
            console.error("Error fetching full roles:", error);
            return [];
        }
    }
};