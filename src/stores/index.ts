import { getTokenFromLocalStorage } from '@/helpers';
import http from '@/plugins/axios';
import router from '@/router';
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', {
    state: () => ({
        user: localStorage.getItem('user') || '',
        usuarioid: Number(localStorage.getItem('usuarioid')) || 0,
        token: getTokenFromLocalStorage(),
        rol: localStorage.getItem('rol') || '',
        correo: localStorage.getItem('correo') || '',
        returnUrl: ''
    }),
    getters: {},
    actions: {
        async login(usuario: string, clave: string) {
            await http.post('auth/login', { usuario, clave }).then((response) => {
                this.user = response.data.usuario;
                this.usuarioid = response.data.id;
                this.token = response.data.access_token;
                this.rol = response.data.rol.nombre;
                this.correo = response.data.correo || '';

                localStorage.setItem('user', this.user || '');
                localStorage.setItem('usuarioid', this.usuarioid || '');
                localStorage.setItem('token', this.token || '');
                localStorage.setItem('rol', this.rol || '');
                localStorage.setItem('correo', this.correo || '');

                router.push(this.returnUrl || '/dashboard');
            });
        },
        async logout() {
            await http.post('auth/logout', { token: this.token }).then(() => {
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
                router.push('/');
            });
        },
        async changePassword({ oldPassword, newPassword }) {
            return await http.patch('auth/change-password', {
                oldPassword,
                newPassword
            });
        },
        // Método para solicitar recuperación de contraseña
        async forgotPassword(email) {
            try {
                const response = await http.post('/auth/forgot-password', {
                    email: email
                });
                return response.data;
            } catch (error) {
                console.error('Error en forgotPassword:', error);
                throw error;
            }
        },

        // Método para restablecer contraseña
        async resetPassword(token, newPassword) {
            try {
                const response = await http.post('/auth/reset-password', {
                    token: token,
                    newPassword: newPassword
                });
                return response.data;
            } catch (error) {
                console.error('Error en resetPassword:', error);
                throw error;
            }
        },

        // Método para verificar token de restablecimiento
        async verifyResetToken(token) {
            try {
                const response = await http.post('/auth/verify-reset-token', {
                    token: token
                });
                return response.data;
            } catch (error) {
                console.error('Error en verifyResetToken:', error);
                throw error;
            }
        }
    }
});

export { useAuthStore };
