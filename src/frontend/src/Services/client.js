import axios from "axios";

// Prefer an env var for base URL (set REACT_APP_API_BASE_URL).
// If not set, choose http for local dev (localhost) to avoid SSL protocol errors,
// otherwise default to HTTPS for non-local environments.
let BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!BASE_URL) {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
        BASE_URL = isLocal ? 'http://localhost:5291/api/v1' : 'https://localhost:5291/api/v1';
    } else {
        BASE_URL = 'https://localhost:5291/api/v1';
    }
}
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // don't log the token value to avoid leakage in console
        console.debug('[API Request] Authorization header attached');
    } else {
        console.debug('[API Request] No token present');
    }
    return config;
});

// Add response interceptor to log 401 errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('[API Response] 401 Unauthorized', {
                url: error.config?.url,
                tokenPresent: !!localStorage.getItem('token'),
                message: error.response?.data?.message
            });
        }
        return Promise.reject(error);
    }
);

export default api;