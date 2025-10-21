export interface Solicitud {
    id?: number;
    bl: string;
    contenedor: string;
    documento: string;
    tipoDocumento: string;
    naviera?: {
        id: number;
        nombre: string;
    };
    navieraId: number;
    tipo: string;
    totalFinalBs: number;
    montoBase?: number;
    comisionPorcentaje?: number;
    comisionMonto?: number;
    tipoCambioUsado?: number;
    detalleCalculo?: string;
    estado: string;
    comprobantePago?: string;
    factura?: string;
    usuario?: {
        id: number;
        usuario: string;
        nombre: string;
        apellido: string;
    };
    creadoEn?: string;
    actualizadoEn?: string;
    monto?: number;
    totalFinal?: number;
}

export interface EstadisticasSolicitudes {
    total: number;
    pendientes: number;
    subidos: number;
    verificadas: number;
    pagadas: number;
    anuladas: number;
}
