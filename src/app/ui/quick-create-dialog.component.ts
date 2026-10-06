import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from './app-icon.component';
import { DrawerComponent } from './drawer.component';

export type QuickCreateKind = 'INCOME' | 'EXPENSE' | 'TRANSFER';

@Component({
  selector: 'app-quick-create-dialog',
  standalone: true,
  imports: [AppIconComponent, DrawerComponent],
  template: `
    <app-drawer [open]="open" label="Nova" (close)="close.emit()">
      <div class="quick-create-options" aria-label="Escolha o tipo de criação">
        <button type="button" class="quick-create-option income" (click)="select.emit('INCOME')">
          <span class="quick-create-icon"><app-icon name="income" /></span><strong>Receita</strong>
        </button>
        <button type="button" class="quick-create-option expense" (click)="select.emit('EXPENSE')">
          <span class="quick-create-icon"><app-icon name="expense" /></span><strong>Despesa</strong>
        </button>
        <button type="button" class="quick-create-option transfer" (click)="select.emit('TRANSFER')">
          <span class="quick-create-icon"><app-icon name="transfers" /></span><strong>Transferência</strong>
        </button>
      </div>
    </app-drawer>
  `,
  styles: `
    .quick-create-options { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .quick-create-option { min-height:148px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:18px 12px; color:var(--ink); background:var(--surface-alt); border:1px solid var(--line); border-radius:12px; font:inherit; font-size:.9375rem; font-weight:750; transition:border-color .15s ease, background .15s ease, transform .15s ease; }
    .quick-create-option:hover, .quick-create-option:focus-visible { border-color:var(--quick-create-color); background:color-mix(in srgb,var(--quick-create-color) 10%,var(--surface-alt)); transform:translateY(-2px); outline:0; }
    .quick-create-icon { display:inline-grid; place-items:center; width:3rem; height:3rem; border-radius:12px; color:var(--quick-create-color); background:color-mix(in srgb,var(--quick-create-color) 16%,transparent); }
    .quick-create-icon app-icon { width:1.5rem; height:1.5rem; }
    .income { --quick-create-color:var(--success); }.expense { --quick-create-color:var(--danger); }.transfer { --quick-create-color:var(--brand); }
    @media (max-width:560px) { .quick-create-options { grid-template-columns:1fr; }.quick-create-option { min-height:82px; flex-direction:row; justify-content:flex-start; padding:14px 18px; }.quick-create-icon { width:2.5rem; height:2.5rem; }.quick-create-icon app-icon { width:1.25rem; height:1.25rem; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickCreateDialogComponent {
  @Input() open = false;
  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly select = new EventEmitter<QuickCreateKind>();
}
