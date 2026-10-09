import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feedback-banner',
  template: '<div class="feedback-banner" [class.success]="kind === \'success\'" role="alert">{{ message }}</div>',
  styles: [':host{display:block}.feedback-banner{margin-bottom:14px;color:var(--danger);background:var(--danger-soft);border:1px solid var(--danger);padding:12px 14px;border-radius:var(--radius-sm);font-size:14px}.feedback-banner.success{color:var(--success);background:var(--success-soft);border-color:var(--success)}'],
})
export class FeedbackBannerComponent {
  @Input({ required: true }) message = '';
  @Input() kind: 'error' | 'success' = 'error';
}
