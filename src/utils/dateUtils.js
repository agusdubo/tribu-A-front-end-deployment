// dateUtils.js - Utilidades para manejo de fechas

export const dateUtils = {
    /**
     * Obtiene el string de la semana actual en formato "YYYY-Www"
     */
    getCurrentWeekString() {
        const now = new Date();
        const year = now.getFullYear();
        const weekNum = this.getWeekNumber(now);
        return `${year}-W${weekNum.toString().padStart(2, '0')}`;
    },

    /**
     * Calcula el número de semana según ISO 8601
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /**
     * Convierte "2024-W47" a la fecha del lunes de esa semana
     */
    getMondayFromWeekInput(weekValue) {
        if (!weekValue) {
            return this.getMonday(new Date());
        }

        // weekValue tiene formato "2024-W47"
        const [yearStr, weekStr] = weekValue.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        // Enero 4 siempre está en la semana 1
        const jan4 = new Date(year, 0, 4);
        const jan4Day = jan4.getDay() || 7;
        const jan4Monday = new Date(jan4);
        jan4Monday.setDate(jan4.getDate() - jan4Day + 1);

        // Sumar las semanas necesarias
        const targetMonday = new Date(jan4Monday);
        targetMonday.setDate(jan4Monday.getDate() + (week - 1) * 7);

        return targetMonday;
    },

    /**
     * Obtiene el lunes de la semana de una fecha dada
     */
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    /**
     * Formatea una fecha como "Lun 25/11"
     */
    formatDate(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
    },

    /**
     * Formatea una fecha como "25/11/2024"
     */
    formatDateFull(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};