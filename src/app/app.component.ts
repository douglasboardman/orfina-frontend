import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceState } from './core/workspace-state.service';
import { AppShellComponent } from './layout/app-shell.component';

@Component({ selector: 'app-root', imports: [RouterOutlet, AppShellComponent], templateUrl: './app.component.html' })
export class AppComponent implements OnInit {
  [key: string]: any;
  constructor(private readonly workspace: WorkspaceState) {
    return new Proxy(this, {
      get: (target, property, receiver) => typeof property === 'symbol' || Reflect.has(target, property) ? Reflect.get(target, property, receiver) : this.value(property),
      set: (target, property, value, receiver) => {
        if (Reflect.has(target, property)) return Reflect.set(target, property, value, receiver);
        (this.workspace as unknown as Record<PropertyKey, unknown>)[property] = value;
        return true;
      },
    });
  }
  ngOnInit() { this.workspace.ngOnInit(); }
  private value(property: PropertyKey) {
    const value = (this.workspace as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === 'function' ? value.bind(this.workspace) : value;
  }
}
export interface AppComponent extends WorkspaceState {}
