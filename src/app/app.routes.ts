import { Routes } from '@angular/router';

import { FormularioProducto } from './components/formulario-producto/formulario-producto';
import { InfoTienda } from './components/info-tienda/info-tienda';

export const routes: Routes = [
  { path: '', redirectTo: 'registro', pathMatch: 'full' },
  { path: 'registro', component: FormularioProducto, title: 'Registro de productos' },
  { path: 'tienda', component: InfoTienda, title: 'Información de la tienda' },
  { path: '**', redirectTo: 'registro' },
];
