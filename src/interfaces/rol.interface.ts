export interface Rol {
    id?: number;
    usuarioId: number; // Agregado para auditoría
    nombre?: string;
    descripcion?: string;
    activo?: boolean;
}
