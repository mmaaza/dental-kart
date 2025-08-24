import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getCurrentUser()
                .then(response => {
                    setCurrentUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    // Register function
    const signup = async (name, email, password) => {
        try {
            const response = await apiRegister({ name, email, password });
            if (response.data && response.data.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('pendingVerificationEmail', email);
            }
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);
            setCurrentUser(response.user);
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    // Logout function
    const logout = () => {
        apiLogout();
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('tempLoginPassword');
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser, // Add isAuthenticated property
        setCurrentUser, // Expose setCurrentUser to components
        signup,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};