import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AppIconComponent } from './app-icon.component';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <button class="drawer-scrim" type="button" aria-label="Fechar painel" (click)="close.emit()"></button>
      <aside #panel class="drawer" role="dialog" aria-modal="true" [attr.aria-label]="label" tabindex="-1">
        <header><h2>{{ label }}</h2><button class="icon-control" type="button" (click)="close.emit()" aria-label="Fechar"><app-icon name="close" /></button></header>
        <ng-content />
      </aside>
    }
  `,
  styles: `
    :host { display: contents; }
    .drawer-scrim { position: fixed; z-index: 100; inset: 0; border: 0; background: rgb(17 24 39 / 48%); cursor: default; }
    .drawer { box-sizing: border-box; position: fixed; z-index: 101; top: 50%; left: 50%; width: min(780px, calc(100vw - 48px)); max-height: calc(100dvh - 48px); overflow: auto; padding: 24px; transform: translate(-50%, -50%); background: var(--surface); border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow-lg); }
    .drawer > header { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 42px; margin-bottom: 20px; }
    .drawer > header h2 { margin: 0; font-size: 1.25rem; letter-spacing: -.4px; }
    .icon-control { display: inline-grid; flex: 0 0 auto; place-items: center; width: 42px; height: 42px; padding: 0; color: var(--ink); background: transparent; border: 1px solid var(--line); border-radius: 9px; }
    .icon-control:hover { color: var(--brand); border-color: var(--brand); }
    .icon-control app-icon { width: 1rem; height: 1rem; }
    @media (max-width: 600px) { .drawer { width: calc(100vw - 24px); max-height: calc(100dvh - 24px); padding: 16px; border-radius: 14px; } .drawer > header { margin-bottom: 16px; } }
  `,
})
export class DrawerComponent implements AfterViewInit {
  @Input() open = false;
  @Input({ required: true }) label = 'Painel';
  @Output() readonly close = new EventEmitter<void>();
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  ngAfterViewInit() { queueMicrotask(() => this.panel?.nativeElement.focus()); }
  @HostListener('document:keydown.escape') onEscape() { if (this.open) this.close.emit(); }
}
