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
    expect(fixture.nativeElement.querySelector('input[name="transactionDescription"]')).not.toBeNull();
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
