import { ref, computed } from 'vue';
import DashboardService from '@/service/DashboardService';

export function useDashboard() {
    const loading = ref(false);
    const error = ref(null);

    // Estados reactivos para los datos
    const mainStats = ref([]);

    const additionalMetrics = ref([]);
    // Formatters para los datos del backend
    const formatMainStats = (data) => [
        {
            title: 'Solicitudes Hoy',
            value: (data.solicitudesHoy ?? 0).toString(),
            change: `${data.changePercentages?.solicitudes > 0 ? '+' : ''}${data.changePercentages?.solicitudes ?? 0}%`,
            icon: 'pi pi-file-o',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Pagos Recibidos Hoy',
            value: `Bs. ${(data.pagosRecibidos ?? 0).toLocaleString()}`,
            change: '',
            icon: 'pi pi-dollar',
            gradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Solicitudes Listas para Revisión',
            value: (data.listasRevision ?? 0).toString(),
            change: '',
            icon: 'pi pi-eye',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Solicitudes Pendientes',
            value: (data.solicitudesPendientes ?? 0).toString(),
            change: '',
            icon: 'pi pi-clock',
            gradient: 'from-orange-500 to-orange-600'
        }
    ];

    const formatAdditionalMetrics = (data) => [
        { title: 'Tasa Aprobación', value: `${data.tasaAprobacion ?? 0}%`, icon: 'pi pi-check-circle' },
        { title: 'Navieras Activas', value: `${data.navierasActivas ?? 0}`, icon: 'pi pi-building' }
    ];

    const paymentsData = ref([
        { mes: 'Ene', recaudacion: 125000, solicitudes: 245, contenedores: 180 },
        { mes: 'Feb', recaudacion: 148000, solicitudes: 298, contenedores: 220 },
        { mes: 'Mar', recaudacion: 142000, solicitudes: 315, contenedores: 285 },
        { mes: 'Abr', recaudacion: 167000, solicitudes: 387, contenedores: 340 },
        { mes: 'May', recaudacion: 195000, solicitudes: 432, contenedores: 398 },
        { mes: 'Jun', recaudacion: 178000, solicitudes: 456, contenedores: 412 }
    ]);

    const requestStatuses = ref([
        { estado: 'Pendientes', cantidad: 23, color: 'blue-600', bgColor: 'blue-50' },
        { estado: 'Verificadas', cantidad: 189, color: 'green-600', bgColor: 'green-50' },
        { estado: 'Pagadas', cantidad: 167, color: 'emerald-600', bgColor: 'emerald-50' },
        { estado: 'Anuladas', cantidad: 8, color: 'red-600', bgColor: 'red-50' }
    ]);

    const topNavieras = ref([
        { nombre: 'MAERSK LINE', solicitudes: 56, recaudacion: 78400, color: 'blue-600' },
        { nombre: 'HAMBURG SÜD', solicitudes: 42, recaudacion: 65200, color: 'green-600' },
        { nombre: 'MSC', solicitudes: 38, recaudacion: 52800, color: 'purple-600' },
        { nombre: 'HAPAG-LLOYD', solicitudes: 31, recaudacion: 41600, color: 'orange-600' }
    ]);

    // Configuraciones de gráficos computadas
    const paymentsLineData = computed(() => {
        // Usar los datos reales del backend para pagos y solicitudes por mes
        const data = paymentsData.value;
        return {
            labels: data.map((item) => item.mes),
            datasets: [
                {
                    label: 'Pagos Recibidos (Bs.)',
                    data: data.map((item) => item.recaudacion),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Solicitudes',
                    data: data.map((item) => item.solicitudes),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        };
    });

    const requestTypeDistributionData = computed(() => {
        // Usar los datos reales del backend
        const dist = dashboardData.value?.requestTypeDistribution || {};
        const labels = Object.keys(dist);
        const data = labels.map((tipo) => dist[tipo]);
        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0,
                    hoverOffset: 10
                }
            ]
        };
    });
    // Estado reactivo para los datos crudos del dashboard
    const dashboardData = ref({});

    const comparativeData = computed(() => ({
        labels: paymentsData.value.map((item) => item.mes),
        datasets: [
            {
                label: 'Solicitudes',
                data: paymentsData.value.map((item) => item.solicitudes),
                backgroundColor: '#3B82F6',
                borderRadius: 6,
                borderSkipped: false
            },
            {
                label: 'Pagos Recibidos (Bs.)',
                data: paymentsData.value.map((item) => item.recaudacion),
                backgroundColor: '#10B981',
                borderRadius: 6,
                borderSkipped: false
            }
        ]
    }));

    // Función para cargar datos del servidor
    const loadDashboardData = async () => {
        loading.value = true;
        error.value = null;
        try {
            const data = await DashboardService.getDashboardData();
            dashboardData.value = data;
            mainStats.value = formatMainStats(data.mainStats);
            additionalMetrics.value = formatAdditionalMetrics(data.additionalMetrics);
            paymentsData.value = data.paymentsTrend || [];
            requestStatuses.value = formatRequestStatuses(data.requestStatusStats || []);
            topNavieras.value = formatTopNavieras(data.topNavieras || []);
        } catch (err) {
            error.value = 'Error al cargar datos del dashboard';
            console.error('Dashboard loading error:', err);
        } finally {
            loading.value = false;
        }
    };

    // Función para refrescar datos
    const refreshData = () => {
        loadDashboardData();
    };

    // (Eliminadas las declaraciones duplicadas de formatMainStats y formatAdditionalMetrics)

    const formatRequestStatuses = (data) =>
        (data || []).map((item) => ({
            estado: item.estado || '',
            cantidad: item.cantidad ?? 0,
            color: item.color || 'blue-600',
            bgColor: item.bgColor || 'blue-50'
        }));

    const formatTopNavieras = (data) =>
        (data || []).map((item) => ({
            nombre: item.nombre || '',
            solicitudes: item.solicitudes ?? 0,
            recaudacion: item.recaudacion ?? 0,
            color: item.color || 'blue-600'
        }));

    // Opciones de gráficos
    const salesLineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F3F4F6'
                },
                ticks: {
                    color: '#6B7280',
                    callback: function (value) {
                        return 'Bs. ' + value.toLocaleString();
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280'
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: '#374151'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                cornerRadius: 12
            }
        },
        cutout: '60%'
    };

    const comparativeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: '#374151'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                cornerRadius: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F3F4F6'
                },
                ticks: {
                    color: '#6B7280'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280'
                }
            }
        }
    };

    return {
        // Estados
        loading,
        error,
        mainStats,
        additionalMetrics,
        paymentsData,
        requestStatuses,
        topNavieras,

        // Datos computados
        paymentsLineData,
        requestTypeDistributionData,
        comparativeData,

        // Opciones de gráficos
        salesLineOptions,
        doughnutOptions,
        comparativeOptions,

        // Métodos
        loadDashboardData,
        refreshData
    };
}
