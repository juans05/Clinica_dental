import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import SessionExpiredModal from '../components/SessionExpiredModal';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (parseError) {
                        console.error('Error parsing stored user:', parseError);
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    }
                }
            } catch (error) {
                console.error('Error checking user session:', error);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    // Listen for session expired events from api interceptor
    useEffect(() => {
        const handler = () => {
            setUser(null);
            setSessionExpired(true);
        };
        window.addEventListener('auth:session-expired', handler);
        return () => window.removeEventListener('auth:session-expired', handler);
    }, []);

    const handleSessionExpiredRedirect = useCallback(() => {
        setSessionExpired(false);
        window.location.href = '/login';
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setSessionExpired(false);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const completeSetup = () => {
        const updated = { ...user, needsSetup: false };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    const hasPermission = useCallback((permissionKey) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true; // Superadmin always has access
        return user.permissions?.includes(permissionKey);
    }, [user]);

    const value = {
        user,
        login,
        logout,
        completeSetup,
        hasPermission,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            {sessionExpired && (
                <SessionExpiredModal onContinue={handleSessionExpiredRedirect} />
            )}
        </AuthContext.Provider>
    );
};
