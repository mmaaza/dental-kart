import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000, // 15 seconds timeout
    // Add retry logic for network errors
    retry: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000; // time interval between retries
    }
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor for retry logic on network errors
api.interceptors.response.use(undefined, (err) => {
    const { config, message } = err;
    if (!config || !config.retry) return Promise.reject(err);
    
    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
        return Promise.reject(err);
    }
    
    // Check if this is a network error
    if (message && (message.includes('Network Error') || message.includes('timeout'))) {
        // Increase the retry count
        config.__retryCount += 1;
        
        // Create new promise to handle exponential backoff
        const backoff = new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Retrying request (${config.__retryCount}/${config.retry})`);
                resolve();
            }, config.retryDelay(config.__retryCount));
        });
        
        // Return the promise in which recalls axios to retry the request
        return backoff.then(() => api(config));
    }
    
    return Promise.reject(err);
});

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Profile update failed' };
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

// Search API
export const searchProducts = async (query, page = 1, limit = 20) => {
    try {
        const response = await api.get('/search', { 
            params: { 
                query,
                page,
                limit
            } 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Search failed' };
    }
};

// SEO Settings API
export const getSeoSettings = async () => {
    try {
        const response = await api.get('/settings/seo');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch SEO settings' };
    }
};

export const updateSeoSettings = async (seoData) => {
    try {
        const response = await api.post('/admin/settings/seo', seoData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update SEO settings' };
    }
};

export default api;