import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from '../ui/app-icon.component';
import { Theme } from '../models';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <header class="layout-topbar topbar" [class.authenticated]="authenticated">
      <div class="layout-topbar-logo-container topbar-start">
        <button *ngIf="authenticated" class="layout-menu-button layout-topbar-action mobile-menu-toggle" type="button" (click)="menuToggle.emit()" [attr.aria-expanded]="sidebarOpen" aria-controls="main-navigation" [attr.aria-label]="sidebarOpen ? 'Recolher menu principal' : 'Abrir menu principal'"><app-icon name="menu" /></button>
        <a class="layout-topbar-logo brand" href="/" aria-label="Orfina, início"><span class="brand-mark">or</span>fina</a>
      </div>
      <div *ngIf="authenticated" class="layout-topbar-actions topbar-actions">
        <button class="layout-topbar-action theme-action" type="button" (click)="themeToggle.emit()" [attr.aria-label]="theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"><app-icon [name]="theme === 'dark' ? 'sun' : 'moon'" /></button>
        <button *ngIf="authenticated" class="user-trigger" type="button" (click)="userMenuToggle.emit()" [attr.aria-expanded]="userMenuOpen" aria-haspopup="menu"><span class="avatar"><img *ngIf="userAvatarUrl" [src]="userAvatarUrl" alt="" referrerpolicy="no-referrer"><span *ngIf="!userAvatarUrl">{{ userInitial }}</span></span><span class="user-trigger-name">{{ userName }}</span><app-icon name="chevronDown" /></button>
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
  @Input() userAvatarUrl?: string;
  @Input() theme: Theme = 'light';
  @Output() readonly menuToggle = new EventEmitter<void>();
  @Output() readonly themeToggle = new EventEmitter<void>();
  @Output() readonly userMenuToggle = new EventEmitter<void>();
}
