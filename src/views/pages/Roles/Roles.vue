<script setup lang="ts">
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import DeleteRolDialog from './DeleteRolDialog.vue';
import RolDialog from './RolDialog.vue';

import { onMounted } from 'vue';
import { useRoles } from './useRoles';
import { RolesService } from '@/service/RolesService';

const { roles, rol, loading, rolDialog, deleteRolDialog, showFilters, filters, datatable, error, openNew, clearFilters, toggleFilters, onPageChange, onFilterChange, handleSaveRole, handleDeleteRole, confirmDeleteRol, editRol } = useRoles();

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

onMounted(() => {
    getRoles();
});
</script>

<template>
    <div className="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nuevo Rol" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
                <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
            </template>
        </Toolbar>
        <DataTable :value="roles" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" :sortOrder="filters.sord === 'ASC' ? 1 : -1" :sortField="filters.sidx" showGridlines class="custom-small-table">
            <template #empty>
                <p class="text-center my-5">No se encontraron datos 🔎</p>
            </template>

            <!-- Índice columna -->
            <Column header="#" style="max-width: 50px">
                <template #body="slotProps">
                    {{ (filters.page - 1) * filters.limit + slotProps.index + 1 }}
                </template>
            </Column>

            <Column field="nombre" header="Nombre" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.nombre" type="text" class="p-inputtext-sm" placeholder="Buscar nombre" @blur="filters.nombre !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <Column field="descripcion" header="Descripción" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.descripcion" type="text" class="p-inputtext-sm" placeholder="Buscar descripción" @blur="filters.descripcion !== null ? onFilterChange() : null" />
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
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRol(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteRol(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <div class="flex justify-center mt-4">
            <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="getRoles" />
        </div>
    </div>

    <RolDialog v-model:visible="rolDialog" :role="rol" @save="handleSaveRole" />

    <DeleteRolDialog v-model:visible="deleteRolDialog" :role="rol" @confirm="handleDeleteRole" />
</template>

<style scoped>
.custom-small-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.3rem;
}

.custom-small-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.1rem 0.3rem;
}
</style>
