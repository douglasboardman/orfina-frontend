import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from './app-icon.component';

export type ChipAutocompleteOption = {
  value: string;
  label: string;
  detail?: string;
  icon?: string;
  color?: string;
  logoUrl?: string;
};

@Component({
  selector: 'app-chip-autocomplete',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="autocomplete" [class.disabled]="disabled" (focusout)="closeLater()">
      <div class="control" (click)="focusInput()">
        @if (selected) {
          <span class="chip">
            @if (selected.logoUrl) { <img [src]="selected.logoUrl" alt="" /> }
            @else if (selected.icon) { <span class="option-icon" [style.color]="selected.color">{{ selected.icon }}</span> }
            <span>{{ selected.label }}</span>
            <button type="button" [attr.aria-label]="'Remover ' + selected.label" (click)="remove($event)"><app-icon name="close" /></button>
          </span>
        }
        <input #input type="text" [value]="query" [disabled]="disabled" [placeholder]="selected ? 'Trocar seleção' : placeholder"
          [attr.aria-label]="ariaLabel" [attr.aria-expanded]="open" aria-autocomplete="list" (focus)="openChoices()" (input)="search(input.value)" (keydown)="onKeydown($event)">
      </div>
      @if (open) {
        <ul class="options" role="listbox" [attr.aria-label]="ariaLabel">
          @for (option of matches; track option.value; let index = $index) {
            <li role="option" [attr.aria-selected]="option.value === value" [class.active]="index === activeIndex" (mousedown)="select(option, $event)">
              @if (option.logoUrl) { <img [src]="option.logoUrl" alt="" /> }
              @else if (option.icon) { <span class="option-icon" [style.color]="option.color">{{ option.icon }}</span> }
              <span><strong>{{ option.label }}</strong>@if (option.detail) { <small>{{ option.detail }}</small> }</span>
            </li>
          } @empty { <li class="empty">Nenhum resultado.</li> }
        </ul>
      }
    </div>
  `,
  styles: `
    :host{display:block;min-width:0}.autocomplete{position:relative}.control{display:flex;align-items:center;gap:6px;min-height:42px;padding:4px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);cursor:text}.autocomplete:focus-within .control{outline:var(--focus);border-color:var(--brand)}.autocomplete.disabled .control{opacity:.6;background:var(--surface-alt);cursor:default}.control input{min-width:80px;flex:1;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;padding:5px 2px!important;color:var(--ink)}.chip{display:inline-flex;max-width:calc(100% - 86px);align-items:center;gap:6px;padding:4px 6px 4px 7px;border-radius:7px;background:var(--brand-soft);color:var(--ink);font-size:13px;font-weight:700}.chip>span:nth-child(2),.chip>span:nth-child(1):not(.option-icon){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chip img,.options img{width:20px;height:20px;object-fit:contain;flex:none}.chip button{display:grid;place-items:center;width:20px;height:20px;flex:none;padding:2px;border:0;border-radius:4px;color:var(--muted);background:transparent}.chip button:hover{color:var(--ink);background:color-mix(in srgb,var(--ink) 10%,transparent)}.chip app-icon{width:14px;height:14px}.option-icon{display:inline-grid;place-items:center;width:20px;height:20px;flex:none;font-family:'Material Symbols Outlined',sans-serif;font-size:20px;line-height:1}.options{position:absolute;z-index:30;top:calc(100% + 4px);right:0;left:0;max-height:260px;margin:0;padding:4px;overflow:auto;border:1px solid var(--line);border-radius:8px;background:var(--surface);box-shadow:var(--shadow-lg);list-style:none}.options li{display:flex;align-items:center;gap:9px;padding:8px;border-radius:6px;cursor:pointer}.options li:hover,.options li.active{background:var(--brand-soft)}.options strong,.options small{display:block}.options strong{font-size:13px}.options small{margin-top:2px;color:var(--muted);font-size:11px}.options .empty{color:var(--muted);cursor:default}
  `,
})
export class ChipAutocompleteComponent {
  private optionList: readonly ChipAutocompleteOption[] = [];
  @Input() set options(options: readonly ChipAutocompleteOption[] | undefined) { this.optionList = options ?? []; }
  get options(): readonly ChipAutocompleteOption[] { return this.optionList; }
  @Input() value = '';
  @Input() placeholder = 'Pesquisar';
  @Input() ariaLabel = 'Selecionar opção';
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<string>();
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;

  query = '';
  open = false;
  activeIndex = 0;
  private closeTimer?: ReturnType<typeof setTimeout>;

  get selected() { return this.optionList.find((option) => option.value === this.value); }
  get matches() {
    const term = this.normalize(this.query);
    return this.optionList.filter((option) => !term || this.normalize(`${option.label} ${option.detail ?? ''}`).includes(term)).slice(0, 12);
  }

  search(query: string) { this.query = query; this.activeIndex = 0; this.open = true; }
  openChoices() { if (!this.disabled) { clearTimeout(this.closeTimer); this.open = true; this.activeIndex = 0; } }
  closeLater() { this.closeTimer = setTimeout(() => { this.open = false; this.query = ''; }, 120); }
  focusInput() { if (!this.disabled) this.input?.nativeElement.focus(); }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); this.openChoices(); this.activeIndex = Math.min(this.activeIndex + 1, Math.max(this.matches.length - 1, 0)); return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); this.openChoices(); this.activeIndex = Math.max(this.activeIndex - 1, 0); return; }
    if (event.key === 'Escape') { this.open = false; this.query = ''; return; }
    if (event.key === 'Backspace' && !this.query && this.selected) { this.remove(event); return; }
    if ((event.key === 'Enter' || event.key === 'Tab') && this.open && this.matches[this.activeIndex]) {
      if (event.key === 'Enter') event.preventDefault();
      this.select(this.matches[this.activeIndex]);
    }
  }

  select(option: ChipAutocompleteOption, event?: Event) {
    event?.preventDefault();
    this.valueChange.emit(option.value);
    this.value = option.value;
    this.query = '';
    this.open = false;
  }

  remove(event?: Event) {
    event?.stopPropagation();
    this.valueChange.emit('');
    this.value = '';
    this.query = '';
    this.open = false;
    queueMicrotask(() => this.focusInput());
  }

  private normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
}
