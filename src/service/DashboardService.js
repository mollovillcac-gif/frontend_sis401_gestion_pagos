import http from '@/plugins/axios';

export class DashboardService {
    static async getDashboardData() {
        try {
            const response = await http.get('/dashboard/data');
            // Si la respuesta está vacía, retorna valores por defecto
            if (!response.data) {
                return {
                    mainStats: {
                        solicitudesHoy: 0,
                        recaudacionHoy: 0,
                        contenedoresHoy: 0,
                        pagosPendientes: 0,
                        changePercentages: {
                            solicitudes: 0,
                            recaudacion: 0,
                            contenedores: 0,
                            pagos: 0
                        }
                    },
                    additionalMetrics: {
                        tasaAprobacion: 0,
                        navierasActivas: 0,
                        tiempoPromedio: 0,
                        satisfaccion: 0
                    },
                    paymentsTrend: [],
                    requestTypeDistribution: {},
                    requestStatusStats: [],
                    topNavieras: []
                };
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Valores por defecto en caso de error
            return {
                mainStats: {
                    solicitudesHoy: 0,
                    recaudacionHoy: 0,
                    contenedoresHoy: 0,
                    pagosPendientes: 0,
                    changePercentages: {
                        solicitudes: 0,
                        recaudacion: 0,
                        contenedores: 0,
                        pagos: 0
                    }
                },
                additionalMetrics: {
                    tasaAprobacion: 0,
                    navierasActivas: 0,
                    tiempoPromedio: 0,
                    satisfaccion: 0
                },
                paymentsTrend: [],
                requestTypeDistribution: {},
                requestStatusStats: [],
                topNavieras: []
            };
        }
    }
}

export default DashboardService;
