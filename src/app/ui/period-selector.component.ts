import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from './app-icon.component';

@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [FormsModule, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="period-selector" aria-label="Mês de referência">
      <button type="button" class="icon-control" (click)="step.emit(-1)" aria-label="Mês anterior"><app-icon name="chevronLeft" /></button>
      <label>Mês de referência<input type="month" [ngModel]="month" (ngModelChange)="monthChange.emit($event)" /></label>
      <button type="button" class="icon-control" (click)="step.emit(1)" aria-label="Próximo mês"><app-icon name="chevronRight" /></button>
      @if (forecast) { <span class="status-badge status-warning">Previsão</span> }
    </div>
  `,
  styles: [`
    :host { display:block; margin-bottom:var(--space-4); }
    .period-selector { display:flex; align-items:end; gap:var(--space-2); min-height:68px; }
    label { display:grid; gap:var(--space-1); color:var(--muted); font-size:.75rem; font-weight:700; }
    input { width:174px; height:var(--control-height); border:1px solid var(--line); border-radius:var(--radius-sm); background:var(--surface); color:var(--ink); padding:0 var(--space-3); }
    .icon-control { display:grid; place-items:center; width:var(--control-height); height:var(--control-height); border:1px solid var(--line); border-radius:var(--radius-sm); background:var(--surface); color:var(--ink); }
    .icon-control:hover { border-color:var(--brand); color:var(--brand); }
    .status-badge { align-self:center; margin-left:var(--space-1); }
    @media (max-width:540px) { .period-selector { align-items:end; }.period-selector label { flex:1; }.period-selector input { width:100%; }.status-badge { display:none; } }
  `],
})
export class PeriodSelectorComponent {
  @Input({ required: true }) month = '';
  @Input() forecast = false;
  @Output() readonly monthChange = new EventEmitter<string>();
  @Output() readonly step = new EventEmitter<number>();
}
