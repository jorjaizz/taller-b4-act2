import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { FormularioProducto } from './formulario-producto';
import { ProductoService } from '../../services/producto.service';

describe('FormularioProducto', () => {
  let component: FormularioProducto;
  let fixture: ComponentFixture<FormularioProducto>;
  let productoService: ProductoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioProducto);
    component = fixture.componentInstance;
    productoService = TestBed.inject(ProductoService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el estado inválido y contar los campos tocados y modificados', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.chip-error')?.textContent).toContain('inválido');
    expect(compiled.querySelector('.estado-dato')).toBeNull();

    const { nombre } = component.formulario.controls;
    nombre.setValue('ab');
    nombre.markAsTouched();
    nombre.markAsDirty();
    fixture.detectChanges();

    expect(component.contarTocados()).toBe(1);
    expect(component.contarModificados()).toBe(1);
    expect(compiled.querySelector('.estado-dato')?.textContent).toContain('tocados: 1/5');
  });

  it('debe crear un control por cada campo solicitado', () => {
    expect(Object.keys(component.formulario.controls).sort()).toEqual([
      'categoria',
      'descripcion',
      'nombre',
      'precio',
      'stock',
    ]);
  });

  it('debe marcar el formulario como inválido cuando está vacío', () => {
    expect(component.formulario.invalid).toBe(true);
  });

  it('debe validar el mínimo de caracteres de nombre y descripción', () => {
    const { nombre, descripcion } = component.formulario.controls;

    nombre.setValue('ab');
    descripcion.setValue('corta');
    expect(nombre.hasError('minlength')).toBe(true);
    expect(descripcion.hasError('minlength')).toBe(true);

    nombre.setValue('Teclado mecánico');
    descripcion.setValue('Teclado mecánico con switches hot-swap.');
    expect(nombre.valid).toBe(true);
    expect(descripcion.valid).toBe(true);
  });

  it('debe exigir un precio mayor a 0 y un stock no negativo', () => {
    const { precio, stock } = component.formulario.controls;

    precio.setValue(0);
    stock.setValue(-3);
    expect(precio.hasError('min')).toBe(true);
    expect(stock.hasError('min')).toBe(true);

    precio.setValue(49.9);
    stock.setValue(10);
    expect(precio.valid).toBe(true);
    expect(stock.valid).toBe(true);
  });

  it('no debe mostrar errores si el control no fue manipulado', () => {
    expect(component.erroresDe('nombre')).toEqual([]);
    expect(component.esInvalido('nombre')).toBe(false);
  });

  it('debe listar los errores del control después de markAllAsTouched()', () => {
    component.guardarProducto();
    fixture.detectChanges();

    expect(component.formulario.controls.nombre.touched).toBe(true);
    expect(component.erroresDe('nombre')).toContain('Este campo es obligatorio.');
    expect(component.erroresDe('categoria')).toContain('Este campo es obligatorio.');
    expect(component.contarErrores()).toBe(5);

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.errores li');
    expect(items.length).toBeGreaterThanOrEqual(5);
    expect(compiled.querySelectorAll('.campo-invalido').length).toBe(5);
    expect(compiled.querySelector('.alerta-error-general')?.textContent).toContain('5');
  });

  it('debe rechazar un nombre o descripción compuesto solo por espacios', () => {
    const { nombre, descripcion } = component.formulario.controls;

    nombre.setValue('             ');
    descripcion.setValue('          ');

    expect(nombre.hasError('soloEspacios')).toBe(true);
    expect(descripcion.hasError('soloEspacios')).toBe(true);
    expect(component.formulario.invalid).toBe(true);

    nombre.markAsTouched();
    expect(component.erroresDe('nombre')).toContain('No puede contener solo espacios en blanco.');
  });

  it('debe contar los caracteres reales al validar el largo mínimo', () => {
    const nombre = component.formulario.controls.nombre;

    nombre.setValue('  ab  ');
    expect(nombre.hasError('minlength')).toBe(true);
    expect(nombre.getError('minlength')).toEqual({
      requiredLength: 3,
      actualLength: 2,
    });

    nombre.setValue('  abc  ');
    expect(nombre.valid).toBe(true);
  });

  it('no debe enviar el producto si el nombre solo tiene espacios', () => {
    component.formulario.setValue({
      nombre: '   ',
      descripcion: 'Producto de prueba con descripción válida.',
      precio: 1000,
      categoria: 'Otros',
      stock: 3,
    });

    component.guardarProducto();

    expect(component.formulario.invalid).toBe(true);
    expect(component.enviando()).toBe(false);
    expect(component.mensajeExito()).toBe('');
  });

  it('debe registrar el producto, mostrar el éxito y limpiar el formulario', async () => {
    component.formulario.setValue({
      nombre: 'Audífonos Bluetooth',
      descripcion: 'Audífonos inalámbricos con cancelación de ruido.',
      precio: 129.9,
      categoria: 'Tecnología',
      stock: 25,
    });

    component.guardarProducto();

    expect(component.enviando()).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(component.enviando()).toBe(false);
    expect(component.mensajeExito()).toContain('registrado correctamente');
    expect(component.formulario.pristine).toBe(true);
    expect(component.formulario.getRawValue().nombre).toBe('');

    const productos = await firstValueFrom(productoService.obtenerProductos());
    expect(productos.length).toBe(1);
    expect(productos[0].nombre).toBe('Audífonos Bluetooth');
  });
});
