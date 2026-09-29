import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { CATEGORIAS, Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';

// Los mismos campos que Producto sin el id, que lo asigna el servicio.
// El null aparece porque un control vacío vale null hasta que el usuario escribe.
type CamposProducto = Omit<Producto, 'id'>;
export type ProductoFormulario = {
  [K in keyof CamposProducto]: CamposProducto[K] | null;
};

const VALORES_INICIALES: ProductoFormulario = {
  nombre: '',
  descripcion: '',
  precio: null,
  categoria: '',
  stock: null,
};

// required no ve los espacios en blanco, esta regla sí
export const textoNoVacio =
  (minimo: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string' || valor.length === 0) {
      return null;
    }

    const largo = valor.trim().length;

    if (largo === 0) {
      return { soloEspacios: true };
    }

    if (largo < minimo) {
      return { minlength: { requiredLength: minimo, actualLength: largo } };
    }

    return null;
  };

const MENSAJES: Record<string, (detalle: Record<string, unknown>) => string> = {
  required: () => 'Este campo es obligatorio.',
  soloEspacios: () => 'No puede contener solo espacios en blanco.',
  minlength: (d) => `Debe tener al menos ${d['requiredLength']} caracteres.`,
  min: (d) => `Debe ser mayor o igual a ${d['min']}.`,
  pattern: () => 'Solo se permiten números enteros no negativos.',
};

@Component({
  selector: 'app-formulario-producto',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-producto.html',
  styleUrl: './formulario-producto.css',
})
export class FormularioProducto {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias: string[] = CATEGORIAS;

  readonly formulario = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.minLength(3), textoNoVacio(3)]),
    descripcion: this.fb.control('', [
      Validators.required,
      Validators.minLength(10),
      textoNoVacio(10),
    ]),
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    categoria: this.fb.control('', [Validators.required]),
    stock: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
  });

  readonly enviando = signal(false);
  readonly mensajeExito = signal('');
  readonly productoRegistrado = signal<Producto | null>(null);

  readonly totalCampos: number = Object.keys(this.formulario.controls).length;

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => this.limpiarTemporizador());
  }

  guardarProducto(): void {
    if (this.formulario.invalid) {
      // sin esto los errores ocultos nunca se ven
      this.formulario.markAllAsTouched();
      this.ocultarMensaje();
      console.warn('[FormularioProducto] Formulario inválido: se muestran los errores pendientes.');
      return;
    }

    this.enviando.set(true);
    this.ocultarMensaje();

    this.productoService
      .registrarProducto(this.construirProducto())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (registrado) => {
          this.enviando.set(false);
          this.productoRegistrado.set(registrado);
          this.mensajeExito.set(
            `¡Producto "${registrado.nombre}" registrado correctamente con el id #${registrado.id}!`,
          );
          console.log('[FormularioProducto] Producto enviado:', registrado);

          this.limpiarTemporizador();
          this.reiniciarControles();
          this.temporizador = setTimeout(() => this.ocultarMensaje(), 6000);
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          console.error('[FormularioProducto] Error al registrar:', error);
          this.mensajeExito.set('No fue posible registrar el producto. Intenta de nuevo.');
        },
      });
  }

  limpiarFormulario(): void {
    this.reiniciarControles();
    this.ocultarMensaje();
  }

  esInvalido(control: AbstractControl | string): boolean {
    const ctl = typeof control === 'string' ? this.control(control) : control;
    return !ctl.valid && (ctl.touched || ctl.dirty);
  }

  erroresDe(nombreCampo: string): string[] {
    const ctl = this.control(nombreCampo);

    if (!ctl.errors || !(ctl.touched || ctl.dirty)) {
      return [];
    }

    return Object.entries(ctl.errors).map(([regla, detalle]) => {
      const mensaje = MENSAJES[regla];
      return mensaje
        ? mensaje((detalle ?? {}) as Record<string, unknown>)
        : `Valor inválido (${regla}).`;
    });
  }

  contarErrores(): number {
    return Object.values(this.formulario.controls).filter((control) => this.esInvalido(control))
      .length;
  }

  contarModificados(): number {
    return Object.values(this.formulario.controls).filter((control) => control.dirty).length;
  }

  contarTocados(): number {
    return Object.values(this.formulario.controls).filter((control) => control.touched).length;
  }

  longitud(nombreCampo: string): number {
    const valor = this.control(nombreCampo).value;
    return typeof valor === 'string' ? valor.length : 0;
  }

  formatoMoneda(valor: number | undefined): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(valor ?? 0);
  }

  private control(nombreCampo: string): AbstractControl {
    return this.formulario.get(nombreCampo) as AbstractControl;
  }

  private construirProducto(): Producto {
    const valores: ProductoFormulario = this.formulario.getRawValue();

    return {
      nombre: (valores.nombre ?? '').trim(),
      descripcion: (valores.descripcion ?? '').trim(),
      precio: Number(valores.precio),
      categoria: valores.categoria ?? '',
      stock: Number(valores.stock),
    };
  }

  private reiniciarControles(): void {
    this.formulario.reset(VALORES_INICIALES);
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  private ocultarMensaje(): void {
    this.limpiarTemporizador();
    this.mensajeExito.set('');
    this.productoRegistrado.set(null);
  }

  private limpiarTemporizador(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = undefined;
    }
  }
}
