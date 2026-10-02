import { Routes } from '@angular/router';
import { WorkspaceRouteComponent } from './workspace-route.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'visao-geral' },
  { path: 'auth/callback', component: WorkspaceRouteComponent, data: { view: 'overview' } },
  { path: 'visao-geral', component: WorkspaceRouteComponent, data: { view: 'overview' } },
  { path: 'contas', component: WorkspaceRouteComponent, data: { view: 'accounts' } },
  { path: 'cartoes', component: WorkspaceRouteComponent, data: { view: 'cards' } },
  { path: 'recorrencias', component: WorkspaceRouteComponent, data: { view: 'recurrences' } },
  { path: 'orcamento', component: WorkspaceRouteComponent, data: { view: 'budget' } },
  { path: 'metas', component: WorkspaceRouteComponent, data: { view: 'goals' } },
  { path: 'lancamentos', component: WorkspaceRouteComponent, data: { view: 'transactions' } },
  { path: 'transferencias', component: WorkspaceRouteComponent, data: { view: 'transfers' } },
  { path: 'importacoes', component: WorkspaceRouteComponent, data: { view: 'imports' } },
  { path: 'categorias', component: WorkspaceRouteComponent, data: { view: 'categories' } },
  { path: '**', redirectTo: 'visao-geral' },
];
