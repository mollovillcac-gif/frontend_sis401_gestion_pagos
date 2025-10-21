import { Ingrediente } from './ingrediente.interface';
import { Categoria } from './naviera.interface';

export interface Producto {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precioVenta: number;
    stock: number;
    esEspecialidad: boolean;
    activo: boolean;
    idCategoria: number;
    categoria?: Categoria;
    productoIngredientes?: Ingrediente[];
}
