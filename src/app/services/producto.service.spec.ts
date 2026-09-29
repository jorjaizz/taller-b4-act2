import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Producto } from '../models/producto';
import { ProductoService } from './producto.service';

describe('ProductoService', () => {
  let service: ProductoService;

  const productoValido: Producto = {
    nombre: 'Audífonos Bluetooth',
    descripcion: 'Audífonos inalámbricos con cancelación de ruido activa.',
    precio: 129.9,
    categoria: 'Tecnología',
    stock: 25,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe registrar un producto y asignarle un id', async () => {
    const producto = await firstValueFrom(service.registrarProducto({ ...productoValido }));

    expect(producto.id).toBe(1);
    expect(producto.nombre).toBe('Audífonos Bluetooth');
    expect(producto.precio).toBe(129.9);
  });

  it('debe devolver los productos registrados mediante obtenerProductos()', async () => {
    await firstValueFrom(service.registrarProducto({ ...productoValido }));

    const productos = await firstValueFrom(service.obtenerProductos());

    expect(productos.length).toBe(1);
    expect(productos[0].categoria).toBe('Tecnología');
  });

  it('debe acumular los productos en el arreglo en memoria', async () => {
    await firstValueFrom(service.registrarProducto({ ...productoValido }));
    await firstValueFrom(service.registrarProducto({ ...productoValido, nombre: 'Mouse óptico' }));

    const productos = await firstValueFrom(service.obtenerProductos());

    expect(productos.length).toBe(2);
    expect(productos[0].id).toBe(2);
    expect(productos[1].nombre).toBe('Audífonos Bluetooth');
  });

  it('debe rechazar un objeto que no sea un producto válido', () => {
    expect(() =>
      service.registrarProducto({
        ...productoValido,
        nombre: undefined as unknown as string,
      }),
    ).toThrowError(/faltan los campos obligatorios/);
  });

  it('debe rechazar textos compuestos solo por espacios', () => {
    expect(() => service.registrarProducto({ ...productoValido, nombre: '    ' })).toThrowError(
      /no pueden contener solo espacios/,
    );
  });
});
