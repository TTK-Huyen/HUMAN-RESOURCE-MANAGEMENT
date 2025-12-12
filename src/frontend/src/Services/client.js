import axios from "axios";

const BASE_URL = "http://localhost:5291/api/v1"; // hoặc endpoint thật nếu đã có
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;