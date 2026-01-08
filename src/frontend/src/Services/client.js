import axios from "axios";

const BASE_URL = "http://localhost:5291/api/v1"; // hoặc endpoint thật nếu đã có
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 [API Request] Adding Authorization header with token');
    } else {
        console.warn('⚠️ [API Request] No token in localStorage - request may fail with 401');
    }
    return config;
});

// Add response interceptor to log 401 errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('❌ [API Response] 401 Unauthorized:', {
                url: error.config?.url,
                token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
                message: error.response?.data?.message
            });
        }
        return Promise.reject(error);
    }
);

export default api;