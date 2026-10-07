import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminAccessStore } from '../data/admin-access.store';
@Component({ selector: 'app-access-list', imports: [FormsModule, DatePipe, RouterLink, RouterOutlet], styleUrl: '../admin.css', template: `
  <header class="page-heading"><div><p class="eyebrow">ADMINISTRAÇÃO DO SISTEMA</p><h1>Acessos</h1><p>Defina quem pode entrar no Orfina.</p></div><a class="primary button" routerLink="novo">+ Autorizar e-mail</a></header>
  <p aria-live="polite" class="feedback">{{ store.feedback() }}</p>
  <form class="filters" (ngSubmit)="filter()"><label>Buscar nome ou e-mail<input name="search" [(ngModel)]="store.search" maxlength="254" type="search" /></label><label>Acesso<select name="status" [(ngModel)]="store.status"><option value="">Todos</option><option value="ENABLED">Habilitado</option><option value="DISABLED">Desabilitado</option></select></label><label>Primeiro acesso<select name="linked" [(ngModel)]="store.linked"><option value="">Todos</option><option value="yes">Já acessou / vinculado</option><option value="no">Aguardando</option></select></label><button type="submit" [disabled]="store.loading()">Filtrar</button></form>
  @if (store.error()) { <div role="alert" class="error">{{ store.error() }} <button (click)="store.load()">Tentar novamente</button></div> }
  @if (store.loading()) { <p role="status">Carregando acessos…</p> }
  <div class="table-wrap" [attr.aria-busy]="store.loading()"><table><thead><tr><th>Pessoa / e-mail autorizado</th><th>Acesso</th><th>Último login</th><th>Ação</th></tr></thead><tbody>
  @for (grant of store.data().items; track grant.id) { <tr><td data-label="Pessoa"><strong>{{ grant.user?.name || 'Aguardando primeiro acesso' }}</strong><span class="email">{{ grant.email }}</span>@if (grant.user?.systemRole === 'SYSTEM_ADMIN') { <span class="badge admin-badge">Administrador do sistema</span> }</td><td data-label="Acesso"><span class="badge" [class.enabled]="grant.status === 'ENABLED'" [class.disabled]="grant.status === 'DISABLED'">{{ grant.status === 'ENABLED' ? 'Habilitado' : 'Desabilitado' }}</span></td><td data-label="Último login">{{ grant.user?.lastLoginAt ? (grant.user?.lastLoginAt | date:'dd/MM/yyyy HH:mm') : grant.userId ? 'Identidade vinculada' : 'Aguardando' }}</td><td><a [routerLink]="[grant.id]" [attr.aria-label]="'Abrir acesso de ' + grant.email">Abrir</a></td></tr> }
  </tbody></table></div>
  @if (!store.loading() && !store.error() && !store.data().items.length) { <section class="empty"><h2>{{ store.search || store.status || store.linked ? 'Nenhum resultado' : 'Nenhum acesso cadastrado' }}</h2><p>{{ store.search || store.status || store.linked ? 'Ajuste os filtros para encontrar uma autorização.' : 'Autorize o e-mail da primeira pessoa para começar.' }}</p></section> }
  <footer class="pagination"><span>{{ store.data().total }} autorizações · Página {{ store.page }}</span><div><button [disabled]="store.page === 1 || store.loading()" (click)="changePage(-1)">Anterior</button><button [disabled]="store.page * 25 >= store.data().total || store.loading()" (click)="changePage(1)">Próxima</button></div></footer><router-outlet />
` })
export class AccessListPageComponent implements OnInit {
  readonly store = inject(AdminAccessStore);
  ngOnInit() { void this.store.load(); }
  filter() { this.store.page = 1; void this.store.load(); }
  changePage(delta: number) { this.store.page += delta; void this.store.load(); }
}
