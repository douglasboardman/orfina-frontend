import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardNetwork, cardNetworks } from '../financial-brands';

/** Renders the locally bundled payment-network mark for a persisted card network. */
@Component({
  selector: 'app-card-network-logo',
  standalone: true,
  template: '<img [src]="brand.logoUrl" [alt]="brand.name" [class.compact]="size === \'compact\'">',
  styles: [':host{display:inline-flex;align-items:center;flex:none;line-height:0}:host img{display:block;width:64px;height:41px;object-fit:contain}:host img.compact{width:42px;height:27px}:host-context(html[data-theme="dark"]) img{filter:invert(1)}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardNetworkLogoComponent {
  @Input({ required: true }) network: CardNetwork = 'OTHER';
  @Input() size: 'default' | 'compact' = 'default';

  get brand() { return cardNetworks[this.network]; }
}
