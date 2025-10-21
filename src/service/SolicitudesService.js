import http from '@/plugins/axios';

const API_URL = '/solicitudes';

export const SolicitudesService = {
    // Obtener todas las solicitudes con filtros y paginación
    async getAll(params) {
        return http.get(API_URL, { params });
    },

    // Obtener una solicitud por ID
    async get(id) {
        return http.get(`${API_URL}/${id}`);
    },

    // Crear una nueva solicitud (solo datos)
    async create(data) {
        return http.post(API_URL, data);
    },

    // Actualizar una solicitud
    async update(id, data) {
        return http.put(`${API_URL}/${id}`, data);
    },

    // Cambiar estado de una solicitud
    async changeState(id, estado) {
        return http.patch(`${API_URL}/${id}/estado`, { estado });
    },

    // Eliminar una solicitud
    async delete(id) {
        return http.delete(`${API_URL}/${id}`);
    },

    // Subir comprobante de pago
    async uploadComprobante(id, file) {
        const formData = new FormData();
        formData.append('comprobantePago', file);

        return http.post(`${API_URL}/${id}/comprobante`, formData);
    },

    // Subir factura
    async uploadFactura(id, file) {
        const formData = new FormData();
        formData.append('factura', file);

        return http.post(`${API_URL}/${id}/factura`, formData);
    },

    // Descargar comprobante
    async downloadComprobante(id) {
        return http.get(`${API_URL}/${id}/comprobante/download`, {
            responseType: 'blob'
        });
    },

    // Descargar factura
    async downloadFactura(id) {
        return http.get(`${API_URL}/${id}/factura/download`, {
            responseType: 'blob'
        });
    },

    // Ver comprobante (para mostrar imagen/PDF)
    getComprobanteViewUrl(id) {
        const baseUrl = import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        return `${baseUrl}/solicitudes/${id}/comprobante/view?token=${token}`;
    },

    // Ver factura (para mostrar imagen/PDF)
    getFacturaViewUrl(id) {
        const baseUrl = import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        return `${baseUrl}/solicitudes/${id}/factura/view?token=${token}`;
    },

    // Subir archivo DRESS
    async uploadDress(id, file) {
        const formData = new FormData();
        formData.append('dress', file);
        return http.post(`${API_URL}/${id}/dress`, formData);
    },

    // Descargar DRESS
    async downloadDress(id) {
        return http.get(`${API_URL}/${id}/dress/download`, {
            responseType: 'blob'
        });
    },

    // Ver DRESS (para mostrar imagen/PDF)
    getDressViewUrl(id) {
        const baseUrl = import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        return `${baseUrl}/solicitudes/${id}/dress/view?token=${token}`;
    },

    // Eliminar archivo específico
    async deleteFile(id, fileType) {
        return http.delete(`${API_URL}/${id}/files/${fileType}`);
    },

    // Obtener estadísticas
    async getStats() {
        return http.get(`${API_URL}/estadisticas`);
    },

    // Obtener solicitudes de hoy
    async getSolicitudesHoy(params) {
        return http.get(`${API_URL}/hoy/actuales`, { params });
    },

    // Obtener historial de solicitudes (anteriores a hoy)
    async getHistorial(params) {
        return http.get(`${API_URL}/historial/todas`, { params });
    },

    // Obtener solicitudes del día anterior
    async getSolicitudesPasadas(params) {
        return http.get(`${API_URL}/pasadas/dia-anterior`, { params });
    }
};
