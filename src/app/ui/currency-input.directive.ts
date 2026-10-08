import { booleanAttribute, Directive, ElementRef, HostListener, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Writes a monetary amount as Brazilian reais while keeping the bound model in
 * reais. Digits are interpreted from right to left as cents, so typing 1234
 * results in R$ 12,34.
 */
@Directive({
  selector: 'input[appCurrencyInput]',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CurrencyInputDirective), multi: true }],
})
export class CurrencyInputDirective implements ControlValueAccessor {
  @Input({ transform: booleanAttribute }) currencyAllowNegative = false;
  @Input({ transform: booleanAttribute }) currencyNullable = false;

  private readonly formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private pendingNegative = false;

  constructor(private readonly element: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null | undefined) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      this.pendingNegative = false;
      this.element.nativeElement.value = this.currencyNullable ? '' : this.formatter.format(0);
      return;
    }
    this.pendingNegative = Object.is(value, -0);
    this.element.nativeElement.value = this.formatter.format(value);
  }

  registerOnChange(fn: (value: number | null) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { this.element.nativeElement.disabled = disabled; }

  @HostListener('input')
  formatInput() {
    const raw = this.element.nativeElement.value;
    const digits = raw.replace(/\D/g, '');
    if (!digits && this.currencyNullable) {
      this.pendingNegative = false;
      this.element.nativeElement.value = '';
      this.onChange(null);
      return;
    }

    const cents = Number(digits || 0);
    const negative = this.currencyAllowNegative && (raw.includes('-') || this.pendingNegative);
    const amount = (negative ? -1 : 1) * cents / 100;
    this.pendingNegative = negative && cents === 0;
    this.element.nativeElement.value = this.formatter.format(amount);
    this.moveCaretToEnd();
    this.onChange(amount);
  }

  @HostListener('keydown', ['$event'])
  toggleNegative(event: KeyboardEvent) {
    if (!this.currencyAllowNegative || (event.key !== '-' && event.key !== 'Subtract')) return;
    event.preventDefault();
    const cents = Number(this.element.nativeElement.value.replace(/\D/g, '') || 0);
    const negative = !this.element.nativeElement.value.includes('-');
    const amount = (negative ? -1 : 1) * cents / 100;
    this.pendingNegative = negative && cents === 0;
    this.element.nativeElement.value = this.formatter.format(amount);
    this.moveCaretToEnd();
    this.onChange(amount);
  }

  @HostListener('focus')
  @HostListener('click')
  moveCaretToEnd() { queueMicrotask(() => this.element.nativeElement.setSelectionRange(this.element.nativeElement.value.length, this.element.nativeElement.value.length)); }

  @HostListener('blur')
  markTouched() { this.onTouched(); }
}
