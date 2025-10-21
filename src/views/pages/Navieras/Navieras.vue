<script setup lang="ts">
import ActivoTag from '@/components/ActivoTag.vue';
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import NavieraDialog from './NavieraDialog.vue';
import DeleteNavieraDialog from './DeleteNavieraDialog.vue';

import { NavierasService } from '@/service/NavierasService';
import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/index';
import { useNavieras } from './useNavieras';

const authStore = useAuthStore();

const isAdmin = computed(() => {
    const adminRoles = ['administrador'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

const { filters, datatable, navieras, loading, error, showFilters, navieraDialog, deleteNavieraDialog, naviera, handleSaveNaviera, onPageChange, editNaviera, openNew, toggleFilters, clearFilters, onFilterChange } = useNavieras();

async function getNavieras() {
    loading.value = true;
    try {
        const response = await NavierasService.getAll({
            ...filters.value
        });
        navieras.value = response.data.data;
        datatable.value.total = response.data.total;
    } catch (e) {
        error.value = e;
        loading.value = false;
    }

    loading.value = false;
}

function confirmToggleNaviera(selectedNaviera) {
    naviera.value = selectedNaviera;
    deleteNavieraDialog.value = true;
}

async function handleToggleNaviera(selectedNaviera) {
    try {
        await NavierasService.update(selectedNaviera.id, {
            activo: !selectedNaviera.activo,
            usuarioId: authStore.usuarioid
        });
        deleteNavieraDialog.value = false;
        await getNavieras();
    } catch (e) {
        error.value = e;
    }
}

onMounted(() => {
    getNavieras();
});
</script>

<template>
    <div className="card">
        <!-- Título para usuarios no admin -->
        <div v-if="!isAdmin" class="mb-6">
            <div class="flex p-4 border-round surface-border surface-card shadow-2">
                <div class="flex">
                    <div>
                        <h1 class="text-3xl font-bold text-primary m-0 mb-2">Navieras Disponibles</h1>
                        <p class="text-600 m-0 text-sm">Consulta las navieras activas en el sistema</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toolbar solo para administradores -->
        <Toolbar v-if="isAdmin" class="mb-6">
            <template #start>
                <Button label="Nueva Naviera" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
                <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
            </template>
        </Toolbar>

        <!-- Filtros básicos para usuarios no admin -->
        <div v-if="!isAdmin" class="mb-4">
            <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
            <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
        </div>

        <DataTable :value="navieras" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" :sortOrder="filters.sord === 'ASC' ? 1 : -1" :sortField="filters.sidx" showGridlines class="custom-small-table">
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

           <Column 
            field="descripcion" 
            header="Descripción" 
            :showFilterMenu="false" 
            style="min-width: 300px; max-width: 500px; white-space: normal; word-wrap: break-word; padding: 8px;"
            >

                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.descripcion" type="text" class="p-inputtext-sm" placeholder="Buscar descripción" @blur="filters.descripcion !== null ? onFilterChange() : null" />
                </template>
            </Column>

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

            <Column v-if="isAdmin" header="Acciones" style="min-width: 8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editNaviera(slotProps.data)" />
                    <Button
                        :icon="slotProps.data.activo ? 'pi pi-ban' : 'pi pi-check'"
                        :label="slotProps.data.activo ? 'Inactivar' : 'Activar'"
                        outlined
                        rounded
                        :severity="slotProps.data.activo ? 'warning' : 'success'"
                        @click="confirmToggleNaviera(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>

        <div class="flex justify-center mt-4">
            <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="getNavieras" />
        </div>
    </div>

    <NavieraDialog v-if="isAdmin" v-model:visible="navieraDialog" :naviera="naviera" @save="handleSaveNaviera" />

    <DeleteNavieraDialog v-if="isAdmin" v-model:visible="deleteNavieraDialog" :naviera="naviera" @confirm="handleToggleNaviera" />
</template>

<style scoped>
.custom-small-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.3rem;
}

.custom-small-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.1rem 0.3rem;
}
</style>
