# Sistema de Registro de Productos — Actividad 2

**Autor:** Jorge Alvarez · **Programa:** Tokyo-3

Aplicación Angular 22 (standalone) que registra productos en un formulario reactivo y los
muestra en una tienda. Tema visual inspirado en Evangelion / NERV.

## Comandos

```bash
npm install       # instala las dependencias
npm start         # servidor de desarrollo en http://localhost:4200/
npm run build     # build de producción en dist/
npm test          # pruebas unitarias con Karma + Jasmine
```

## Modelo de datos

Definido en `src/app/models/producto.ts`:

```ts
export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
}
```

El `id` es opcional porque lo asigna el servicio al guardar. Las categorías disponibles están en
la constante `CATEGORIAS`.

## Formulario reactivo

`src/app/components/formulario-producto/` crea el grupo con `FormBuilder` y lo tipa contra el
modelo mediante `ProductoFormulario`, que replica los campos de `Producto` sin el `id` y admite
`null` en cada control (un campo vacío vale `null`).

| Campo         | Control    | Validaciones                                                 |
| ------------- | ---------- | ------------------------------------------------------------ |
| `nombre`      | `input`    | `required`, `minLength(3)`, validador de espacios en blanco  |
| `descripcion` | `textarea` | `required`, `minLength(10)`, validador de espacios en blanco |
| `precio`      | `input`    | `required`, `min(0.01)`                                      |
| `stock`       | `input`    | `required`, `min(0)`, solo enteros no negativos              |
| `categoria`   | `select`   | `required`                                                   |

`Validators.required` considera válido un texto con puros espacios, por eso se suma el validador
`textoNoVacio(minimo)`, que también recorta antes de medir el largo mínimo.

Al enviar se llama `markAllAsTouched()` para que los errores de los campos que el usuario no
tocó se vuelvan visibles, y se aborta el registro si el formulario sigue inválido.

## Directivas de control de flujo

- `*ngIf` en las listas de errores (`erroresDe(campo).length > 0`), en el mensaje de éxito, en la
  alerta general de errores y en el estado vacío de la tienda.
- `*ngFor` para pintar cada mensaje de error de un campo, las categorías del `select`, los
  productos de la tienda y los valores del aside.

## Servicio

`ProductoService` es el único dueño de los datos:

1. `registrarProducto()` valida que no falte ningún campo y que los textos no estén en blanco.
2. Devuelve un `Observable` con `delay(600)` para simular la latencia de un backend.
3. Asigna el `id`, agrega el producto al inicio del arreglo en memoria y publica el nuevo listado
   por el `BehaviorSubject` que expone `obtenerProductos()`.

`InfoTienda` consume ese listado con `toSignal`, así que la tarjeta de productos se actualiza
sola cuando el formulario registra algo.

Los productos viven **solo en memoria**: al recargar la página el listado vuelve a estar vacío.

## Pruebas

29 pruebas unitarias en 6 archivos (`ng test`) cubren el ciclo de vida del componente, las
validaciones del formulario, el renderizado de errores, la interacción con el servicio, el
formateo de moneda, el listado de la tienda, el navbar y el año del footer.
