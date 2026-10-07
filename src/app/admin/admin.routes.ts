import { Routes } from '@angular/router';
import { systemAdminGuard } from './guards/system-admin.guard';
export const adminRoutes: Routes = [{ path: '', canActivate: [systemAdminGuard], loadComponent: () => import('./layout/admin-shell.component').then((m) => m.AdminShellComponent), children: [
  { path: '', pathMatch: 'full', redirectTo: 'acessos' },
  { path: 'acessos', loadComponent: () => import('./access/access-list-page.component').then((m) => m.AccessListPageComponent), children: [
    { path: 'novo', loadComponent: () => import('./access/access-form.component').then((m) => m.AccessFormComponent) },
    { path: ':id', loadComponent: () => import('./access/access-detail-page.component').then((m) => m.AccessDetailPageComponent) },
  ] },
  { path: 'auditoria', loadComponent: () => import('./audit/audit-page.component').then((m) => m.AuditPageComponent) },
  { path: '**', redirectTo: 'acessos' },
] }];
