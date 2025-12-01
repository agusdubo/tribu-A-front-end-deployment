// APIClient.js - Configurado para Spring Boot Backend
const URL_BASE = window.APP_CONFIG?.API_BASE_URL || "http://localhost:8080";

// Endpoints del backend (coinciden con los controllers)
const ENDPOINT_RECURSOS = "/api/resources"
const ENDPOINT_PROYECTOS = "/api/projects"
const ENDPOINT_TIME_ENTRIES = "/api/time-entries"
const ENDPOINT_REPORTES = "/api/reports"
const ENDPOINT_AUTH = "/auth"

function getAuthToken() {
    try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.token || null;
        }
    } catch (error) {
        console.error('Error al obtener token:', error);
    }
    return null;
}

function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const user = getCurrentUser();
    if (user && user.employeeCode) {
        headers['X-Employee-Id'] = user.employeeCode;
    }

    return headers;
}

let APIClient = {

    // ========== RECURSOS ==========
    getAllResources: async function () {
        return getData(URL_BASE + ENDPOINT_RECURSOS)
    },

    getResourceById: async function(id) {
        return getData(URL_BASE + ENDPOINT_RECURSOS + "/" + id)
    },

    // ========== PROYECTOS ==========
    getAllProjects: async function() {
        return getData(URL_BASE + ENDPOINT_PROYECTOS)
    },

    getProjectsByEmployeeId: async function (employeeId) {
        return getData(URL_BASE + ENDPOINT_PROYECTOS + "/resources/" + employeeId)
    },

    // ========== TAREAS - A TRAVÉS DE TU BACKEND (PROXY) ==========

    /**
     * Obtener tareas del proyecto asignadas a un recurso específico
     * Llama a TU backend, que hace de proxy con la API del profesor
     */
    getTasksByProjectAndResource: async function(projectId, resourceId) {
        try {
            console.log('📋 Cargando tareas:', { projectId, resourceId });

            // Llamar a TU backend que actúa como proxy
            const url = `${URL_BASE}/api/tasks/project/${projectId}/resource/${resourceId}`;
            const tasks = await getData(url);

            console.log('✅ Tareas recibidas:', tasks.length);

            return tasks;

        } catch (error) {
            console.error('❌ Error al cargar tareas:', error);
            throw new Error('No se pudieron cargar las tareas: ' + error.message);
        }
    },

    /**
     * Obtener todas las tareas de un proyecto (sin filtrar por recurso)
     */
    getTasksByProject: async function(projectId) {
        try {
            console.log('📋 Cargando todas las tareas del proyecto:', projectId);

            const url = `${URL_BASE}/api/tasks/project/${projectId}`;
            const tasks = await getData(url);

            console.log('✅ Tareas del proyecto:', tasks.length);

            return tasks;

        } catch (error) {
            console.error('❌ Error al cargar tareas:', error);
            throw error;
        }
    },

    // ========== TIME ENTRIES ==========
    createTimeEntry: async function(data) {
        const timeEntryData = {
            employeeId: data.employeeId,
            projectId: data.projectId,
            taskId: data.taskId || null,  // ✅ AGREGADO
            workDate: data.workDate,
            workedMinutes: data.workedMinutes,
            description: data.description || ""
        };
        return postData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}`, timeEntryData);
    },

    getTimeEntries: async function(employeeId, startDate, endDate) {
        let url = `${URL_BASE}${ENDPOINT_TIME_ENTRIES}?employeeId=${employeeId}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        return getData(url);
    },

    getTimeEntryById: async function(id) {
        return getData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/${id}`);
    },

    updateTimeEntry: async function(id, data) {
        const timeEntryData = {
            taskId: data.taskId || null,  // ✅ AGREGADO
            workDate: data.workDate || data.fecha,
            workedMinutes: data.workedMinutes || (data.horas * 60),
            description: data.description || data.observaciones || ""
        };
        return putData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/${id}`, timeEntryData);
    },

    deleteTimeEntry: async function(id) {
        return deleteData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/${id}`);
    },

    submitTimeEntries: async function(timeEntryIds) {
        return postData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/submit`, {
            timeEntryIds: timeEntryIds
        });
    },

    // ========== MANAGER - APROBACIONES ==========
    getPendingApproval: async function() {
        return getData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/pending-approval`);
    },

    approveTimeEntry: async function(id) {
        return postData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/${id}/approve`, {});
    },

    rejectTimeEntry: async function(id) {
        return postData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/${id}/reject`, {});
    },

    batchApproval: async function(approvals) {
        return postData(`${URL_BASE}${ENDPOINT_TIME_ENTRIES}/batch-approval`, approvals);
    },

    // ========== REPORTES ==========
    getWeeklyHoursReport: async function(employeeId, startDate, endDate) {
        const url = `${URL_BASE}${ENDPOINT_REPORTES}/weekly-hours?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
        return getData(url);
    },

    // src/services/APIClient.js

    getProjectResourcesReport: async function(projectId, year) {
        const url = `${URL_BASE}${ENDPOINT_REPORTES}/project-costs/${year}/${projectId}`;
        console.log('📊 Llamando a:', url);
        return getData(url);
    },
    // ========== AUTENTICACIÓN ==========
    login: async function(employeeCode, password) {
        return postData(`${URL_BASE}${ENDPOINT_AUTH}/login`, {
            employeeCode,
            password
        });
    },

    logout: async function() {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        window.location.href = '/login.html';
    },

    // ========== MÉTODOS LEGACY (para compatibilidad) ==========
    getTimeEntriesByResource: async function(id) {
        return this.getTimeEntries(id);
    },

    getResourcesByProjectAndYear: async function(projectId, year) {
        const month = `${year}-01-01`;
        return this.getProjectResourcesReport(projectId, year);
    }
}

// ========== FUNCIONES AUXILIARES ==========

async function getData(url) {
    try {
        console.log('🔵 GET:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ No autorizado. Redirigiendo a login...');
                sessionStorage.clear();
                window.location.href = '/login.html';
                return null;
            }

            const error = new Error(`Error ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        const result = await response.json();
        console.log("✅ GET exitoso:", result);
        return result;
    } catch (error) {
        console.error('❌ Error en getData:', error);
        throw error;
    }
}

async function postData(url, data) {
    try {
        console.log('🟢 POST:', url, data);

        const options = {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ No autorizado. Redirigiendo a login...');
                sessionStorage.clear();
                window.location.href = '/login.html';
                return null;
            }

            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("✅ POST exitoso:", result);
        return result;
    } catch (error) {
        console.error('❌ Error en postData:', error.message);
        throw error;
    }
}

async function putData(url, data) {
    try {
        console.log('🟡 PUT:', url, data);

        const options = {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ No autorizado. Redirigiendo a login...');
                sessionStorage.clear();
                window.location.href = '/login.html';
                return null;
            }

            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("✅ PUT exitoso:", result);
        return result;
    } catch (error) {
        console.error('❌ Error en putData:', error.message);
        throw error;
    }
}

async function deleteData(url) {
    try {
        console.log('🔴 DELETE:', url);

        const options = {
            method: 'DELETE',
            headers: getAuthHeaders()
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ No autorizado. Redirigiendo a login...');
                sessionStorage.clear();
                window.location.href = '/login.html';
                return null;
            }

            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        if (response.status === 204) {
            console.log("✅ DELETE exitoso (No Content)");
            return { success: true };
        }

        const result = await response.json();
        console.log("✅ DELETE exitoso:", result);
        return result;
    } catch (error) {
        console.error('❌ Error en deleteData:', error.message);
        throw error;
    }
}

// ========== FUNCIONES AUXILIARES DE SESIÓN ==========

function getCurrentUser() {
    try {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}

function isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

// ========== FUNCIÓN LEGACY (mantener compatibilidad) ==========
function createTimeEntryJson(codigoEmpleado, fecha, proyecto, tarea, horas, status, observaciones) {
    return {
        employeeId: codigoEmpleado,
        workDate: fecha,
        taskId: tarea,
        projectId: proyecto,
        workedMinutes: horas * 60,
        description: observaciones || ""
    }
}

export default APIClient;