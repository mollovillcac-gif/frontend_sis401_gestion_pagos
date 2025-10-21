export interface Tarifa {
    id?: number;
    navieraId?: number;
    naviera?: {
        id: number;
        nombre: string;
    };
    montoBase?: number;
    activo?: boolean;
}
