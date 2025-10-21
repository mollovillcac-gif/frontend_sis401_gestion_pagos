import http from '@/plugins/axios';

const API_URL = '/configuraciones';

export const ConfiguracionesService = {
    async get() {
        return http.get(`${API_URL}/1`); // Obtener la configuración principal (ID: 1)
    },
    async getAll() {
        return http.get(API_URL);
    },
    async create(data) {
        return http.post(API_URL, data);
    },
    async update(id, data) {
        return http.patch(`${API_URL}/${id}`, data);
    },
    async updateMain(data) {
        return http.patch(`${API_URL}/1`, data); // Actualizar la configuración principal
    }
};
