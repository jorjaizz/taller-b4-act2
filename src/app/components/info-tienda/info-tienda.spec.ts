import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { InfoTienda } from './info-tienda';
import { ProductoService } from '../../services/producto.service';

describe('InfoTienda', () => {
  let component: InfoTienda;
  let fixture: ComponentFixture<InfoTienda>;
  let productoService: ProductoService;

  const producto = {
    nombre: 'Teclado mecánico',
    descripcion: 'Teclado mecánico con switches hot-swap y retroiluminación.',
    precio: 250000,
    categoria: 'Tecnología',
    stock: 12,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTienda],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTienda);
    component = fixture.componentInstance;
    productoService = TestBed.inject(ProductoService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el estado vacío cuando no hay productos', () => {
    expect(component.productos()).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.vacio')).toBeTruthy();
  });

  it('debe listar los productos obtenidos del ProductoService', async () => {
    await firstValueFrom(productoService.registrarProducto({ ...producto }));
    fixture.detectChanges();

    expect(component.productos().length).toBe(1);
    expect(component.unidadesTotales()).toBe(12);
    expect(component.valorInventario()).toBe(3000000);
    expect(component.categoriasUsadas()).toBe(1);

    const compiled = fixture.nativeElement as HTMLElement;
    const tarjetas = compiled.querySelectorAll('.tarjeta');
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].textContent).toContain('Teclado mecánico');
    expect(compiled.querySelector('.vacio')).toBeNull();
  });
});
