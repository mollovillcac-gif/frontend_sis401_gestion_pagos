import Axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/index';

const axios: AxiosInstance = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_ENDPOINT
});

axios.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (config.headers) {
        // Solo establecer Content-Type si no es FormData
        if (!(config.data instanceof FormData)) {
            config.headers['Content-type'] = 'application/json';
        }
        config.headers['Authorization'] = 'Bearer ' + authStore.token;
    }
    return config;
});

export default axios;
