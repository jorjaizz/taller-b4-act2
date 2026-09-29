import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-info-tienda',
  imports: [CommonModule],
  templateUrl: './info-tienda.html',
  styleUrl: './info-tienda.css',
})
export class InfoTienda {
  private readonly productoService = inject(ProductoService);

  /** Productos registrados, obtenidos desde el `ProductoService`. */
  readonly productos = toSignal(this.productoService.obtenerProductos(), {
    initialValue: [] as Producto[],
  });

  /** Valor total del inventario registrado. */
  readonly valorInventario = computed(() =>
    this.productos().reduce((total, producto) => total + producto.precio * producto.stock, 0),
  );

  /** Número total de unidades en stock. */
  readonly unidadesTotales = computed(() =>
    this.productos().reduce((total, producto) => total + producto.stock, 0),
  );

  /** Categorías distintas presentes en el inventario. */
  readonly categoriasUsadas = computed(
    () => new Set(this.productos().map((producto) => producto.categoria)).size,
  );

  readonly caracteristicas: string[] = [
    'Catálogo digital con inventario siempre actualizado',
    'Registro de productos con validación en tiempo real',
    'Categorización clara para una búsqueda más rápida',
    'Panel de métricas con valor total del inventario',
  ];

  readonly valores: string[] = ['Innovación', 'Confianza', 'Calidad', 'Cercanía'];

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(valor);
  }

  numero(valor: number): string {
    return new Intl.NumberFormat('es-CO').format(valor);
  }
}
