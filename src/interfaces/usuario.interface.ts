export interface Usuario {
    id?: number;
    usuario?: string;
    nombre?: string;
    apellido?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
    clave?: string;
    activo?: boolean;
    rolId?: number;
    ultimoLogin?: Date;
    fechaCreacion?: string;
    fechaModificacion?: string;
    rol?: {
        id?: number;
    };
}
