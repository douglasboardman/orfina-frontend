import { Routes } from '@angular/router';
import { WorkspaceRouteComponent } from './workspace-route.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'visao-geral' },
  { path: 'auth/callback', component: WorkspaceRouteComponent, data: { view: 'overview' } },
  { path: 'visao-geral', component: WorkspaceRouteComponent, data: { view: 'overview' } },
  { path: 'contas', component: WorkspaceRouteComponent, data: { view: 'accounts' } },
  { path: 'cartoes', component: WorkspaceRouteComponent, data: { view: 'cards' } },
  { path: 'recorrencias', component: WorkspaceRouteComponent, data: { view: 'recurrences' } },
  { path: 'lancamentos', component: WorkspaceRouteComponent, data: { view: 'transactions' } },
  { path: 'categorias', component: WorkspaceRouteComponent, data: { view: 'categories' } },
  { path: '**', redirectTo: 'visao-geral' },
];
