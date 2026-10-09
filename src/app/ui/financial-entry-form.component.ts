import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account, Card, TransactionType } from '../models';
import { ChipAutocompleteComponent, ChipAutocompleteOption } from './chip-autocomplete.component';
import { CurrencyInputDirective } from './currency-input.directive';

export type FinancialEntryMode = 'ONE_OFF' | 'FIXED' | 'INSTALLMENT';
export type FinancialEntryContext = 'TRANSACTION' | 'RECURRENCE' | 'CARD';

export type TransactionEntryForm = { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes: string };
export type RecurringEntryForm = { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; startOn: string; endOn: string };
export type InstallmentEntryForm = { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; totalAmount: number; installmentCount: number; startInstallmentNumber: number; description: string; firstOccurredOn: string };

@Component({
  selector: 'app-financial-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyInputDirective, ChipAutocompleteComponent],
  template: `
    <div class="entry-mode-tabs" *ngIf="(!editing || allowModeChange) && context !== 'RECURRENCE'" role="tablist" aria-label="Tipo de lançamento">
      <button type="button" role="tab" [class.active]="mode === 'ONE_OFF'" [attr.aria-selected]="mode === 'ONE_OFF'" (click)="modeChange.emit('ONE_OFF')">Avulso</button>
      <button type="button" role="tab" [class.active]="mode === 'FIXED'" [attr.aria-selected]="mode === 'FIXED'" (click)="modeChange.emit('FIXED')">Fixo</button>
      <button type="button" role="tab" [class.active]="mode === 'INSTALLMENT'" [attr.aria-selected]="mode === 'INSTALLMENT'" (click)="modeChange.emit('INSTALLMENT')">Parcelado</button>
    </div>
    <div class="entry-type-indicator" *ngIf="editing" aria-label="Tipo do lançamento">
      <span>Tipo do lançamento</span>
      <strong>{{ entryType === 'INCOME' ? 'Receita' : 'Despesa' }}</strong>
      <strong *ngIf="scheduleLabel">{{ scheduleLabel }}</strong>
    </div>
    <div class="schedule-type-tabs" *ngIf="!editing" role="tablist" aria-label="Tipo financeiro">
      <button type="button" role="tab" [class.active]="entryType === 'EXPENSE'" [attr.aria-selected]="entryType === 'EXPENSE'" (click)="typeChange.emit('EXPENSE')">Despesa</button>
      <button type="button" role="tab" [class.active]="entryType === 'INCOME'" [attr.aria-selected]="entryType === 'INCOME'" (click)="typeChange.emit('INCOME')">Receita</button>
    </div>
    <div class="quick-create-options" *ngIf="mode !== 'ONE_OFF'">
      <button type="button" class="quick-create-option" [class.active]="mode === 'FIXED'" (click)="modeChange.emit('FIXED')"><strong>{{ entryType === 'INCOME' ? 'Receita fixa' : 'Despesa fixa' }}</strong><small>{{ entryType === 'INCOME' ? 'Ex.: salário, aluguel recebido, pensão, rendimentos etc.' : 'Ex.: aluguel, condomínio, assinaturas, contas mensais etc.' }}</small></button>
      <button type="button" class="quick-create-option" [class.active]="mode === 'INSTALLMENT'" (click)="modeChange.emit('INSTALLMENT')"><strong>{{ entryType === 'INCOME' ? 'Receita parcelada' : 'Despesa parcelada' }}</strong><small>{{ entryType === 'INCOME' ? 'Ex.: venda parcelada, comissão parcelada, restituição etc.' : 'Ex.: financiamento, empréstimo, compra parcelada etc.' }}</small></button>
    </div>

    <form class="form-card entry-form" *ngIf="mode === 'ONE_OFF'" (ngSubmit)="entrySubmit.emit('ONE_OFF')">
      <label class="field field-wide"><span>Descrição</span><input name="transactionDescription" [(ngModel)]="transactionForm.description" placeholder="Ex.: Compra no mercado" required></label>
      <label class="field field-wide"><span>Valor</span><input appCurrencyInput name="transactionAmount" [(ngModel)]="transactionForm.amount" type="text" inputmode="numeric" required></label>
      <ng-container *ngTemplateOutlet="sourceFields; context: { form: transactionForm, prefix: 'transaction', type: transactionForm.type }"></ng-container>
      <label class="field field-wide"><span>Subcategoria</span><app-chip-autocomplete [options]="transactionSubcategories" [value]="transactionForm.subcategoryId" placeholder="Buscar subcategoria" ariaLabel="Subcategoria" (valueChange)="transactionForm.subcategoryId = $event" /></label>
      <label class="field field-wide" *ngIf="showOccurrenceScope"><span>Aplicar alteração</span><select name="occurrenceEditScope" [ngModel]="occurrenceScope" (ngModelChange)="changeOccurrenceScope($event)"><option value="ONE">Somente esta ocorrência</option><option value="FOLLOWING">Esta e as próximas ocorrências</option></select></label>
      <label class="field"><span>Data</span><input name="transactionDate" [(ngModel)]="transactionForm.occurredOn" type="date" [attr.disabled]="scheduleFieldsLocked ? 'disabled' : null" required></label>
      <label class="field field-wide"><span>Observações</span><textarea name="transactionNotes" [(ngModel)]="transactionForm.notes" maxlength="1000" placeholder="Opcional"></textarea></label>
      <button type="submit" [disabled]="loading || !validTransaction()">{{ editing ? 'Salvar alterações' : 'Adicionar lançamento' }}</button>
      <button *ngIf="editing" type="button" class="secondary-button" (click)="cancel.emit()">Cancelar</button>
    </form>

    <form class="form-card entry-form" *ngIf="mode === 'FIXED'" (ngSubmit)="entrySubmit.emit('FIXED')">
      <label class="field field-wide"><span>Descrição</span><input name="recurringDescription" [(ngModel)]="recurringForm.description" placeholder="Ex.: Assinatura mensal" required></label>
      <label class="field field-wide"><span>Valor</span><input appCurrencyInput name="recurringAmount" [(ngModel)]="recurringForm.amount" type="text" inputmode="numeric" required></label>
      <ng-container *ngTemplateOutlet="sourceFields; context: { form: recurringForm, prefix: 'recurring', type: recurringForm.type }"></ng-container>
      <label class="field field-wide"><span>Subcategoria</span><app-chip-autocomplete [options]="recurringSubcategories" [value]="recurringForm.subcategoryId" placeholder="Buscar subcategoria" ariaLabel="Subcategoria da recorrência" (valueChange)="recurringForm.subcategoryId = $event" /></label>
      <div class="two-columns"><label class="field"><span>Início</span><input name="recurringStart" [(ngModel)]="recurringForm.startOn" type="date" required></label><label class="field"><span>Fim (opcional)</span><input name="recurringEnd" [(ngModel)]="recurringForm.endOn" type="date"></label></div>
      <button type="submit" [disabled]="loading || !validRecurring()">{{ conversionFromTransaction ? 'Converter em recorrência contínua' : 'Criar recorrência contínua' }}</button>
    </form>

    <form class="form-card entry-form" *ngIf="mode === 'INSTALLMENT'" (ngSubmit)="entrySubmit.emit('INSTALLMENT')">
      <label class="field field-wide"><span>Descrição</span><input name="installmentDescription" [(ngModel)]="installmentForm.description" placeholder="Ex.: Financiamento" required></label>
      <label class="field field-wide"><span>Valor total</span><input appCurrencyInput name="installmentAmount" [(ngModel)]="installmentForm.totalAmount" type="text" inputmode="numeric" required></label>
      <ng-container *ngTemplateOutlet="sourceFields; context: { form: installmentForm, prefix: 'installment', type: installmentForm.type }"></ng-container>
      <div class="three-columns"><label class="field"><span>Parcela início</span><input name="installmentStart" [(ngModel)]="installmentForm.startInstallmentNumber" type="number" min="1" [max]="installmentForm.installmentCount" required></label><label class="field"><span>Parcelas</span><input name="installmentCount" [(ngModel)]="installmentForm.installmentCount" type="number" min="2" max="360" required></label><label class="field"><span>Data da ocorrência</span><input name="installmentDate" [(ngModel)]="installmentForm.firstOccurredOn" type="date" required></label></div>
      <label class="field field-wide"><span>Subcategoria</span><app-chip-autocomplete [options]="installmentSubcategories" [value]="installmentForm.subcategoryId" placeholder="Buscar subcategoria" ariaLabel="Subcategoria do parcelamento" (valueChange)="installmentForm.subcategoryId = $event" /></label>
      <button type="submit" [disabled]="loading || !validInstallment()">{{ conversionFromTransaction ? 'Converter em parcelas' : 'Criar parcelas' }} {{ installmentForm.startInstallmentNumber }} a {{ installmentForm.installmentCount }}</button>
    </form>

    <ng-template #sourceFields let-form="form" let-prefix="prefix" let-type="type">
      <div class="two-columns" *ngIf="!lockSourceToCard"><label class="field"><span>{{ type === 'INCOME' ? 'Destino' : 'Origem' }}</span><select [name]="prefix + 'Source'" [(ngModel)]="form.sourceType" (ngModelChange)="sourceChange.emit()"><option value="ACCOUNT">Conta</option><option value="CARD">Cartão</option></select></label><label class="field"><span>{{ form.sourceType === 'ACCOUNT' ? 'Conta' : 'Cartão' }}</span><select *ngIf="form.sourceType === 'ACCOUNT'" [name]="prefix + 'Account'" [(ngModel)]="form.accountId" required><option value="" disabled>Selecione uma conta</option><option *ngFor="let account of accounts" [disabled]="!account.isActive" [value]="account.id">{{ account.name }}</option></select><select *ngIf="form.sourceType === 'CARD'" [name]="prefix + 'Card'" [(ngModel)]="form.cardId" required><option value="" disabled>Selecione um cartão</option><option *ngFor="let card of cards" [disabled]="!card.isActive" [value]="card.id">{{ card.name }}</option></select></label></div>
      <label class="field field-wide" *ngIf="lockSourceToCard"><span>Cartão de crédito</span><select [name]="prefix + 'Card'" [(ngModel)]="form.cardId" required><option value="" disabled>Selecione um cartão</option><option *ngFor="let card of cards" [disabled]="!card.isActive" [value]="card.id">{{ card.name }}</option></select></label>
    </ng-template>
  `,
  styles: `
    :host { display:contents; }
    .entry-mode-tabs,.schedule-type-tabs { display:grid; gap:8px; padding:4px; margin-bottom:12px; border:1px solid var(--line); border-radius:var(--radius-md); background:var(--surface-alt); }.entry-mode-tabs { grid-template-columns:repeat(3,minmax(0,1fr)); }.schedule-type-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); }.entry-mode-tabs button,.schedule-type-tabs button { min-height:var(--control-height); border:0; border-radius:var(--radius-sm); padding:0 12px; color:var(--muted); background:transparent; font-weight:750; }.entry-mode-tabs button.active,.schedule-type-tabs button.active { color:var(--brand); background:var(--surface); box-shadow:var(--shadow-sm); }
    .entry-type-indicator { display:flex; align-items:center; gap:8px; margin-bottom:12px; color:var(--muted); font-size:.8125rem; font-weight:650; }.entry-type-indicator strong { border-radius:999px; padding:4px 9px; color:var(--brand); background:var(--brand-soft); font-size:.75rem; font-weight:750; }
    .quick-create-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-bottom:16px; }.quick-create-option { min-width:0; min-height:100px; display:grid; align-content:start; gap:4px; border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; text-align:left; color:var(--ink); background:var(--surface); }.quick-create-option:hover { border-color:var(--brand); }.quick-create-option.active { border-color:var(--brand); background:var(--brand-soft); box-shadow:inset 0 0 0 1px var(--brand); }.quick-create-option strong { font-size:.9375rem; }.quick-create-option small { color:var(--muted); font-size:.75rem; line-height:1.4; }.quick-create-option.active strong { color:var(--brand); }
    .form-card { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }.field { display:grid; align-content:start; gap:4px; min-width:0; color:var(--muted); font-size:.8125rem; font-weight:650; }.field-wide { grid-column:1 / -1; }.two-columns { display:contents; }.three-columns { grid-column:1 / -1; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; } input,select,textarea { width:100%; min-height:var(--control-height); border:1px solid var(--line); border-radius:8px; color:var(--ink); background:var(--surface-alt); padding:10px; outline:none; } textarea { min-height:76px; resize:vertical; } input:focus,select:focus,textarea:focus { border-color:var(--brand); box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 16%,transparent); }.form-card button[type='submit'] { grid-column:1 / -1; margin-top:2px; border:0; border-radius:9px; color:#fff; background:var(--brand); padding:12px 16px; font-weight:750; }.form-card button:disabled { opacity:.55; cursor:not-allowed; }.form-card .secondary-button { grid-column:1 / -1; color:var(--ink); background:transparent; border:1px solid var(--line); border-radius:9px; padding:12px 16px; font-weight:750; }
    @media (max-width:540px) { .form-card,.quick-create-options,.three-columns { grid-template-columns:1fr; } }
  `,
})
export class FinancialEntryFormComponent {
  @Input({ required: true }) context: FinancialEntryContext = 'TRANSACTION';
  @Input({ required: true }) mode: FinancialEntryMode = 'ONE_OFF';
  @Input() entryType: TransactionType = 'EXPENSE';
  @Input() lockSourceToCard = false;
  @Input() editing = false;
  @Input() allowModeChange = false;
  @Input() conversionFromTransaction = false;
  @Input() showOccurrenceScope = false;
  @Input() occurrenceScope: 'ONE' | 'FOLLOWING' = 'ONE';
  @Input() scheduleLabel = '';
  @Input() loading = false;
  @Input({ required: true }) transactionForm!: TransactionEntryForm;
  @Input({ required: true }) recurringForm!: RecurringEntryForm;
  @Input({ required: true }) installmentForm!: InstallmentEntryForm;
  @Input() accounts: Account[] = [];
  @Input() cards: Card[] = [];
  @Input() transactionSubcategories: ChipAutocompleteOption[] = [];
  @Input() recurringSubcategories: ChipAutocompleteOption[] = [];
  @Input() installmentSubcategories: ChipAutocompleteOption[] = [];
  @Output() readonly modeChange = new EventEmitter<FinancialEntryMode>();
  @Output() readonly typeChange = new EventEmitter<TransactionType>();
  @Output() readonly sourceChange = new EventEmitter<void>();
  @Output() readonly occurrenceScopeChange = new EventEmitter<'ONE' | 'FOLLOWING'>();
  // Avoid the native DOM `submit` event name: it bubbles from the internal forms
  // and may otherwise be handled by the host instead of the typed component event.
  @Output() readonly entrySubmit = new EventEmitter<FinancialEntryMode>();
  @Output() readonly cancel = new EventEmitter<void>();

  changeOccurrenceScope(scope: 'ONE' | 'FOLLOWING') {
    this.occurrenceScope = scope;
    this.occurrenceScopeChange.emit(scope);
  }

  valid(form: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string }) {
    return Boolean(form.subcategoryId && (this.lockSourceToCard ? form.cardId : form.sourceType === 'ACCOUNT' ? form.accountId : form.cardId));
  }

  validTransaction() {
    return this.valid(this.transactionForm) && this.validCommon(this.transactionForm.amount, this.transactionForm.description, this.transactionForm.occurredOn);
  }

  validRecurring() {
    return this.valid(this.recurringForm) && this.validCommon(this.recurringForm.amount, this.recurringForm.description, this.recurringForm.startOn);
  }

  validInstallment() {
    return this.valid(this.installmentForm)
      && this.validCommon(this.installmentForm.totalAmount, this.installmentForm.description, this.installmentForm.firstOccurredOn)
      && Number.isInteger(this.installmentForm.installmentCount)
      && this.installmentForm.installmentCount >= 2
      && Number.isInteger(this.installmentForm.startInstallmentNumber)
      && this.installmentForm.startInstallmentNumber >= 1
      && this.installmentForm.startInstallmentNumber <= this.installmentForm.installmentCount;
  }

  get scheduleFieldsLocked() {
    return this.editing && this.showOccurrenceScope && this.occurrenceScope === 'FOLLOWING';
  }

  private validCommon(amount: number, description: string, date: string) {
    return Number.isFinite(amount) && amount > 0 && description.trim().length >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
}
