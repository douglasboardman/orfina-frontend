import { DatePipe, JsonPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService, AccessGrant, auditActionLabel } from '../data/admin-api.service';
import { AdminAccessStore } from '../data/admin-access.store';
import { SessionStore } from '../../core/session.store';
import { ApiError } from '../../api.service';
@Component({ selector: 'app-access-detail', imports: [FormsModule, DatePipe, JsonPipe], styleUrl: '../admin.css', template: `
  <dialog #panel class="admin-dialog detail-dialog" aria-labelledby="detail-title" (cancel)="cancel($event)"><header class="dialog-heading"><h2 id="detail-title">Detalhe do acesso</h2><button aria-label="Fechar detalhe" (click)="close()">×</button></header>
  @if (loading()) { <p role="status">Carregando acesso…</p> }@if (error()) { <p role="alert" class="error">{{ error() }}</p><button (click)="load()">Recarregar</button> }
  @if (grant(); as item) { <h3>{{ item.user?.name || item.email }}</h3><p class="email">{{ item.email }}</p><p><span class="badge" [class.enabled]="item.status === 'ENABLED'" [class.disabled]="item.status === 'DISABLED'">{{ item.status === 'ENABLED' ? 'Habilitado' : 'Desabilitado' }}</span></p>
  <dl><dt>Papel global</dt><dd>{{ item.user?.systemRole === 'SYSTEM_ADMIN' ? 'Administrador do sistema' : 'Usuário' }}</dd><dt>Autorizado em</dt><dd>{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd><dt>Último login</dt><dd>{{ item.user?.lastLoginAt ? (item.user?.lastLoginAt | date:'dd/MM/yyyy HH:mm') : 'Aguardando primeiro acesso' }}</dd></dl>
  @if (item.userId === session.user()?.id) { <p class="hint">Seu acesso administrativo é protegido contra auto bloqueio.</p> }
  @if (!action()) { <div class="dialog-actions"><button [disabled]="saving() || item.userId === session.user()?.id" [class.danger]="item.status === 'ENABLED'" (click)="begin(item.status === 'ENABLED' ? 'disable' : 'enable')">{{ item.status === 'ENABLED' ? 'Desabilitar acesso' : 'Habilitar acesso' }}</button>@if (item.userId) { <button (click)="begin('revoke')">Encerrar sessões</button> }</div> }
  @if (action()) { <section class="confirmation" aria-labelledby="confirm-title"><h3 id="confirm-title">{{ action() === 'disable' ? 'Desabilitar acesso?' : action() === 'enable' ? 'Habilitar acesso?' : 'Encerrar sessões?' }}</h3><p>{{ action() === 'disable' ? 'As sessões serão encerradas e novos acessos serão impedidos. Os dados e as associações familiares serão preservados.' : 'A pessoa precisará entrar novamente com Google.' }}</p><form #confirmation="ngForm" (ngSubmit)="confirm()"><label>Motivo {{ action() === 'enable' ? '(opcional)' : '(obrigatório)' }}<textarea #reasonInput name="reason" [(ngModel)]="reason" [required]="action() !== 'enable'" maxlength="500" rows="3"></textarea></label><div class="dialog-actions"><button type="button" [disabled]="saving()" (click)="action.set(null)">Cancelar</button><button type="submit" [disabled]="saving() || confirmation.invalid" [class.danger]="action() === 'disable'">{{ saving() ? 'Salvando…' : 'Confirmar' }}</button></div></form></section> }
  <p role="status" aria-live="polite">{{ feedback() }}</p><h3>Histórico do acesso</h3>@for (entry of item.history || []; track entry.id) { <article class="audit-entry"><strong>{{ actionLabel(entry.action) }}</strong><small>{{ entry.createdAt | date:'dd/MM/yyyy HH:mm' }} · {{ entry.actorUserId || 'Operador CLI' }}</small>@if (entry.reason) { <p>{{ entry.reason }}</p> }<details><summary>Ver mudanças</summary><pre>{{ entry.changes | json }}</pre></details></article> }@empty { <p>Sem alterações registradas.</p> }
  }</dialog>
` })
export class AccessDetailPageComponent implements AfterViewInit, OnDestroy {
  readonly actionLabel = auditActionLabel;
  private readonly api = inject(AdminApiService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly store = inject(AdminAccessStore);
  readonly session = inject(SessionStore); readonly grant = signal<AccessGrant | null>(null); readonly loading = signal(false); readonly error = signal(''); readonly feedback = signal(''); readonly saving = signal(false); readonly action = signal<'disable' | 'enable' | 'revoke' | null>(null);
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>; private previousFocus = document.activeElement as HTMLElement | null;
  reason = '';
  ngAfterViewInit() { this.panel.nativeElement.showModal(); void this.load(); }
  async load() { this.loading.set(true); try { this.grant.set(await this.api.detail(this.route.snapshot.paramMap.get('id')!)); this.error.set(''); } catch (error: unknown) { this.error.set(error instanceof Error ? error.message : 'Não foi possível carregar.'); } finally { this.loading.set(false); } }
  begin(action: 'disable' | 'enable' | 'revoke') { this.action.set(action); this.reason = ''; this.feedback.set(''); setTimeout(() => this.panel.nativeElement.querySelector('textarea')?.focus()); }
  async confirm() {
    const grant = this.grant(); if (!grant) return;
    this.saving.set(true); this.error.set('');
    try { if (this.action() === 'revoke') await this.api.revoke(grant.userId!, this.reason.trim()); else await this.api.status(grant, this.action() === 'disable' ? 'DISABLED' : 'ENABLED', this.reason.trim() || undefined);
      this.action.set(null); this.feedback.set('Alteração confirmada.'); await this.load(); await this.store.load(); }
    catch (error: unknown) { if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') { await this.load(); this.error.set('Outra pessoa alterou o acesso. Confira os dados antes de confirmar novamente.'); } else this.error.set(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
    finally { this.saving.set(false); }
  }
  cancel(event: Event) { event.preventDefault(); if (!this.saving()) this.close(); }
  close() { void this.router.navigateByUrl('/admin/acessos'); }
  ngOnDestroy() { this.panel.nativeElement.close(); this.previousFocus?.focus(); }
}
