import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta: detectar sesión expirada (401)
let sessionExpiredShown = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !sessionExpiredShown) {
            sessionExpiredShown = true;
            // Limpiar sesión
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Emitir evento global para que el AuthProvider/App lo capture
            window.dispatchEvent(new CustomEvent('auth:session-expired'));

            // Reset flag after short delay so subsequent logins work
            setTimeout(() => { sessionExpiredShown = false; }, 3000);
        }
        return Promise.reject(error);
    }
);

export default api;
