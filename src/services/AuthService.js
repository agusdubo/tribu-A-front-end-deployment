const AuthService = {
    saveSession(userData) {
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('isAuthenticated', 'true');
    },

    getCurrentUser() {
        try {
            const userStr = sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return null;
        }
    },

    isAuthenticated() {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    logout() {
        sessionStorage.clear();
        window.location.href = '/';
    }
};

// ✅ EXPORTACIÓN PARA REACT
export default AuthService;