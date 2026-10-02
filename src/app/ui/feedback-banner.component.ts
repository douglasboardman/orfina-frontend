import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feedback-banner',
  template: '<div class="feedback-banner" [class.success]="kind === \'success\'" role="alert">{{ message }}</div>',
  styles: [':host{display:block}.feedback-banner{margin-bottom:14px;color:#b42318;background:#ffefef;border:1px solid #ffc8c4;padding:12px 14px;border-radius:9px;font-size:14px}.feedback-banner.success{color:#087443;background:#ecfdf3;border-color:#abefc6}'],
})
export class FeedbackBannerComponent {
  @Input({ required: true }) message = '';
  @Input() kind: 'error' | 'success' = 'error';
}
