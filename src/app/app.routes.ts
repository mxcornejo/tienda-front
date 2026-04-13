import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./pages/recuperar-password/recuperar-password').then(
        (m) => m.RecuperarPasswordComponent,
      ),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.CatalogoComponent),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle').then((m) => m.ProductoDetalleComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'mis-compras',
    loadComponent: () =>
      import('./pages/mis-compras/mis-compras').then((m) => m.MisComprasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pago-exitoso',
    loadComponent: () =>
      import('./pages/pago-exitoso/pago-exitoso').then((m) => m.PagoExitosoComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/productos',
    loadComponent: () =>
      import('./pages/admin/admin-productos/admin-productos').then(
        (m) => m.AdminProductosComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/usuarios',
    loadComponent: () =>
      import('./pages/admin/admin-usuarios/admin-usuarios').then((m) => m.AdminUsuariosComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/pedidos',
    loadComponent: () =>
      import('./pages/admin/admin-pedidos/admin-pedidos').then((m) => m.AdminPedidosComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/catalogo' },
];
