import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const vendorApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000,
    retry: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    }
});

// Add a request interceptor to add the vendor auth token to requests
vendorApi.interceptors.request.use(
    (config) => {
        const vendorToken = localStorage.getItem('vendorToken');
        if (vendorToken) {
            config.headers.Authorization = `Bearer ${vendorToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for retry logic on network errors
vendorApi.interceptors.response.use(undefined, (err) => {
    const { config, message } = err;
    if (!config || !config.retry) return Promise.reject(err);
    
    config.__retryCount = config.__retryCount || 0;
    
    if (config.__retryCount >= config.retry) {
        return Promise.reject(err);
    }
    
    if (message && (message.includes('Network Error') || message.includes('timeout'))) {
        config.__retryCount += 1;
        
        const backoff = new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Retrying vendor request (${config.__retryCount}/${config.retry})`);
                resolve();
            }, config.retryDelay(config.__retryCount));
        });
        
        return backoff.then(() => vendorApi(config));
    }
    
    return Promise.reject(err);
});

export default vendorApi;
