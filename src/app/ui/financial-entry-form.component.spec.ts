import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FinancialEntryFormComponent } from './financial-entry-form.component';

describe('FinancialEntryFormComponent', () => {
  let fixture: ComponentFixture<FinancialEntryFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FinancialEntryFormComponent] });
    fixture = TestBed.createComponent(FinancialEntryFormComponent);
    fixture.componentRef.setInput('transactionForm', { sourceType: 'ACCOUNT', accountId: 'account_1', cardId: '', subcategoryId: 'subcategory_1', type: 'EXPENSE', amount: 10, description: 'Teste', occurredOn: '2026-10-08', notes: '' });
    fixture.componentRef.setInput('recurringForm', { sourceType: 'ACCOUNT', accountId: 'account_1', cardId: '', subcategoryId: 'subcategory_1', type: 'EXPENSE', amount: 10, description: 'Teste', startOn: '2026-10-08', endOn: '' });
    fixture.componentRef.setInput('installmentForm', { sourceType: 'CARD', accountId: '', cardId: 'card_1', subcategoryId: 'subcategory_1', type: 'EXPENSE', totalAmount: 100, installmentCount: 2, startInstallmentNumber: 1, description: 'Teste', firstOccurredOn: '2026-10-08' });
    fixture.componentRef.setInput('cards', [{ id: 'card_1', name: 'Cartão teste', network: 'VISA', closingDay: 1, dueDay: 10, isActive: true }]);
  });

  it('offers avulso, fixo e parcelado from the transaction context', () => {
    fixture.componentRef.setInput('context', 'TRANSACTION');
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.detectChanges();
    expect(Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.entry-mode-tabs button')).map((button) => button.textContent?.trim())).toEqual(['Avulso', 'Fixo', 'Parcelado']);
    expect(Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.schedule-type-tabs button')).map((button) => button.textContent?.trim())).toEqual(['Despesa', 'Receita']);
    expect(fixture.nativeElement.querySelector('input[name="transactionDescription"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('select[name="transactionType"]')).toBeNull();
  });

  it('blocks a one-off entry with a zero amount before it reaches the API', () => {
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.componentInstance.transactionForm.amount = 0;
    fixture.detectChanges();
    const submit = fixture.nativeElement.querySelector('form button[type="submit"]') as HTMLButtonElement | null;
    expect(submit?.disabled).toBe(true);
  });

  it('emits the typed fixed mode without relying on the native submit event name', () => {
    fixture.componentRef.setInput('mode', 'FIXED');
    fixture.detectChanges();
    let emittedMode: string | undefined;
    fixture.componentInstance.entrySubmit.subscribe((mode) => emittedMode = mode);
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(emittedMode).toBe('FIXED');
  });

  it('shows the immutable financial type while allowing a standalone edit to choose a schedule mode', () => {
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.componentRef.setInput('editing', true);
    fixture.componentRef.setInput('allowModeChange', true);
    fixture.componentRef.setInput('entryType', 'INCOME');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.entry-mode-tabs button')).toHaveLength(3);
    expect(fixture.nativeElement.querySelectorAll('.schedule-type-tabs button')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.entry-type-indicator')?.textContent).toContain('Receita');
  });

  it('shows the immutable schedule kind beside the financial type while editing', () => {
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.componentRef.setInput('editing', true);
    fixture.componentRef.setInput('scheduleLabel', 'Fixa');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.entry-type-indicator')?.textContent).toContain('Despesa');
    expect(fixture.nativeElement.querySelector('.entry-type-indicator')?.textContent).toContain('Fixa');
  });

  it('locks an installment occurrence date when applying an edit to following occurrences', () => {
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.componentRef.setInput('editing', true);
    fixture.componentRef.setInput('showOccurrenceScope', true);
    fixture.componentRef.setInput('occurrenceScope', 'FOLLOWING');
    fixture.detectChanges();
    expect(fixture.componentInstance.scheduleFieldsLocked).toBe(true);
    expect((fixture.nativeElement.querySelector('input[name="transactionDate"]') as HTMLInputElement).disabled).toBe(true);
  });

  it('locks the card flow to a credit card while keeping the shared installment fields', () => {
    fixture.componentRef.setInput('context', 'CARD');
    fixture.componentRef.setInput('mode', 'INSTALLMENT');
    fixture.componentRef.setInput('lockSourceToCard', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[name="installmentSource"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Cartão de crédito');
    expect(fixture.nativeElement.querySelectorAll('select')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('input[name="installmentStart"]')).not.toBeNull();
  });

  it('renders the scope selector when editing a scheduled occurrence', () => {
    fixture.componentRef.setInput('mode', 'ONE_OFF');
    fixture.componentRef.setInput('editing', true);
    fixture.componentRef.setInput('showOccurrenceScope', true);
    fixture.detectChanges();
    const scope = fixture.nativeElement.querySelector('select[name="occurrenceEditScope"]') as HTMLSelectElement | null;
    expect(scope?.options.length).toBe(2);
    fixture.componentInstance.changeOccurrenceScope('FOLLOWING');
    expect(fixture.componentInstance.occurrenceScope).toBe('FOLLOWING');
  });
});
