import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ChipAutocompleteComponent } from './chip-autocomplete.component';

@Component({ standalone: true, imports: [ChipAutocompleteComponent], template: '<app-chip-autocomplete [options]="options" [(value)]="value" ariaLabel="Banco" />' })
class HostComponent {
  value = '';
  options = [
    { value: 'nubank', label: 'Nu Pagamentos S.A', logoUrl: '/nubank.svg' },
    { value: 'inter', label: 'Banco Inter S.A', icon: 'account_balance', color: '#ff7a00' },
  ];
}

describe('ChipAutocompleteComponent', () => {
  it('selects the highlighted option with Enter and renders it as a chip', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    input.value = 'inter';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('inter');
    expect((fixture.nativeElement as HTMLElement).querySelector('.chip')?.textContent).toContain('Banco Inter S.A');
  });

  it('selects with Tab and clears the chip with its remove action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('nubank');

    ((fixture.nativeElement as HTMLElement).querySelector('.chip button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('');
  });
});
