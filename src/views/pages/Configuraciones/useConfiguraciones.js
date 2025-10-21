import { ref, computed } from 'vue';
import { ConfiguracionesService } from '@/service/ConfiguracionesService';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores';

export function useConfiguraciones() {
    const toast = useToast();
    const authStore = useAuthStore();

    // Estado reactivo
    const configuracion = ref({
        id: null,
        usuarioId: null,
        comisionPorcentaje: '',
        tipoCambioUSD: '',
        tipoCambioCLP: ''
    });

    const originalConfiguracion = ref({});
    const loading = ref(false);
    const saving = ref(false);

    // Computed properties
    const hasChanges = computed(() => {
        return JSON.stringify(configuracion.value) !== JSON.stringify(originalConfiguracion.value);
    });

    // Mock de validaciones para mantener compatibilidad
    const $v = ref({
        comisionPorcentaje: { $error: false, $errors: [], $touch: () => {} },
        tipoCambioUSD: { $error: false, $errors: [], $touch: () => {} },
        tipoCambioCLP: { $error: false, $errors: [], $touch: () => {} }
    });

    const isValid = computed(() => {
        return configuracion.value.comisionPorcentaje && configuracion.value.tipoCambioUSD && configuracion.value.tipoCambioCLP;
    });

    const canSave = computed(() => {
        return hasChanges.value && isValid.value && !loading.value;
    });

    // Métodos
    async function loadConfiguracion() {
        loading.value = true;
        try {
            const response = await ConfiguracionesService.get();
            if (response.data) {
                configuracion.value = { ...response.data };
                originalConfiguracion.value = { ...response.data };
            } else {
                // Valores por defecto si no existe configuración
                configuracion.value = {
                    id: null,
                    comisionPorcentaje: '3.00',
                    tipoCambioUSD: '6.96',
                    tipoCambioCLP: '0.0080'
                };
                originalConfiguracion.value = {};
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            handleError(error, 'Error al cargar la configuración');
        } finally {
            loading.value = false;
        }
    }

    async function saveConfiguracion() {
        saving.value = true;
        try {
            let response;
            if (configuracion.value.id) {
                configuracion.value.usuarioId = authStore.usuarioid;
                response = await ConfiguracionesService.updateMain(configuracion.value);
            } else {
                configuracion.value.usuarioId = authStore.usuarioid;
                response = await ConfiguracionesService.create(configuracion.value);
            }

            configuracion.value = { ...response.data };
            originalConfiguracion.value = { ...response.data };

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: configuracion.value.id ? 'Configuración actualizada correctamente' : 'Configuración creada correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            handleError(error, 'Error al guardar la configuración');
        } finally {
            saving.value = false;
        }
    }

    function resetChanges() {
        configuracion.value = { ...originalConfiguracion.value };
    }

    function handleError(error, defaultMessage) {
        let errorMessage = defaultMessage;

        if (error.response?.status === 404) {
            errorMessage = 'No se encontró la configuración. Puedes crear una nueva.';
            toast.add({
                severity: 'info',
                summary: 'Información',
                detail: errorMessage,
                life: 3000
            });
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 3000
            });
        }
    }

    // Formatear fecha para mostrar
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return {
        // Estado
        configuracion,
        originalConfiguracion,
        loading,
        saving,
        $v,

        // Computed
        hasChanges,
        isValid,
        canSave,

        // Métodos
        loadConfiguracion,
        saveConfiguracion,
        resetChanges,
        formatDate
    };
}
