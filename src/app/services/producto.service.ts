import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private productos: Producto[] = [];
  private readonly productosSubject = new BehaviorSubject<Producto[]>([]);
  private siguienteId = 1;

  registrarProducto(producto: Producto): Observable<Producto> {
    this.validarProducto(producto);

    console.log('[ProductoService] Producto recibido del formulario:', producto);
    console.log('[ProductoService] Campos recibidos:', Object.keys(producto).join(', '));

    // los 600 ms simulan la latencia del backend
    return of(producto).pipe(
      delay(600),
      map((datos) => this.guardarEnMemoria(datos)),
    );
  }

  obtenerProductos(): Observable<Producto[]> {
    console.log('[ProductoService] Solicitando listado de productos');
    return this.productosSubject.asObservable();
  }

  private guardarEnMemoria(producto: Producto): Producto {
    const productoGuardado: Producto = {
      ...producto,
      id: this.siguienteId++,
    };

    this.productos = [productoGuardado, ...this.productos];
    this.productosSubject.next([...this.productos]);

    console.log(
      `[ProductoService] Producto registrado con id #${productoGuardado.id}. Total: ${this.productos.length}`,
    );
    console.table([productoGuardado]);

    return productoGuardado;
  }

  private validarProducto(producto: Producto): void {
    if (!producto || typeof producto !== 'object') {
      throw new Error('[ProductoService] Error: no se recibió un objeto producto válido.');
    }

    const camposRequeridos: (keyof Producto)[] = [
      'nombre',
      'descripcion',
      'precio',
      'categoria',
      'stock',
    ];

    const camposFaltantes = camposRequeridos.filter(
      (campo) => producto[campo] === null || producto[campo] === undefined,
    );

    if (camposFaltantes.length > 0) {
      throw new Error(
        `[ProductoService] Error: faltan los campos obligatorios -> ${camposFaltantes.join(', ')}`,
      );
    }

    // un texto de puros espacios se trata como información vacía
    const camposEnBlanco = (['nombre', 'descripcion'] as const).filter(
      (campo) => typeof producto[campo] === 'string' && (producto[campo] as string).trim() === '',
    );

    if (camposEnBlanco.length > 0) {
      throw new Error(
        `[ProductoService] Error: los campos ${camposEnBlanco.join(', ')} no pueden contener solo espacios.`,
      );
    }
  }
}
