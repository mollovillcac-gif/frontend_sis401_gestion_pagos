import { ref, computed } from 'vue';
import { SolicitudesService } from '@/service/SolicitudesService';
import { NavierasService } from '@/service/NavierasService';
import { UsuariosService } from '@/service/UsuariosService';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/index';

export function useSolicitudes() {
    const toast = useToast();
    const authStore = useAuthStore();

    const solicitudes = ref([]);
    const solicitud = ref({});
    const navieras = ref([]);
    const usuarios = ref([]);
    const loading = ref(false);
    const estadisticas = ref({});

    // Opciones para dropdowns
    const tiposSolicitud = ref([
        { label: 'Gate In', value: 'gatein' },
        { label: 'Demora', value: 'demora' },
        { label: 'Liberación', value: 'liberacion' },
        { label: 'Giros', value: 'giros' }
    ]);

    const estadosSolicitud = ref([
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Subido', value: 'subido' },
        { label: 'Verificada', value: 'verificada' },
        { label: 'Pagada', value: 'pagada' },
        { label: 'Anulada', value: 'anulada' }
    ]);

    const isAdmin = computed(() => {
        const adminRoles = ['administrador']; // Usar solo 'administrador' que es el valor real del enum
        const rolNormalizado = authStore.rol?.toLowerCase() || '';
        return adminRoles.includes(rolNormalizado);
    });

    // Función para cargar solicitudes (todas)
    const cargarSolicitudes = async (filtros = {}) => {
        try {
            loading.value = true;
            const response = await SolicitudesService.getAll(filtros);
            solicitudes.value = response.data.data || [];
            return response.data;
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar solicitudes',
                life: 3000
            });
            return { data: [], total: 0 };
        } finally {
            loading.value = false;
        }
    };

    // Función para cargar solicitudes de hoy
    const cargarSolicitudesHoy = async (filtros = {}) => {
        try {
            loading.value = true;
            const response = await SolicitudesService.getSolicitudesHoy(filtros);
            solicitudes.value = response.data.data || [];
            return response.data;
        } catch (error) {
            console.error('Error al cargar solicitudes de hoy:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar solicitudes de hoy',
                life: 3000
            });
            return { data: [], total: 0 };
        } finally {
            loading.value = false;
        }
    };

    // Función para cargar navieras
    const cargarNavieras = async () => {
        try {
            const response = await NavierasService.getAll({ activo: true, limit: 1000 });
            navieras.value = response.data.data || [];
        } catch (error) {
            console.error('Error al cargar navieras:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar navieras',
                life: 3000
            });
        }
    };

    // Función para cargar usuarios
    const cargarUsuarios = async () => {
        try {
            const response = await UsuariosService.getAll({ activo: true, limit: 1000 });
            usuarios.value = response.data.data || [];
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar usuarios',
                life: 3000
            });
        }
    };

    // Función para crear solicitud
    const crearSolicitud = async (datos) => {
        try {
            loading.value = true;
            datos.usuarioId = authStore.usuarioid;
            const response = await SolicitudesService.create(datos);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Solicitud creada correctamente',
                life: 3000
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear solicitud:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al crear solicitud',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para actualizar solicitud
    const actualizarSolicitud = async (id, datos) => {
        try {
            loading.value = true;
            datos.usuarioId = authStore.usuarioid;
            const response = await SolicitudesService.update(id, datos);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Solicitud actualizada correctamente',
                life: 3000
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar solicitud:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al actualizar solicitud',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para cambiar estado
    const cambiarEstado = async (id, estado) => {
        try {
            loading.value = true;
            const response = await SolicitudesService.changeState(id, estado);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Estado cambiado correctamente',
                life: 3000
            });
            return response.data;
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al cambiar estado',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para eliminar solicitud
    const eliminarSolicitud = async (id) => {
        try {
            loading.value = true;
            await SolicitudesService.delete(id);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Solicitud eliminada correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al eliminar solicitud',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para subir comprobante
    const subirComprobante = async (id, archivo) => {
        try {
            loading.value = true;
            const response = await SolicitudesService.uploadComprobante(id, archivo);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Comprobante subido correctamente',
                life: 3000
            });
            return response.data;
        } catch (error) {
            console.error('Error al subir comprobante:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al subir comprobante',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para subir factura
    const subirFactura = async (id, archivo) => {
        try {
            loading.value = true;
            const response = await SolicitudesService.uploadFactura(id, archivo);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Factura subida correctamente',
                life: 3000
            });
            return response.data;
        } catch (error) {
            console.error('Error al subir factura:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al subir factura',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para descargar archivo
    const descargarArchivo = async (id, tipo) => {
        try {
            let response;
            if (tipo === 'comprobante') {
                response = await SolicitudesService.downloadComprobante(id);
            } else if (tipo === 'factura') {
                response = await SolicitudesService.downloadFactura(id);
            } else {
                response = await SolicitudesService.downloadDress(id);
            }

            // Obtener el tipo MIME del header Content-Type
            const contentType = response.headers['content-type'] || 'application/octet-stream';

            // Crear URL para descarga con el tipo MIME correcto
            const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
            const link = document.createElement('a');
            link.href = url;

            // Obtener nombre del archivo del header Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `${tipo}_${id}`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo descargado correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al descargar archivo',
                life: 3000
            });
        }
    };

    // Función para eliminar archivo
    const eliminarArchivo = async (id, tipoArchivo) => {
        try {
            loading.value = true;
            await SolicitudesService.deleteFile(id, tipoArchivo);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo eliminado correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al eliminar archivo',
                life: 3000
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Función para cargar estadísticas
    const cargarEstadisticas = async () => {
        try {
            const response = await SolicitudesService.getStats();
            estadisticas.value = response.data;
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    return {
        // Estado
        solicitudes,
        solicitud,
        navieras,
        usuarios,
        loading,
        estadisticas,
        tiposSolicitud,
        estadosSolicitud,
        isAdmin,

        // Métodos
        cargarSolicitudes,
        cargarSolicitudesHoy,
        cargarNavieras,
        cargarUsuarios,
        crearSolicitud,
        actualizarSolicitud,
        cambiarEstado,
        eliminarSolicitud,
        subirComprobante,
        subirFactura,
        descargarArchivo,
        eliminarArchivo,
        cargarEstadisticas
    };
}
