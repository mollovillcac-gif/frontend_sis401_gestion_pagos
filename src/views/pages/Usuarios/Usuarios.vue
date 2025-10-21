<script setup>
import ActivoTag from '@/components/ActivoTag.vue';
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import { RolesService } from '@/service/RolesService';
import { UsuariosService } from '@/service/UsuariosService';
import { useAuthStore } from '@/stores/index';
import useVuelidate from '@vuelidate/core';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { claveValidations, usuarioValidations } from './usuarioValidations';

// Banner para usuarios inactivos
const showInactiveBanner = ref(false);
const inactiveUsuarios = computed(() => usuarios.value.filter((u) => u.activo === false));
const showInactiveList = ref(false);

const roles = ref([]);
const usuarios = ref([]);
const usuario = ref({});
const loading = ref(false);
const toast = useToast();
const authStore = useAuthStore();
const usuarioDialog = ref(false);
const deleteUsuarioDialog = ref(false);
const showFilters = ref(true);

const rules = computed(() => {
    if (!usuario.value.id) {
        return {
            ...usuarioValidations,
            ...claveValidations
        };
    } else {
        return {
            ...usuarioValidations
        };
    }
});

const isAdmin = computed(() => {
    const adminRoles = ['admin', 'administrador'];
    let adminRoleNormalized = authStore.rol.toLowerCase();
    return adminRoles.includes(adminRoleNormalized);
});

const v$ = useVuelidate(rules, usuario);

// Filtros extendidos
const filters = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'id',
    usuario: null,
    nombre: null,
    apellido: null,
    direccion: null,
    telefono: null,
    correo: null,
    activo: null,
    rolId: null
});

const filtersRol = ref({
    page: 1,
    limit: 1000,
    sord: 'DESC',
    sidx: 'id',
    activo: true
});

const datatable = ref({
    total: 0
});

// Función para limpiar filtros
function clearFilters() {
    filters.value = {
        page: 1,
        limit: 20,
        sord: 'DESC',
        sidx: 'id',
        usuario: null,
        nombre: null,
        apellido: null,
        direccion: null,
        telefono: null,
        correo: null,
        rolId: null,
        activo: null
    };
    getUsuarios();
}

// Toggle filters visibility
function toggleFilters() {
    showFilters.value = !showFilters.value;
}

function openNew() {
    usuario.value = {
        usuario: '',
        nombre: '',
        apellido: '',
        direccion: '',
        telefono: '',
        clave: null,
        correo: '',
        activo: true
    };
    usuarioDialog.value = true;
    v$.value.$reset();
}

function hideDialog() {
    usuarioDialog.value = false;
    v$.value.$reset();
}

async function saveUsuario() {
    loading.value = true;
    const isFormValid = await v$.value.$validate();

    if (!isFormValid) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, corrija los errores del formulario', life: 5000 });
        return;
    }

    if (usuario.value.id) {
        usuario.value.modificadoPor = authStore.usuarioid;
        updateUsuario();
    } else {
        usuario.value.creadoPor = authStore.usuarioid;
        createUsuario();
    }

    loading.value = false;
}

async function createUsuario() {
    loading.value = true;
    try {
        usuario.value.usuarioId = authStore.usuarioid;
        await UsuariosService.create(usuario.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario Creado', life: 5000 });
        hideDialog();
        await getUsuarios();
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: messages, life: 5000 });
            } else if (error.response.status === 404) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Usuario no encontrado', life: 5000 });
            } else if (error.response.status === 409) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: error.response.data.message || 'Conflicto al crear el usuario', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error creando Usuario', life: 5000 });
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error creando Usuario', life: 5000 });
        }
    } finally {
        loading.value = false;
    }
}

async function updateUsuario() {
    loading.value = true;
    try {
        const usuarioToUpdate = {
            ...usuario.value,
            usuarioId: authStore.usuarioid,
            rolId: usuario.value.rolId
        };
        delete usuarioToUpdate.fechaCreacion;
        delete usuarioToUpdate.fechaModificacion;
        delete usuarioToUpdate.rol;
        await UsuariosService.update(usuario.value.id, usuarioToUpdate);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario Actualizado', life: 5000 });
        hideDialog();
        await getUsuarios();
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: messages, life: 5000 });
            } else if (error.response.status === 404) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Usuario no encontrado', life: 5000 });
            } else if (error.response.status === 409) {
                toast.add({ severity: 'warn', summary: 'Advertencia', detail: error.response.data.message || 'Conflicto al actualizar el usuario', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error actualizando Usuario', life: 5000 });
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error actualizando Usuario', life: 5000 });
        }
    } finally {
        loading.value = false;
    }
}

async function deleteUsuario() {
    loading.value = true;
    try {
        await UsuariosService.delete(usuario.value.id);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario Eliminado', life: 5000 });
        hideDialog();
        await getUsuarios();
    } catch (error) {
        if (error.response && error.response.status === 409) {
            toast.add({ severity: 'warn', summary: 'Advertencia', detail: error.response.data.message || 'No se puede eliminar el usuario porque tiene relaciones', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error eliminando Usuario', life: 5000 });
        }
    } finally {
        loading.value = false;
    }

    deleteUsuarioDialog.value = false;
}

function editUsuario(usuarioParam) {
  usuario.value = {
    ...usuarioParam,
    // 👇 fuerza a boolean (true/false) aunque venga 1/0, "true"/"false", etc.
    activo: !!usuarioParam.activo,
    usuarioId: authStore.usuarioid,
    rolId: usuarioParam.rol?.id
  };
  usuarioDialog.value = true;
  v$.value.$reset();
}


async function resetUsuarioPassword(usuario) {
    loading.value = true;
    try {
        await UsuariosService.resetPassword(usuario.id);
        const defaultPassword = import.meta.env.VITE_DEFAULT_PASSWORD || 'hola123';
        toast.add({
            severity: 'success',
            summary: 'Contraseña Restablecida Con Éxito',
            detail: `La contraseña ha sido restablecida a la contraseña por defecto: ${defaultPassword}`,
            life: 25000
        });
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: error.response.data.message || 'Solicitud incorrecta al restablecer la contraseña',
                    life: 5000
                });
            } else if (error.response.status === 404) {
                toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Usuario no encontrado',
                    life: 5000
                });
            } else if (error.response.status === 401) {
                toast.add({
                    severity: 'warn',
                    summary: 'No Autorizado',
                    detail: 'No tienes permisos para realizar esta acción',
                    life: 5000
                });
            } else if (error.response.status === 500) {
                toast.add({
                    severity: 'error',
                    summary: 'Error del Servidor',
                    detail: 'Ocurrió un error interno al restablecer la contraseña',
                    life: 5000
                });
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo restablecer la contraseña',
                    life: 5000
                });
            }
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo restablecer la contraseña',
                life: 5000
            });
        }
    } finally {
        loading.value = false;
    }
}

function confirmDeleteUsuario(usuarioParam) {
    usuario.value = { ...usuarioParam };
    deleteUsuarioDialog.value = true;
}

async function getRoles() {
    try {
        const response = await RolesService.getAll({
            ...filtersRol.value
        });
        roles.value = response.data.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar roles', life: 5000 });
    }
}

async function getUsuarios() {
    loading.value = true;
    try {
        const response = await UsuariosService.getAll({
            ...filters.value
        });
        usuarios.value = response.data.data;
        datatable.value.total = response.data.total;
        // Mostrar banner si hay inactivos y el usuario es admin
        showInactiveBanner.value = isAdmin.value && inactiveUsuarios.value.length > 0;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar usuarios', life: 5000 });
    } finally {
        loading.value = false;
    }
}

function onPageChange(event) {
    filters.value.page = event;
    getUsuarios();
    getRoles();
}

async function activarUsuario(usuarioId) {
    loading.value = true;
    try {
        await UsuariosService.update(usuarioId, { activo: true });
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario activado', life: 4000 });
        await getUsuarios();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo activar el usuario', life: 4000 });
    } finally {
        loading.value = false;
    }
}

function onFilterChange() {
    filters.value.page = 1;
    if (filters.value.usuario === '') filters.value.usuario = null;
    if (filters.value.nombre === '') filters.value.nombre = null;
    if (filters.value.apellido === '') filters.value.apellido = null;
    if (filters.value.direccion === '') filters.value.direccion = null;
    if (filters.value.telefono === '') filters.value.telefono = null;
    if (filters.value.rolId === '') filters.value.rolId = null;
    if (filters.value.correo === '') filters.value.correo = null;
    getUsuarios();
}

onMounted(() => {
    getUsuarios();
    getRoles();
});
</script>

<template>
    <div class="card">
        <!-- Banner para usuarios inactivos -->
        <div v-if="showInactiveBanner" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex items-center justify-between">
            <span> <strong>Usuarios inactivos:</strong> Hay {{ inactiveUsuarios.length }} usuario(s) que necesitan aprobación. </span>
            <Button label="Ver usuarios inactivos" icon="pi pi-eye" severity="warning" @click="showInactiveList = !showInactiveList" />
        </div>
        <!-- Lista de usuarios inactivos -->
        <div v-if="showInactiveList && inactiveUsuarios.length" class="mb-4">
            <div class="bg-white border border-yellow-300 rounded p-3">
                <h4 class="font-bold mb-2">Usuarios inactivos</h4>
                <ul>
                    <li v-for="u in inactiveUsuarios" :key="u.id" class="flex items-center justify-between py-1">
                        <span>{{ u.usuario }} - {{ u.nombre }} {{ u.apellido }}</span>
                        <Button label="Activar" icon="pi pi-check" severity="success" size="small" @click="activarUsuario(u.id)" />
                    </li>
                </ul>
            </div>
        </div>
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nuevo Usuario" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
                <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
            </template>
        </Toolbar>

        <DataTable :value="usuarios" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" :sortOrder="filters.sord === 'ASC' ? 1 : -1" :sortField="filters.sidx" showGridlines class="custom-small-table">
            <template #empty>
                <p class="text-center my-5">No se encontraron datos 🔎</p>
            </template>
            <!-- Indice columna -->
            <Column header="#" style="max-width: 50px">
                <template #body="slotProps">
                    {{ (filters.page - 1) * filters.limit + slotProps.index + 1 }}
                </template>
            </Column>

            <!-- Columns con filtros -->
            <Column field="usuario" header="Usuario" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.usuario" type="text" class="p-inputtext-sm" placeholder="Buscar por usuario" maxlength="30" @blur="filters.usuario !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <Column field="nombre" header="Nombre Completo" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.nombre" type="text" class="p-inputtext-sm" placeholder="Buscar por nombre" maxlength="30" @blur="filters.nombre !== null ? onFilterChange() : null" />
                </template>
                <template #body="slotProps">
                    {{ `${slotProps.data.nombre || ''} ${slotProps.data.apellido || ''}`.trim() }}
                </template>
            </Column>

            <Column field="telefono" header="Teléfono" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.telefono" type="text" class="p-inputtext-sm" placeholder="Buscar teléfono" @blur="filters.telefono !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <!-- <Column field="correo" header="Correo" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.correo" type="text" class="p-inputtext-sm" placeholder="Buscar correo" @blur="filters.correo !== null ? onFilterChange() : null" />
                </template>
            </Column> -->

            <Column field="rol.nombre" header="Rol" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.rolId" :options="roles" optionLabel="nombre" optionValue="id" placeholder="Seleccionar rol" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
            </Column>

            <!-- Active status column -->
            <Column field="activo" header="Activo" :showFilterMenu="false">
                <template #filter>
                    <Select
                        v-if="showFilters"
                        v-model="filters.activo"
                        :options="[
                            { label: 'Todos', value: null },
                            { label: 'Activo', value: true },
                            { label: 'Inactivo', value: false }
                        ]"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Filtrar estado"
                        class="p-column-filter w-full"
                        @change="onFilterChange"
                        size="small"
                    />
                </template>
                <template #body="slotProps">
                    <ActivoTag :isActive="slotProps.data.activo" />
                </template>
            </Column>

            <Column header="Acciones" style="min-width: 8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUsuario(slotProps.data)" />
                    <Button v-if="isAdmin" icon="pi pi-refresh" outlined rounded class="mr-2" severity="info" @click="resetUsuarioPassword(slotProps.data)" v-tooltip.top="'Restablecer la contraseña del usuario'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUsuario(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
        <div class="flex justify-center mt-4">
            <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="getUsuarios" />
        </div>
    </div>

    <!-- Dialog para crear/editar usuario -->
    <Dialog v-model:visible="usuarioDialog" :style="{ width: '500px' }" :modal="true" :header="usuario.id ? 'Editar Usuario' : 'Nuevo Usuario'" @update:visible="(value) => !value && v$.$reset()">
        <div class="grid gap-4">
            <div class="flex flex-col">
                <label for="usuario" class="text-sm font-semibold">Usuario <span class="text-red-500">*</span></label>
                <InputText v-model="usuario.usuario" id="usuario" class="p-2 border rounded-md" required :class="{ 'border-red-500': v$.usuario.$error }" @blur="v$.usuario.$touch()" />
                <small v-if="v$.usuario.$error" class="text-red-500">
                    {{ v$.usuario.$errors[0].$message }}
                </small>
            </div>

            <!-- Campo de contraseña solo visible en creación -->
            <div v-if="!usuario.id" class="flex flex-col w-full">
                <label for="clave" class="text-sm font-semibold">Contraseña <span class="text-red-500">*</span></label>
                <Password
                    v-model="usuario.clave"
                    id="clave"
                    :feedback="true"
                    toggleMask
                    class="w-full p-password-w-full"
                    inputClass="w-full"
                    required
                    :class="{ 'p-invalid': v$.clave && v$.clave.$error }"
                    @blur="v$.clave && v$.clave.$touch()"
                    promptLabel="Ingresa una contraseña"
                    weakLabel="Débil"
                    mediumLabel="Media"
                    strongLabel="Fuerte"
                />
                <small v-if="v$.clave && v$.clave.$error" class="text-red-500">
                    {{ v$.clave.$errors[0].$message }}
                </small>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label for="nombre" class="text-sm font-semibold">Nombre <span class="text-red-500">*</span></label>
                    <InputText v-model="usuario.nombre" id="nombre" class="p-2 border rounded-md" required :class="{ 'border-red-500': v$.nombre.$error }" @blur="v$.nombre.$touch()" />
                    <small v-if="v$.nombre.$error" class="text-red-500">
                        {{ v$.nombre.$errors[0].$message }}
                    </small>
                </div>
                <div class="flex flex-col">
                    <label for="apellido" class="text-sm font-semibold">Apellido <span class="text-red-500">*</span></label>
                    <InputText v-model="usuario.apellido" id="apellido" class="p-2 border rounded-md" required :class="{ 'border-red-500': v$.apellido.$error }" @blur="v$.apellido.$touch()" />
                    <small v-if="v$.apellido.$error" class="text-red-500">
                        {{ v$.apellido.$errors[0].$message }}
                    </small>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label for="telefono" class="text-sm font-semibold">Teléfono</label>
                    <InputText v-model="usuario.telefono" id="telefono" class="p-2 border rounded-md" :class="{ 'border-red-500': v$.telefono.$error }" @blur="v$.telefono.$touch()" />
                    <small v-if="v$.telefono.$error" class="text-red-500">
                        {{ v$.telefono.$errors[0].$message }}
                    </small>
                </div>
                <div class="flex flex-col">
                    <label for="correo" class="text-sm font-semibold">Correo <span class="text-red-500">*</span></label>
                    <InputText v-model="usuario.correo" id="correo" type="email" class="p-2 border rounded-md" required :class="{ 'border-red-500': v$.correo.$error }" @blur="v$.correo.$touch()" />
                    <small v-if="v$.correo.$error" class="text-red-500">
                        {{ v$.correo.$errors[0].$message }}
                    </small>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 items-end">
                <div class="flex flex-col">
                    <label for="rolId" class="text-sm font-semibold">Rol <span class="text-red-500">*</span></label>
                    <Select
                        v-model="usuario.rolId"
                        id="rolId"
                        :options="roles"
                        optionLabel="nombre"
                        optionValue="id"
                        placeholder="Seleccionar rol"
                        class="p-column-filter w-full"
                        required
                        :class="{ 'border-red-500': v$.rolId.$error }"
                        @blur="v$.rolId.$touch()"
                    />
                    <small v-if="v$.rolId.$error" class="text-red-500">
                        {{ v$.rolId.$errors[0].$message }}
                    </small>
                </div>
                <div class="flex flex-col">
                    <label for="activo" class="text-sm font-semibold mb-1">Activo</label>
                    <ToggleSwitch v-model="usuario.activo" :true-value="true" :false-value="false" :class="['p-column-filter', { 'border-red-500': v$.activo && v$.activo.$error }]" @blur="v$.activo.$touch()" />
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="hideDialog" />
                <Button label="Guardar" class="hover:gray-400 text-white py-2 px-4 rounded-lg transition" :disabled="v$.$invalid" @click="saveUsuario" />
            </div>
        </div>
    </Dialog>

    <Dialog v-model:visible="deleteUsuarioDialog" :style="{ width: '450px' }" :modal="true" header="Confirmar eliminación">
        <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
            <span
                >¿Estás seguro de que quieres eliminar al usuario <strong>{{ usuario?.usuario }} ({{ usuario?.nombre }} {{ usuario?.apellido }})</strong>?</span
            >
        </div>
        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="deleteUsuarioDialog = false" />
            <Button label="Eliminar" severity="danger" @click="deleteUsuario" />
        </template>
    </Dialog>
</template>

<style scoped>
.custom-small-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.3rem;
}

.custom-small-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.1rem 0.3rem;
}
</style>
