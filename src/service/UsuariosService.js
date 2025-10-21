import http from '@/plugins/axios';

const API_URL = '/usuarios';

export const UsuariosService = {
    async getAll(params) {
        return http.get(API_URL, { params });
    },
    async get(id) {
        return http.get(`${API_URL}/${id}`);
    },
    async create(data) {
        return http.post(API_URL, data);
    },
    async update(id, data) {
        return http.patch(`${API_URL}/${id}`, data);
    },
    async delete(id) {
        return http.delete(`${API_URL}/${id}`);
    },
    async resetPassword(id) {
        return http.patch(`${API_URL}/${id}/reset-password`);
    }
};
