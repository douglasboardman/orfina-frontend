import { Routes } from '@angular/router';
const workspacePage = () => import('./workspace-page.component').then((module) => module.WorkspacePageComponent);

export const productRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'visao-geral' },
  { path: 'auth/callback', loadComponent: workspacePage, data: { view: 'overview' } },
  { path: 'visao-geral', loadComponent: workspacePage, data: { view: 'overview' } },
  { path: 'contas', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'accounts' } },
  { path: 'contas/nova', loadComponent: workspacePage, data: { view: 'accounts', action: 'create' } },
  { path: 'contas/:id/editar', loadComponent: workspacePage, data: { view: 'accounts', action: 'edit' } },
  { path: 'cartoes', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'cards' } },
  { path: 'cartoes/novo', loadComponent: workspacePage, data: { view: 'cards', action: 'create' } },
  { path: 'cartoes/parcelamentos/nova', loadComponent: workspacePage, data: { view: 'cards', action: 'installment' } },
  { path: 'cartoes/faturas/:cardId/:statementId', loadComponent: workspacePage, data: { view: 'cards', action: 'statement-detail' } },
  { path: 'cartoes/:id/editar', loadComponent: workspacePage, data: { view: 'cards', action: 'edit' } },
  { path: 'recorrencias', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'recurrences' } },
  { path: 'recorrencias/nova', loadComponent: workspacePage, data: { view: 'recurrences', action: 'create' } },
  { path: 'orcamento', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'budget' } },
  { path: 'orcamento/novo-limite', loadComponent: workspacePage, data: { view: 'budget', action: 'create' } },
  { path: 'metas', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'goals' } },
  { path: 'metas/nova', loadComponent: workspacePage, data: { view: 'goals', action: 'create' } },
  { path: 'lancamentos', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'transactions' } },
  { path: 'lancamentos/novo', loadComponent: workspacePage, data: { view: 'transactions', action: 'create' } },
  { path: 'lancamentos/:id/editar', loadComponent: workspacePage, data: { view: 'transactions', action: 'edit' } },
  { path: 'transferencias', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'transfers' } },
  { path: 'transferencias/nova', loadComponent: workspacePage, data: { view: 'transfers', action: 'create' } },
  { path: 'importacoes', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'imports' } },
  { path: 'importacoes/nova', loadComponent: workspacePage, data: { view: 'imports', action: 'create' } },
  { path: 'categorias', pathMatch: 'full', loadComponent: workspacePage, data: { view: 'categories' } },
  { path: 'categorias/nova', loadComponent: workspacePage, data: { view: 'categories', action: 'create' } },
  { path: 'categorias/subcategorias/:id/editar', loadComponent: workspacePage, data: { view: 'categories', action: 'edit-subcategory' } },
  { path: 'categorias/subcategorias/nova', loadComponent: workspacePage, data: { view: 'categories', action: 'create-subcategory' } },
  { path: 'categorias/:id/editar', loadComponent: workspacePage, data: { view: 'categories', action: 'edit' } },
  { path: 'configuracoes/perfil', loadComponent: workspacePage, data: { view: 'profile' } },
  { path: 'configuracoes/grupo', loadComponent: workspacePage, data: { view: 'group' } },
  { path: '**', redirectTo: 'visao-geral' },
];

export const appRoutes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((module) => module.adminRoutes) },
  { path: 'erro-conexao', data: { connectionError: true }, loadComponent: () => import('./admin/access-restricted.component').then((module) => module.AccessRestrictedComponent) },
  { path: 'acesso-restrito', loadComponent: () => import('./admin/access-restricted.component').then((module) => module.AccessRestrictedComponent) },
  { path: '', loadComponent: () => import('./product-shell.component').then((module) => module.ProductShellComponent), children: productRoutes },
];
