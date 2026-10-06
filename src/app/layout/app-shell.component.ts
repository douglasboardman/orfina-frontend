import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Household, HouseholdInvitation, Theme } from '../models';
import { HouseholdContextStore } from '../core/household-context.store';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { UserMenuComponent } from './user-menu.component';
import { NavigableWorkspaceView, WorkspaceView } from './workspace-view';
import { FeedbackBannerComponent } from '../ui/feedback-banner.component';
import { QuickCreateDialogComponent, QuickCreateKind } from '../ui/quick-create-dialog.component';

/**
 * Layout-only boundary for the authenticated application.
 *
 * Feature pages are projected into the content area. This keeps navigation,
 * identity and responsive sidebar behaviour out of page templates while the
 * feature migration proceeds without changing public URLs.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, TopbarComponent, SidebarComponent, UserMenuComponent, FeedbackBannerComponent, QuickCreateDialogComponent],
  template: `
    <main>
      <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
      <app-topbar [authenticated]="authenticated" [sidebarOpen]="sidebarOpen" [userMenuOpen]="userMenuOpen" [userInitial]="userInitial" [userName]="userName" (menuToggle)="menuToggle.emit()" (userMenuToggle)="userMenuToggle.emit()" />

      <section *ngIf="!authenticated" class="landing">
        <app-feedback-banner *ngIf="error" [message]="error"></app-feedback-banner>
        <p class="eyebrow">Orçamento e Finanças</p>
        <h1>Seu dinheiro, mais tranquilo.</h1>
        <p>Organize a vida financeira da sua família em um só lugar, com privacidade e clareza.</p>
        <button class="google-button" type="button" (click)="signIn.emit()">Continuar com Google</button>
      </section>

      <section *ngIf="authenticated" class="workspace">
        <button *ngIf="sidebarOpen" class="sidebar-scrim" type="button" (click)="menuToggle.emit()" aria-label="Fechar menu"></button>
        <app-sidebar [activeView]="activeView" [backendVersion]="backendVersion" [open]="sidebarOpen" [theme]="theme" (menuToggle)="menuToggle.emit()" (navigate)="navigate.emit($event)" (themeToggle)="themeToggle.emit()" (signOut)="signOut.emit()" (quickCreate)="quickCreate.emit()" />
        <div class="content-shell">
          <app-user-menu *ngIf="userMenuOpen" [userInitial]="userInitial" [userName]="userName" [activeHousehold]="activeHousehold" [households]="households" [invitations]="invitations" [canManageActiveHousehold]="canManageActiveHousehold" [loading]="loading" (profile)="profile.emit()" (householdSelected)="householdSelected.emit($event)" (createHousehold)="createHousehold.emit()" (configureGroup)="configureGroup.emit()" (acceptInvitation)="acceptInvitation.emit($event)" (signOut)="signOut.emit()" />
          <ng-content></ng-content>
        </div>
        <app-quick-create-dialog [open]="quickCreateOpen" (close)="quickCreateClose.emit()" (select)="quickCreateSelect.emit($event)" />
      </section>
    </main>
  `,
  styleUrl: '../app.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  @Input({ required: true }) authenticated = false;
  @Input({ required: true }) sidebarOpen = false;
  @Input({ required: true }) userMenuOpen = false;
  @Input({ required: true }) userInitial = '';
  @Input({ required: true }) userName = '';
  @Input({ required: true }) activeView: WorkspaceView = 'overview';
  @Input({ required: true }) theme: Theme = 'light';
  @Input() backendVersion?: string;
  @Input() activeHousehold?: Household;
  @Input() households: Household[] = [];
  @Input() invitations: HouseholdInvitation[] = [];
  @Input({ required: true }) canManageActiveHousehold = false;
  @Input({ required: true }) loading = false;
  @Input() error = '';
  @Input() quickCreateOpen = false;

  @Output() readonly menuToggle = new EventEmitter<void>();
  @Output() readonly userMenuToggle = new EventEmitter<void>();
  @Output() readonly navigate = new EventEmitter<NavigableWorkspaceView>();
  @Output() readonly themeToggle = new EventEmitter<void>();
  @Output() readonly signIn = new EventEmitter<void>();
  @Output() readonly signOut = new EventEmitter<void>();
  @Output() readonly profile = new EventEmitter<void>();
  @Output() readonly householdSelected = new EventEmitter<string>();
  @Output() readonly createHousehold = new EventEmitter<void>();
  @Output() readonly configureGroup = new EventEmitter<void>();
  @Output() readonly acceptInvitation = new EventEmitter<HouseholdInvitation>();
  @Output() readonly quickCreate = new EventEmitter<void>();
  @Output() readonly quickCreateClose = new EventEmitter<void>();
  @Output() readonly quickCreateSelect = new EventEmitter<QuickCreateKind>();
}
