import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from '../ui/app-icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <header class="topbar" [class.authenticated]="authenticated">
      <div class="topbar-start">
        <a class="brand" href="/" aria-label="Orfina, início"><span>or</span>fina</a>
      </div>
      <div class="topbar-actions">
        <button *ngIf="authenticated" class="mobile-menu-toggle" type="button" (click)="menuToggle.emit()" [attr.aria-expanded]="sidebarOpen" aria-controls="main-navigation" [attr.aria-label]="sidebarOpen ? 'Fechar menu principal' : 'Abrir menu principal'" [title]="sidebarOpen ? 'Fechar menu principal' : 'Abrir menu principal'"><app-icon name="menu" /></button>
        <button *ngIf="authenticated" class="user-trigger" type="button" (click)="userMenuToggle.emit()" [attr.aria-expanded]="userMenuOpen" aria-haspopup="menu"><span class="avatar">{{ userInitial }}</span><span class="user-trigger-name">{{ userName }}</span><app-icon name="chevronDown" /></button>
      </div>
    </header>
  `,
  styleUrl: './topbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  @Input({ required: true }) authenticated = false;
  @Input({ required: true }) sidebarOpen = false;
  @Input({ required: true }) userMenuOpen = false;
  @Input({ required: true }) userInitial = '';
  @Input({ required: true }) userName = '';
  @Output() readonly menuToggle = new EventEmitter<void>();
  @Output() readonly userMenuToggle = new EventEmitter<void>();
}
