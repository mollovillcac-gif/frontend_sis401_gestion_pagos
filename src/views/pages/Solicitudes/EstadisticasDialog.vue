<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    estadisticas: {
        type: Object,
        default: () => ({})
    }
});

// Emits
defineEmits(['update:visible']);

// Computed
const chartData = computed(() => {
    const stats = props.estadisticas?.resumen || {};
    return {
        labels: ['Pendientes', 'Subidos', 'Verificadas', 'Pagadas', 'Anuladas'],
        datasets: [
            {
                data: [stats.pendientes || 0, stats.subidas || 0, stats.verificadas || 0, stats.pagadas || 0, stats.anuladas || 0],
                backgroundColor: [
                    '#FF9800', // orange
                    '#00BCD4', // cyan
                    '#4CAF50', // green
                    '#009688', // teal
                    '#F44336' // red
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };
});

const chartOptions = computed(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
});

// Métodos
const getPercentage = (tipo) => {
    const stats = props.estadisticas?.resumen || {};
    const total = stats.total || 0;

    if (total === 0) return 0;

    let value = 0;
    switch (tipo) {
        case 'completadas':
            value = stats.pagadas || 0;
            break;
        case 'proceso':
            value = (stats.pendientes || 0) + (stats.subidas || 0) + (stats.verificadas || 0);
            break;
        case 'anuladas':
            value = stats.anuladas || 0;
            break;
    }

    return Math.round((value / total) * 100);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="true" :style="{ width: '900px' }" header="Estadísticas de Solicitudes" class="p-fluid">
        <div class="grid gap-4" v-if="estadisticas?.resumen">
            <!-- Resumen general -->
            <div class="col-12">
                <div class="surface-card shadow-2 border-round p-4 text-center bg-primary-50">
                    <div class="text-primary font-bold text-2xl mb-2">{{ estadisticas.resumen.total || 0 }}</div>
                    <div class="text-primary font-semibold">Total de Solicitudes</div>
                </div>
            </div>

            <!-- Estadísticas por estado - Grid de 2x3 -->
            <div class="col-12">
                <h5 class="text-center mb-4 text-700">Distribución por Estado</h5>
                <div class="grid gap-3">
                    <!-- Primera fila -->
                    <div class="col-12 md:col-4">
                        <div class="surface-card shadow-2 border-round p-3 text-center border-l-4 border-orange-500">
                            <div class="text-orange-600 font-bold text-xl">{{ estadisticas.resumen.pendientes || 0 }}</div>
                            <div class="text-orange-600 font-medium">Pendientes</div>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="surface-card shadow-2 border-round p-3 text-center border-l-4 border-cyan-500">
                            <div class="text-cyan-600 font-bold text-xl">{{ estadisticas.resumen.subidas || 0 }}</div>
                            <div class="text-cyan-600 font-medium">Subidos</div>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="surface-card shadow-2 border-round p-3 text-center border-l-4 border-green-500">
                            <div class="text-green-600 font-bold text-xl">{{ estadisticas.resumen.verificadas || 0 }}</div>
                            <div class="text-green-600 font-medium">Verificadas</div>
                        </div>
                    </div>

                    <!-- Segunda fila -->
                    <div class="col-12 md:col-6">
                        <div class="surface-card shadow-2 border-round p-3 text-center border-l-4 border-teal-500">
                            <div class="text-teal-600 font-bold text-xl">{{ estadisticas.resumen.pagadas || 0 }}</div>
                            <div class="text-teal-600 font-medium">Pagadas</div>
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <div class="surface-card shadow-2 border-round p-3 text-center border-l-4 border-red-500">
                            <div class="text-red-600 font-bold text-xl">{{ estadisticas.resumen.anuladas || 0 }}</div>
                            <div class="text-red-600 font-medium">Anuladas</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfico y Porcentajes lado a lado -->
            <div class="col-12">
                <div class="grid gap-4">
                    <!-- Gráfico de dona -->
                    <div class="col-12 md:col-6">
                        <div class="surface-card shadow-2 border-round p-4">
                            <h6 class="text-center mb-3 text-700">Distribución Visual</h6>
                            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full" style="height: 300px" />
                        </div>
                    </div>

                    <!-- Porcentajes -->
                    <div class="col-12 md:col-6">
                        <div class="surface-card shadow-2 border-round p-4">
                            <h6 class="text-center mb-4 text-700">Resumen por Categorías</h6>
                            <div class="grid gap-4">
                                <div class="col-12">
                                    <div class="text-center p-3 border-round bg-green-50">
                                        <div class="text-sm text-600 mb-1">Completadas</div>
                                        <div class="font-bold text-green-600 text-2xl">{{ getPercentage('completadas') }}%</div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="text-center p-3 border-round bg-blue-50">
                                        <div class="text-sm text-600 mb-1">En Proceso</div>
                                        <div class="font-bold text-blue-600 text-2xl">{{ getPercentage('proceso') }}%</div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="text-center p-3 border-round bg-red-50">
                                        <div class="text-sm text-600 mb-1">Anuladas</div>
                                        <div class="font-bold text-red-600 text-2xl">{{ getPercentage('anuladas') }}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estadísticas por tipo -->
            <div class="col-12" v-if="estadisticas.porTipo && estadisticas.porTipo.length > 0">
                <div class="surface-card shadow-2 border-round p-4">
                    <h6 class="text-center mb-4 text-700">Estadísticas por Tipo de Solicitud</h6>
                    <div class="grid gap-3">
                        <div class="col-12 md:col-6 lg:col-3" v-for="tipo in estadisticas.porTipo" :key="tipo.tipo">
                            <div class="surface-card shadow-1 border-round p-3 text-center border-2 border-primary-100 hover:border-primary-300 transition-colors">
                                <div class="text-primary font-bold text-lg mb-1">{{ tipo.cantidad }}</div>
                                <div class="text-600 text-sm capitalize mb-2 font-medium">{{ tipo.tipo }}</div>
                                <div class="text-green-600 text-xs" v-if="tipo.montoTotal">
                                    <i class="pi pi-dollar mr-1"></i>
                                    Bs. {{ new Intl.NumberFormat('es-BO').format(tipo.montoTotal) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            </div>
        </template>
    </Dialog>
</template>
