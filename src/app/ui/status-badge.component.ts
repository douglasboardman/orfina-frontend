import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({ selector: 'app-status-badge', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `<span class="status-badge" [class]="'status-badge status-' + tone">{{ label }}</span>` })
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';
}
