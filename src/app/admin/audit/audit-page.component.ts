import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AuditEntry, Page, auditActionLabel } from '../data/admin-api.service';
@Component({ selector: 'app-audit-page', imports: [FormsModule, DatePipe, JsonPipe], styleUrl: '../admin.css', template: `
  <header class="page-heading"><div><p class="eyebrow">ADMINISTRAÇÃO DO SISTEMA</p><h1>Auditoria</h1><p>Histórico de decisões sobre acesso à plataforma.</p></div></header>
  <form class="filters" (ngSubmit)="filter()"><label>Desde<input type="date" name="from" [(ngModel)]="from" /></label><label>Até<input type="date" name="to" [(ngModel)]="to" /></label><label>Ação<select name="action" [(ngModel)]="action"><option value="">Todas</option><option value="ACCESS_GRANTED">Acesso autorizado</option><option value="ACCESS_LINKED">Identidade vinculada</option><option value="ACCESS_DISABLED">Acesso desabilitado</option><option value="ACCESS_ENABLED">Acesso habilitado</option><option value="SESSIONS_REVOKED">Sessões encerradas</option><option value="ADMIN_BOOTSTRAPPED">Administrador inicial criado</option><option value="ADMIN_RECOVERED">Acesso administrativo recuperado</option></select></label><label>Ator (ID)<input name="actor" [(ngModel)]="actor" maxlength="100" /></label><button [disabled]="loading()">Filtrar</button></form>
  @if (loading()) { <p role="status">Carregando auditoria…</p> }@if (error()) { <p role="alert" class="error">{{ error() }} <button (click)="load()">Tentar novamente</button></p> }
  @for (entry of data().items; track entry.id) { <article class="audit-entry"><header><strong>{{ actionLabel(entry.action) }}</strong><small>{{ entry.createdAt | date:'dd/MM/yyyy HH:mm' }}</small></header><p>Ator: {{ entry.actorUserId || 'Operador CLI' }} · Alvo: {{ entry.targetId }}</p>@if (entry.reason) { <p>{{ entry.reason }}</p> }<details><summary>Ver mudanças</summary><pre>{{ entry.changes | json }}</pre></details></article> }@empty { @if (!loading() && !error()) { <p class="empty">Nenhum evento encontrado no período.</p> } }
  <footer class="pagination"><span>{{ data().total }} eventos · Página {{ page }}</span><div><button [disabled]="page === 1 || loading()" (click)="changePage(-1)">Anterior</button><button [disabled]="page * 25 >= data().total || loading()" (click)="changePage(1)">Próxima</button></div></footer>
` })
export class AuditPageComponent implements OnInit {
  readonly actionLabel = auditActionLabel;
  private readonly api = inject(AdminApiService); readonly data = signal<Page<AuditEntry>>({ items: [], total: 0, page: 1, pageSize: 25 }); readonly error = signal(''); readonly loading = signal(false);
  page = 1; from = ''; to = ''; action = ''; actor = '';
  ngOnInit() { void this.load(); }
  filter() { this.page = 1; void this.load(); }
  changePage(delta: number) { this.page += delta; void this.load(); }
  async load() { this.loading.set(true); this.error.set(''); try { this.data.set(await this.api.audit({ page: this.page, pageSize: 25, action: this.action, actorUserId: this.actor,
    from: this.from ? new Date(this.from + 'T00:00:00').toISOString() : '', to: this.to ? new Date(this.to + 'T23:59:59.999').toISOString() : '' })); } catch (error: unknown) { this.error.set(error instanceof Error ? error.message : 'Não foi possível carregar.'); } finally { this.loading.set(false); } }
}
