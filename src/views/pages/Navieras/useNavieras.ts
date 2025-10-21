import { Naviera } from '@/interfaces/naviera.interface';
import { NavierasService } from '@/service/NavierasService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/index';

export function useNavieras() {
    const navieras = ref<Naviera[]>([]);
    const naviera = ref<Naviera>({ nombre: '', descripcion: '', activo: false });
    const loading = ref(false);
    const error = ref(null);
    const toast = useToast();
    const navieraDialog = ref(false);
    const deleteNavieraDialog = ref(false);
    const showFilters = ref(true);
    const datatable = ref({ total: 0 });
    const authStore = useAuthStore();
    const filters = ref({
        page: 1,
        limit: 20,
        sord: 'DESC',
        sidx: 'id',
        nombre: null,
        descripcion: null,
        activo: true
    });

    function openNew() {
        naviera.value = {
            nombre: '',
            descripcion: '',
            activo: true
        };
        navieraDialog.value = true;
    }

    function clearFilters() {
        filters.value = {
            page: 1,
            limit: 20,
            sord: 'DESC',
            sidx: 'id',
            nombre: null,
            descripcion: null,
            activo: null
        };
        getNavieras();
    }

    function toggleFilters() {
        showFilters.value = !showFilters.value;
    }

    function hideDialog() {
        navieraDialog.value = false;
    }

    function onPageChange(event: number) {
        filters.value.page = event;
        getNavieras();
    }

    function onFilterChange() {
        filters.value.page = 1;
        if (filters.value.nombre === '') filters.value.nombre = null;
        if (filters.value.descripcion === '') filters.value.descripcion = null;
        getNavieras();
    }

    function editNaviera(nav: Naviera) {
        naviera.value = { ...nav };
        navieraDialog.value = true;
    }

    async function getNavieras() {
        loading.value = true;
        try {
            const response = await NavierasService.getAll({ ...filters.value });
            navieras.value = response.data.data;
            datatable.value.total = response.data.total;
        } catch (e) {
            error.value = e;
        }
        loading.value = false;
    }

    function confirmDeleteNaviera(nav: Naviera) {
        naviera.value = { ...nav };
        deleteNavieraDialog.value = true;
    }

    function handleSaveNaviera(navData: Naviera) {
        if (navData.id) {
            updateNaviera(navData);
        } else {
            createNaviera(navData);
        }

        loading.value = false;
    }

    async function createNaviera(navData: Naviera) {
        loading.value = true;
        try {
            navData.usuarioId  = authStore.usuarioid;
            await NavierasService.create(navData);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Naviera creada', life: 5000 });
            navieraDialog.value = false;
            getNavieras();
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: messages, life: 5000 });
                } else if (error.response.status === 404) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Recurso no encontrado', life: 5000 });
                } else if (error.response.status === 409) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: error.response.data.message || 'Conflicto al crear la naviera', life: 5000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la naviera', life: 5000 });
                }
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la naviera', life: 5000 });
            }
        } finally {
            loading.value = false;
        }
    }

    async function updateNaviera(navData: Naviera) {
        loading.value = true;
        try {
            navData.usuarioId  = authStore.usuarioid;
            await NavierasService.update(navData.id, navData);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Naviera actualizada', life: 5000 });
            navieraDialog.value = false;
            getNavieras();
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: messages, life: 5000 });
                } else if (error.response.status === 404) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Recurso no encontrado', life: 5000 });
                } else if (error.response.status === 409) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: error.response.data.message || 'Conflicto al actualizar la naviera', life: 5000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la naviera', life: 5000 });
                }
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la naviera', life: 5000 });
            }
        } finally {
            loading.value = false;
        }
    }

    async function handleDeleteNaviera(nav: Naviera) {
        try {
            await NavierasService.delete(nav.id);
            deleteNavieraDialog.value = false;
            getNavieras();
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Naviera eliminada', life: 5000 });
        } catch (e) {
            if (e.response && e.response.status === 409) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: e.response.data.message || 'No se puede eliminar la naviera porque tiene productos relacionados', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error al eliminar la naviera', life: 5000 });
            }
        }
        deleteNavieraDialog.value = false;
    }

    onMounted(() => {
        getNavieras();
    });

    return {
        navieras,
        naviera,
        loading,
        error,
        navieraDialog,
        deleteNavieraDialog,
        showFilters,
        filters,
        datatable,
        openNew,
        clearFilters,
        toggleFilters,
        hideDialog,
        onPageChange,
        onFilterChange,
        handleSaveNaviera,
        editNaviera,
        confirmDeleteNaviera,
        handleDeleteNaviera
    };
}
