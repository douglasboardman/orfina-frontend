import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Theme } from '../models';
import { AppIconComponent } from '../ui/app-icon.component';
import { NavigableWorkspaceView, WorkspaceView } from './workspace-view';

type NavigationItem = { view: NavigableWorkspaceView; label: string; icon: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <aside id="main-navigation" class="layout-sidebar app-sidebar" [class.open]="open" aria-label="Navegação principal">
      <button class="nav-item sidebar-toggle" type="button" (click)="menuToggle.emit()" [attr.aria-expanded]="open" aria-controls="main-navigation" [attr.aria-label]="open ? 'Recolher menu principal' : 'Abrir menu principal'" [title]="open ? 'Recolher menu principal' : 'Abrir menu principal'">
        <app-icon [name]="open ? 'chevronLeft' : 'menu'" />
        <span>Navegação</span>
      </button>
      <nav>
        <button *ngFor="let item of navigation" class="nav-item" [class.active]="activeView === item.view" [attr.aria-current]="activeView === item.view ? 'page' : null" type="button" [title]="item.label" (click)="navigate.emit(item.view)"><app-icon [name]="item.icon" /><span>{{ item.label }}</span></button>
      </nav>
      <div class="sidebar-lower">
        <small class="backend-version" [attr.aria-label]="backendVersion ? 'Versão ' + backendVersion : null">{{ backendVersion ? 'v.' + backendVersion : '' }}</small>
        <footer class="sidebar-footer">
          <button type="button" class="nav-item" (click)="themeToggle.emit()" [attr.aria-label]="theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"><app-icon [name]="theme === 'dark' ? 'sun' : 'moon'" /><span>{{ theme === 'dark' ? 'Modo claro' : 'Modo escuro' }}</span></button>
          <button type="button" class="nav-item" (click)="signOut.emit()" aria-label="Sair"><app-icon name="logout" /><span>Sair</span></button>
        </footer>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) activeView: WorkspaceView = 'overview';
  @Input({ required: true }) backendVersion?: string;
  @Input({ required: true }) open = false;
  @Input({ required: true }) theme: Theme = 'light';
  @Output() readonly navigate = new EventEmitter<NavigableWorkspaceView>();
  @Output() readonly menuToggle = new EventEmitter<void>();
  @Output() readonly themeToggle = new EventEmitter<void>();
  @Output() readonly signOut = new EventEmitter<void>();
  @Output() readonly quickCreate = new EventEmitter<void>();

  readonly navigation: NavigationItem[] = [
    { view: 'overview', label: 'Visão geral', icon: 'overview' },
    { view: 'accounts', label: 'Contas', icon: 'accounts' },
    { view: 'cards', label: 'Cartões', icon: 'cards' },
    { view: 'recurrences', label: 'Recorrências', icon: 'recurring' },
    { view: 'budget', label: 'Orçamento', icon: 'budget' },
    { view: 'goals', label: 'Metas', icon: 'goals' },
    { view: 'transactions', label: 'Lançamentos', icon: 'transactions' },
    { view: 'transfers', label: 'Transferências', icon: 'transfers' },
    { view: 'imports', label: 'Importações', icon: 'imports' },
    { view: 'categories', label: 'Categorias', icon: 'categories' },
  ];
}
