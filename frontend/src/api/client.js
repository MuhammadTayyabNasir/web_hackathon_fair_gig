import axios from 'axios';
import { useAuthStore } from '../store/auth-store';

const BASE = import.meta.env.VITE_API_URL || window.location.origin || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post(`${BASE}/api/v1/auth/refresh`, {}, { withCredentials: true });
        useAuthStore.getState().setSession({ ...useAuthStore.getState(), accessToken: data.data.accessToken });
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axios(error.config);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
