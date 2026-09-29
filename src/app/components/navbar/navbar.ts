import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface EnlaceMenu {
  path: string;
  texto: string;
  descripcion: string;
}

@Component({
  selector: 'app-navbar',
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly menuAbierto = signal(false);

  readonly enlaces: EnlaceMenu[] = [
    { path: '/registro', texto: 'Registro', descripcion: 'Formulario reactivo' },
    { path: '/tienda', texto: 'Tienda', descripcion: 'Productos y visión' },
  ];

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
