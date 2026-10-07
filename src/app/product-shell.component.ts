import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { WorkspaceState } from './core/workspace-state.service';
import { AppShellComponent } from './layout/app-shell.component';

@Component({ selector: 'app-product-shell', imports: [RouterOutlet, AppShellComponent], templateUrl: './app.component.html', providers: [WorkspaceState] })
export class ProductShellComponent implements OnInit, OnDestroy {
  [key: string]: any;
  constructor(private readonly workspace: WorkspaceState, private readonly navigationRouter: Router) {
    return new Proxy(this, {
      get: (target, property, receiver) => typeof property === 'symbol' || Reflect.has(target, property) ? Reflect.get(target, property, receiver) : this.value(property),
      set: (target, property, value, receiver) => {
        if (Reflect.has(target, property)) return Reflect.set(target, property, value, receiver);
        (this.workspace as unknown as Record<PropertyKey, unknown>)[property] = value;
        return true;
      },
    });
  }
  private readonly sessionLost = () => { this.workspace.clearFinancialState(); void this.navigationRouter.navigateByUrl('/acesso-restrito'); };
  ngOnInit() { this.workspace.ngOnInit(); window.addEventListener('orfina-session-lost', this.sessionLost); }
  ngOnDestroy() { window.removeEventListener('orfina-session-lost', this.sessionLost); this.workspace.ngOnDestroy(); }
  private value(property: PropertyKey) {
    const value = (this.workspace as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === 'function' ? value.bind(this.workspace) : value;
  }
}
export interface ProductShellComponent extends WorkspaceState {}
