import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { RolesService } from '@/service/RolesService';
import { Rol } from '@/interfaces/rol.interface';
import { useAuthStore } from '@/stores';

export function useRoles() {
    const roles = ref<Rol[]>([]);
    const rol = ref<Rol>({});
    const loading = ref(false);
    const error = ref(null);
    const toast = useToast();
    const rolDialog = ref(false);
    const deleteRolDialog = ref(false);
    const showFilters = ref(true);
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

    const datatable = ref({
        total: 0
    });

    function openNew() {
        rol.value = { nombre: '', descripcion: '', activo: true };
        rolDialog.value = true;
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
        getRoles();
    }

    function toggleFilters() {
        showFilters.value = !showFilters.value;
    }

    function onPageChange(event: number) {
        filters.value.page = event;
        getRoles();
    }

    function onFilterChange() {
        filters.value.page = 1;
        if (filters.value.nombre === '') filters.value.nombre = null;
        if (filters.value.descripcion === '') filters.value.descripcion = null;
        getRoles();
    }

    async function createRol(roleData: Rol) {
        try {
            roleData.usuarioId = authStore.usuarioid;
            await RolesService.create(roleData);
            rolDialog.value = false;
            getRoles();
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado', life: 5000 });
        } catch (e) {
            if (e.response) {
                if (e.response.status === 400) {
                    const messages = Array.isArray(e.response.data.message) ? e.response.data.message : [e.response.data.message || 'Error en los datos del rol'];
                    messages.forEach((msg: string) => {
                        toast.add({ severity: 'warn', summary: 'Advertencia', detail: msg, life: 5000 });
                    });
                } else if (e.response.status === 404) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Recurso no encontrado', life: 5000 });
                } else if (e.response.status === 409) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: e.response.data.message || 'Conflicto al crear el rol', life: 5000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el rol', life: 5000 });
                }
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el rol', life: 5000 });
            }
        }
    }

    async function updateRol(roleData: Rol) {
        try {
            roleData.usuarioId = authStore.usuarioid;
            await RolesService.update(roleData.id, roleData);
            rolDialog.value = false;
            getRoles();
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado', life: 5000 });
        } catch (e) {
            if (e.response) {
                if (e.response.status === 400) {
                    const messages = Array.isArray(e.response.data.message) ? e.response.data.message : [e.response.data.message || 'Error en los datos del rol'];
                    messages.forEach((msg: string) => {
                        toast.add({ severity: 'warn', summary: 'Advertencia', detail: msg, life: 5000 });
                    });
                } else if (e.response.status === 404) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Recurso no encontrado', life: 5000 });
                } else if (e.response.status === 409) {
                    toast.add({ severity: 'warn', summary: 'Advertencia', detail: e.response.data.message || 'Conflicto al actualizar el rol', life: 5000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el rol', life: 5000 });
                }
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el rol', life: 5000 });
            }
        }
    }

    async function handleSaveRole(roleData: Rol) {
        if (roleData.id) {
            await updateRol(roleData);
        } else {
            await createRol(roleData);
        }
    }

    async function handleDeleteRole(roleData: Rol) {
        try {
            await RolesService.delete(roleData.id);
            deleteRolDialog.value = false;
            getRoles();
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado', life: 5000 });
        } catch (e) {
            if (e.response && e.response.status === 409) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: e.response.data.message || 'No se puede eliminar el rol porque tiene usuarios relacionados', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error al eliminar el rol', life: 5000 });
            }
        }
        deleteRolDialog.value = false;
    }

    function confirmDeleteRol(role: Rol) {
        rol.value = { ...role };
        deleteRolDialog.value = true;
    }

    function editRol(role: Rol) {
        rol.value = { ...role };
        rolDialog.value = true;
    }

    async function getRoles() {
        loading.value = true;
        try {
            const response = await RolesService.getAll({ ...filters.value });
            roles.value = response.data.data;
            datatable.value.total = response.data.total;
        } catch (e) {
            error.value = e;
        } finally {
            loading.value = false;
        }
    }

    return {
        roles,
        rol,
        loading,
        error,
        rolDialog,
        deleteRolDialog,
        showFilters,
        filters,
        datatable,
        openNew,
        clearFilters,
        toggleFilters,
        onPageChange,
        onFilterChange,
        createRol,
        updateRol,
        handleSaveRole,
        handleDeleteRole,
        confirmDeleteRol,
        editRol
    };
}
