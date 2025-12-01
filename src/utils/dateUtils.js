
export const dateUtils = {

    getCurrentWeekString() {
        const now = new Date();
        const year = now.getFullYear();
        const weekNum = this.getWeekNumber(now);
        return `${year}-W${weekNum.toString().padStart(2, '0')}`;
    },

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    getMondayFromWeekInput(weekValue) {
        if (!weekValue) {
            return this.getMonday(new Date());
        }

        const [yearStr, weekStr] = weekValue.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        const jan4 = new Date(year, 0, 4);
        const jan4Day = jan4.getDay() || 7;
        const jan4Monday = new Date(jan4);
        jan4Monday.setDate(jan4.getDate() - jan4Day + 1);

        const targetMonday = new Date(jan4Monday);
        targetMonday.setDate(jan4Monday.getDate() + (week - 1) * 7);

        return targetMonday;
    },

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    formatDate(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
    },

    formatDateFull(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};