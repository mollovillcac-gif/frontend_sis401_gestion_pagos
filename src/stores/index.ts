import { getTokenFromLocalStorage } from '@/helpers';
import http from '@/plugins/axios';
import router from '@/router';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: localStorage.getItem('user') || '',
        usuarioid: Number(localStorage.getItem('usuarioid')) || 0,
        token: getTokenFromLocalStorage(),
        rol: localStorage.getItem('rol') || '',
        correo: localStorage.getItem('correo') || '',
        returnUrl: '' as string
    }),
    getters: {},
    actions: {
        async login(usuario: string, clave: string) {
            const { data } = await http.post('auth/login', { usuario, clave });

            this.user = data.usuario || '';
            this.usuarioid = Number(data.id) || 0;
            this.token = data.access_token || '';
            this.rol = data.rol?.nombre || '';
            this.correo = data.correo || '';

            localStorage.setItem('user', this.user);
            localStorage.setItem('usuarioid', String(this.usuarioid));
            localStorage.setItem('token', this.token);
            localStorage.setItem('rol', this.rol);
            localStorage.setItem('correo', this.correo);

            await router.replace(this.returnUrl || '/dashboard');
        },

        // 🔹 Limpieza local sin llamadas ni navegación (para usar en guards)
        clearSession() {
            this.user = '';
            this.usuarioid = 0;
            this.token = '';
            this.rol = '';
            this.correo = '';

            localStorage.removeItem('user');
            localStorage.removeItem('usuarioid');
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('correo');
        },

        // 🔹 Logout “completo”: intenta avisar al backend y SIEMPRE limpia y navega
        async logout() {
            try {
                if (this.token) {
                    // Si tu API usa Authorization, puedes enviar el token en header en vez del body.
                    await http.post('auth/logout', { token: this.token }).catch(() => {});
                }
            } finally {
                this.clearSession();
                await router.replace('/auth/login'); // evita dejar historial hacia atrás
            }
        },

        async changePassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
            return await http.patch('auth/change-password', { oldPassword, newPassword });
        },

        async forgotPassword(email: string) {
            const { data } = await http.post('/auth/forgot-password', { email });
            return data;
        },

        async resetPassword(token: string, newPassword: string) {
            const { data } = await http.post('/auth/reset-password', { token, newPassword });
            return data;
        },

        async verifyResetToken(token: string) {
            const { data } = await http.post('/auth/verify-reset-token', { token });
            return data;
        }
    }
});
