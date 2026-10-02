import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [NgIf],
  template: '<div class="empty-state"><strong>{{ title }}</strong><p *ngIf="description">{{ description }}</p></div>',
  styles: [':host{display:block}.empty-state{color:var(--muted);padding:6px 0}.empty-state strong{color:var(--ink);font-size:14px}.empty-state p{margin:5px 0 0;font-size:13px}'],
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
}
