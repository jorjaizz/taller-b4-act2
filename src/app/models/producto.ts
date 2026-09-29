export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
}

export const CATEGORIAS: string[] = [
  'Tecnología',
  'Ropa',
  'Alimentos',
  'Hogar',
  'Deportes',
  'Libros',
  'Salud',
  'Otros',
];
