<script setup>
import { computed, onMounted } from 'vue';
import { Line, Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import { useDashboard } from '../../util/useDashboard';

// Registrar componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler);

// Usar el composable para toda la lógica del dashboard
const { mainStats, additionalMetrics, requestStatuses, topNavieras, paymentsLineData, requestTypeDistributionData, comparativeData, salesLineOptions, doughnutOptions, comparativeOptions, loadDashboardData } = useDashboard();

onMounted(() => {
    loadDashboardData();
});

// Fecha y hora actual
const currentDateTime = computed(() => {
    return new Date().toLocaleString('es-ES');
});
</script>

<template>
    <div class="dashboard-container">
        <div class="dashboard-content">
            <!-- Header -->
            <div class="dashboard-header">
                <h1 class="dashboard-title">Dashboard de Administración - Gestión de Pagos Navieras</h1>
                <p class="dashboard-subtitle">Panel de control integral para administradores - Solicitudes, pagos y operaciones portuarias</p>
            </div>

            <!-- Tarjetas principales -->
            <div class="main-stats-grid">
                <Card v-for="(stat, index) in mainStats" :key="index" class="stat-card">
                    <template #content>
                        <div :class="`stat-background stat-${stat.gradient.split('-')[1]}`"></div>
                        <div class="stat-content">
                            <div class="stat-header">
                                <div :class="`stat-icon stat-icon-${stat.gradient.split('-')[1]}`">
                                    <i :class="`${stat.icon}`"></i>
                                </div>
                                <!-- <Tag :value="stat.change" :severity="stat.change.startsWith('+') ? 'success' : 'danger'" class="stat-tag"> </Tag> -->
                            </div>
                            <div class="stat-info">
                                <p class="stat-title">{{ stat.title }}</p>
                                <p class="stat-value">{{ stat.value }}</p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Gráficos principales -->
            <div class="charts-grid">
                <!-- Gráfico de recaudación (Línea) -->
                <Card class="chart-card">
                    <template #title>
                        <h3 class="chart-title">Tendencia de Recaudación</h3>
                    </template>
                    <template #content>
                        <div class="chart-container" style="height: 300px">
                            <Line :data="paymentsLineData" :options="salesLineOptions" />
                        </div>
                    </template>
                </Card>

                <!-- Gráfico de distribución de tipos de solicitud (Dona) -->
                <Card class="chart-card">
                    <template #title>
                        <h3 class="chart-title">Distribución por Tipo de Solicitud</h3>
                    </template>
                    <template #content>
                        <div class="chart-container" style="height: 300px">
                            <Doughnut :data="requestTypeDistributionData" :options="doughnutOptions" />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Gráfico comparativo -->
            <Card class="chart-card chart-card-full">
                <template #title>
                    <h3 class="chart-title">Evolución de Solicitudes y Contenedores</h3>
                </template>
                <template #content>
                    <div class="chart-container" style="height: 350px">
                        <Bar :data="comparativeData" :options="comparativeOptions" />
                    </div>
                </template>
            </Card>

            <!-- Métricas adicionales -->
            <div class="additional-metrics-grid">
                <Card v-for="(metric, index) in additionalMetrics" :key="index" class="metric-card">
                    <template #content>
                        <div class="metric-content">
                            <div class="metric-text">
                                <p class="metric-label">{{ metric.title }}</p>
                                <p class="metric-value">{{ metric.value }}</p>
                            </div>
                            <div class="metric-icon">
                                <i :class="`${metric.icon}`"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Información específica del negocio -->
            <div class="business-info-grid">
                <!-- Estados de solicitudes -->
                <Card class="info-card">
                    <template #title>
                        <h3 class="info-card-title">Estados de Solicitudes</h3>
                    </template>
                    <template #content>
                        <div class="status-list">
                            <div v-for="(status, index) in requestStatuses" :key="index" :class="`status-item status-${status.color}`">
                                <div class="status-info">
                                    <div :class="`status-indicator status-indicator-${status.color}`"></div>
                                    <span class="status-name">{{ status.estado }}</span>
                                </div>
                                <span :class="`status-count status-count-${status.color}`">{{ status.cantidad }}</span>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Navieras más activas -->
                <Card class="info-card">
                    <template #title>
                        <h3 class="info-card-title">Navieras Más Activas</h3>
                    </template>
                    <template #content>
                        <div class="naviera-list">
                            <div v-for="(naviera, index) in topNavieras" :key="index" :class="`naviera-item naviera-${naviera.color}`">
                                <div class="naviera-info">
                                    <h4 class="naviera-name">{{ naviera.nombre }}</h4>
                                    <p class="naviera-requests">{{ naviera.solicitudes }} solicitudes este mes</p>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Footer -->
            <div class="dashboard-footer">
                <p>Última actualización: {{ currentDateTime }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Container principal */
.dashboard-container {
    min-height: 100vh;
    background: var(--surface-ground);
    padding: 1.5rem;
}

.dashboard-content {
    max-width: 90rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Header */
.dashboard-header {
    text-align: center;
    margin-bottom: 2rem;
}

.dashboard-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 0.5rem;
}

.dashboard-subtitle {
    color: var(--text-color-secondary);
    font-size: 1.1rem;
}

/* Grid principal de estadísticas */
.main-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

/* Tarjetas de estadísticas */
.stat-card {
    position: relative;
    overflow: hidden;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.stat-background {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    border-radius: 1rem;
}

.stat-background.stat-blue {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-background.stat-green {
    background: linear-gradient(135deg, #10b981, #059669);
}

.stat-background.stat-purple {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-background.stat-orange {
    background: linear-gradient(135deg, #f97316, #ea580c);
}

.stat-content {
    position: relative;
    padding: 1.5rem;
}

.stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.stat-icon.stat-icon-blue {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-icon.stat-icon-green {
    background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.stat-icon-purple {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.stat-icon-orange {
    background: linear-gradient(135deg, #f97316, #ea580c);
}

.stat-tag {
    font-weight: 600;
    font-size: 0.875rem;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-title {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.stat-value {
    color: var(--text-color);
    font-size: 2rem;
    font-weight: 700;
    animation: countUp 0.5s ease-out;
}

/* Grid de gráficos */
.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
}

/* Tarjetas de gráficos */
.chart-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.chart-card-full {
    grid-column: 1 / -1;
}

.chart-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1rem;
}

.chart-container {
    position: relative;
}

/* Grid de métricas adicionales */
.additional-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

/* Tarjetas de métricas */
.metric-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 0.75rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.metric-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
}

.metric-text {
    display: flex;
    flex-direction: column;
}

.metric-label {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    font-weight: 500;
}

.metric-value {
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 0.25rem;
}

.metric-icon {
    padding: 0.5rem;
    background: var(--surface-hover);
    border-radius: 0.5rem;
    color: var(--text-color-secondary);
    font-size: 1.125rem;
}

/* Grid de información del negocio */
.business-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
}

/* Tarjetas de información */
.info-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.info-card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1rem;
}

/* Lista de estados */
.status-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.status-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.status-item.status-blue {
    background: color-mix(in srgb, #3b82f6 10%, var(--surface-card));
}

.status-item.status-green {
    background: color-mix(in srgb, #10b981 10%, var(--surface-card));
}

.status-item.status-red {
    background: color-mix(in srgb, #ef4444 10%, var(--surface-card));
}

.status-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.status-indicator {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.status-indicator.status-indicator-blue {
    background: #3b82f6;
}

.status-indicator.status-indicator-green {
    background: #10b981;
}

.status-indicator.status-indicator-red {
    background: #ef4444;
}

.status-name {
    font-weight: 500;
    color: var(--text-color);
}

.status-count {
    font-size: 1.25rem;
    font-weight: 700;
}

.status-count.status-count-blue {
    color: #3b82f6;
}

.status-count.status-count-green {
    color: #10b981;
}

.status-count.status-count-red {
    color: #ef4444;
}

/* Lista de navieras */
.naviera-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.naviera-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
    background: var(--surface-hover);
    transition: all 0.3s ease;
}

.naviera-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.naviera-item.naviera-blue {
    border-left-color: #3b82f6;
}

.naviera-item.naviera-green {
    border-left-color: #10b981;
}

.naviera-item.naviera-orange {
    border-left-color: #f97316;
}

.naviera-item.naviera-purple {
    border-left-color: #8b5cf6;
}

.naviera-info {
    display: flex;
    flex-direction: column;
}

.naviera-name {
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.25rem;
}

.naviera-requests {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

.naviera-earnings {
    text-align: right;
}

.naviera-amount {
    font-size: 1.125rem;
    font-weight: 700;
}

.naviera-amount.naviera-amount-blue {
    color: #3b82f6;
}

.naviera-amount.naviera-amount-green {
    color: #10b981;
}

.naviera-amount.naviera-amount-orange {
    color: #f97316;
}

.naviera-amount.naviera-amount-purple {
    color: #8b5cf6;
}

.naviera-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
}

/* Footer */
.dashboard-footer {
    text-align: center;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    margin-top: 2rem;
}

/* Animaciones */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

@keyframes countUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-container {
        padding: 1rem;
    }

    .dashboard-title {
        font-size: 2rem;
    }

    .main-stats-grid {
        grid-template-columns: 1fr;
    }

    .charts-grid {
        grid-template-columns: 1fr;
    }

    .business-info-grid {
        grid-template-columns: 1fr;
    }

    .additional-metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
}

@media (max-width: 480px) {
    .stat-content {
        padding: 1rem;
    }

    .stat-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .naviera-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .naviera-earnings {
        text-align: left;
    }
}
</style>
