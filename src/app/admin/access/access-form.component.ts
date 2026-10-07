import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../data/admin-api.service';
import { AdminAccessStore } from '../data/admin-access.store';
import { ApiError } from '../../api.service';
@Component({ selector: 'app-access-form', imports: [FormsModule, RouterLink], styleUrl: '../admin.css', template: `
  <dialog #panel class="admin-dialog" aria-labelledby="grant-title" (cancel)="cancel($event)"><header class="dialog-heading"><h2 id="grant-title">Autorizar e-mail</h2><button aria-label="Fechar formulário" (click)="close()">×</button></header>
  <p>Essa pessoa poderá entrar com a conta Google autorizada. O acesso aos grupos familiares depende de convite ou criação de grupo.</p>
  <p class="hint">Gmail e Google Workspace podem ser vinculados no primeiro login. Outros e-mails precisam de vínculo de identidade feito pelo operador.</p>
  <form #form="ngForm" (ngSubmit)="save()"><label>E-mail<input #emailInput name="email" type="email" [(ngModel)]="email" required maxlength="254" autocomplete="off" [attr.aria-invalid]="emailError ? true : null" aria-describedby="email-error" /></label><p id="email-error" class="field-error">{{ emailError }}</p><label>Motivo (opcional)<textarea name="reason" [(ngModel)]="reason" maxlength="500" rows="3"></textarea></label>
  @if (error) { <p class="error" role="alert">{{ error }}</p> }@if (existingId) { <a [routerLink]="['/admin/acessos', existingId]">Consultar acesso já cadastrado</a> }<footer class="dialog-actions"><button type="button" (click)="close()" [disabled]="saving">Cancelar</button><button class="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Autorizando…' : 'Autorizar acesso' }}</button></footer></form></dialog>
` })
export class AccessFormComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(AdminApiService); private readonly router = inject(Router); private readonly store = inject(AdminAccessStore);
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>; @ViewChild('emailInput', { static: true }) emailInput!: ElementRef<HTMLInputElement>;
  private previousFocus = document.activeElement as HTMLElement | null;
  existingId = ''; email = ''; reason = ''; saving = false; error = ''; emailError = '';
  ngAfterViewInit() { this.panel.nativeElement.showModal(); this.emailInput.nativeElement.focus(); }
  cancel(event: Event) { event.preventDefault(); if (!this.saving) this.close(); }
  close() { void this.router.navigateByUrl('/admin/acessos'); }
  async save() {
    this.saving = true; this.error = ''; this.emailError = ''; this.existingId = '';
    try { await this.api.create(this.email.trim(), this.reason.trim() || undefined); this.store.feedback.set('Acesso autorizado. Aguardando login com Google.'); await this.store.load(); this.close(); }
    catch (error: unknown) { this.error = error instanceof Error ? error.message : 'Não foi possível autorizar.'; if (error instanceof ApiError) this.existingId = error.grantId ?? ''; if (error instanceof ApiError) this.emailError = error.issues.find((issue) => issue.path === 'email')?.message ?? ''; if (this.emailError) this.emailInput.nativeElement.focus(); }
    finally { this.saving = false; }
  }
  ngOnDestroy() { this.panel.nativeElement.close(); this.previousFocus?.focus(); }
}
