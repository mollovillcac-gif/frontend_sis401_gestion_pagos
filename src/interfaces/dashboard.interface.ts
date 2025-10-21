export interface DashboardStats {
    title: string;
    value: string;
    change: string;
    icon: string;
    gradient: string;
}

export interface AdditionalMetric {
    title: string;
    value: string;
    icon: string;
}

export interface PaymentData {
    mes: string;
    recaudacion: number;
    solicitudes: number;
    contenedores: number;
}

export interface RequestStatus {
    estado: string;
    cantidad: number;
    color: string;
    bgColor: string;
}

export interface NavieraActivity {
    nombre: string;
    solicitudes: number;
    recaudacion: number;
    color: string;
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointBorderWidth?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
    borderRadius?: number;
    borderSkipped?: boolean | string;
    hoverOffset?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartOptions {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
        legend: {
            display?: boolean;
            position?: string;
            labels?: {
                padding?: number;
                usePointStyle?: boolean;
                color?: string;
            };
        };
        tooltip: {
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors?: boolean;
        };
    };
    scales?: {
        y: {
            beginAtZero: boolean;
            grid: {
                color: string;
            };
            ticks: {
                color: string;
                callback?: (value: any) => string;
            };
        };
        x: {
            grid: {
                display: boolean;
            };
            ticks: {
                color: string;
            };
        };
    };
    cutout?: string;
}
