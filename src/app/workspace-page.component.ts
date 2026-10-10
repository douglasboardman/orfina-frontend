import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { ButtonDirective } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { WorkspaceState } from './core/workspace-state.service';
import { AppIconComponent } from './ui/app-icon.component';
import { DrawerComponent } from './ui/drawer.component';
import { EmptyStateComponent } from './ui/empty-state.component';
import { FeedbackBannerComponent } from './ui/feedback-banner.component';
import { CardNetworkLogoComponent } from './ui/card-network-logo.component';
import { CurrencyInputDirective } from './ui/currency-input.directive';
import { ChipAutocompleteComponent } from './ui/chip-autocomplete.component';
import { FinancialEntryFormComponent } from './ui/financial-entry-form.component';

/**
 * Routed content boundary for the current workspace. It deliberately owns no
 * financial state: the parent application provides the transition state while
 * feature facades are extracted. Keeping this boundary route-mounted makes
 * browser navigation, direct links and cancellation semantics real instead of
 * treating the router as a view selector.
 */
@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, Panel, ButtonDirective, ButtonGroup, EmptyStateComponent, FeedbackBannerComponent, AppIconComponent, DrawerComponent, CardNetworkLogoComponent, CurrencyInputDirective, ChipAutocompleteComponent, FinancialEntryFormComponent],
  templateUrl: './workspace-page.component.html',
})
export class WorkspacePageComponent {
  /** Lets the existing feature markup consume the parent transition state. */
  [key: string]: any;

  private readonly application = inject(WorkspaceState);

  constructor() {
    return new Proxy(this, {
      get: (target, property, receiver) => {
        if (typeof property === 'symbol' || Reflect.has(target, property)) return Reflect.get(target, property, receiver);
        const value = (this.application as unknown as Record<PropertyKey, unknown>)[property];
        return typeof value === 'function' ? value.bind(this.application) : value;
      },
      set: (target, property, value, receiver) => {
        if (Reflect.has(target, property)) return Reflect.set(target, property, value, receiver);
        (this.application as unknown as Record<PropertyKey, unknown>)[property] = value;
        return true;
      },
    });
  }
}

/**
 * The routed page exposes the public transition API of its application host.
 * This is declaration-only: values are still resolved by the proxy above
 * until each feature receives its own facade.
 */
export interface WorkspacePageComponent extends WorkspaceState {}
