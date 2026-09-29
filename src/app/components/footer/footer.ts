import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const PROYECTO = 'Sistema de Registro de Productos - Actividad 2';
const PROGRAMA = 'Tokyo-3';
const AUTOR = 'Jorge Alvarez';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly anioActual: number = new Date().getFullYear();
  readonly proyecto: string = PROYECTO;
  readonly programa: string = PROGRAMA;
  readonly autor: string = AUTOR;
}
