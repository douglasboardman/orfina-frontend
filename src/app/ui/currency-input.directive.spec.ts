import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CurrencyInputDirective } from './currency-input.directive';

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyInputDirective],
  template: '<input appCurrencyInput [(ngModel)]="amount"><input appCurrencyInput currencyNullable [(ngModel)]="optionalAmount">',
})
class CurrencyInputHostComponent {
  amount = 0;
  optionalAmount: number | null = 12.34;
}

describe('CurrencyInputDirective', () => {
  it('builds an amount in cents as each digit is typed', async () => {
    const fixture = TestBed.createComponent(CurrencyInputHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

    for (const digit of '123456') {
      input.value += digit;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    }

    expect(fixture.componentInstance.amount).toBe(1234.56);
    expect(input.value).toContain('1.234,56');
  });

  it('accepts a formatted paste and permits an optional field to be cleared', () => {
    const fixture = TestBed.createComponent(CurrencyInputHostComponent);
    fixture.detectChanges();
    const [amount, optionalAmount] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input')) as HTMLInputElement[];

    amount.value = 'R$ 9.876,54';
    amount.dispatchEvent(new Event('input'));
    optionalAmount.value = '';
    optionalAmount.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.amount).toBe(9876.54);
    expect(fixture.componentInstance.optionalAmount).toBeNull();
    expect(optionalAmount.value).toBe('');
  });
});
