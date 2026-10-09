import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { Household, HouseholdInvitation } from '../models';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuModule],
  template: `
    <aside class="user-menu profile-menu" aria-label="Menu do usuário">
      <div class="profile-menu-heading"><span class="avatar large"><img *ngIf="userAvatarUrl" [src]="userAvatarUrl" alt="" referrerpolicy="no-referrer"><span *ngIf="!userAvatarUrl">{{ userInitial }}</span></span><div><strong>{{ userName }}</strong><small>Conta Google conectada</small></div></div>
      <p-menu [model]="accountActions" styleClass="profile-menu-actions" />
      <div class="profile-menu-section">
        <p class="eyebrow">GRUPO FAMILIAR</p>
        <select [ngModel]="activeHousehold?.id" (ngModelChange)="householdSelected.emit($event)" aria-label="Selecionar grupo familiar"><option *ngFor="let household of households" [value]="household.id">{{ household.name }}</option></select>
        <div class="profile-menu-links"><button type="button" (click)="createHousehold.emit()"><i class="pi pi-plus"></i>Criar grupo familiar</button><button *ngIf="canManageActiveHousehold" type="button" (click)="configureGroup.emit()"><i class="pi pi-cog"></i>Configurar grupo</button></div>
        <div *ngIf="invitations.length" class="received-invitations"><p class="eyebrow">CONVITES RECEBIDOS</p><div *ngFor="let invitation of invitations" class="invitation-row"><span>{{ invitation.household?.name }}<small>{{ invitation.role === 'MANAGER' ? 'Gestor financeiro' : invitation.role === 'VIEWER' ? 'Somente leitura' : 'Pode lançar' }}</small></span><button type="button" (click)="acceptInvitation.emit(invitation)" [disabled]="loading">Aceitar</button></div></div>
      </div>
    </aside>
  `,
  styleUrl: './user-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  @Input() isSystemAdmin = false;
  @Input({ required: true }) userInitial = '';
  @Input({ required: true }) userName = '';
  @Input() userAvatarUrl?: string;
  @Input() activeHousehold?: Household;
  @Input({ required: true }) households: Household[] = [];
  @Input({ required: true }) invitations: HouseholdInvitation[] = [];
  @Input({ required: true }) canManageActiveHousehold = false;
  @Input({ required: true }) loading = false;
  @Output() readonly profile = new EventEmitter<void>();
  @Output() readonly householdSelected = new EventEmitter<string>();
  @Output() readonly createHousehold = new EventEmitter<void>();
  @Output() readonly configureGroup = new EventEmitter<void>();
  @Output() readonly acceptInvitation = new EventEmitter<HouseholdInvitation>();
  @Output() readonly signOut = new EventEmitter<void>();

  get accountActions(): MenuItem[] {
    return [
      { label: 'Perfil e preferências', icon: 'pi pi-user', command: () => this.profile.emit() },
      ...(this.isSystemAdmin ? [{ label: 'Administração do sistema', icon: 'pi pi-shield', routerLink: '/admin/acessos' }] : []),
      { separator: true },
      { label: 'Sair', icon: 'pi pi-sign-out', styleClass: 'profile-menu-sign-out', command: () => this.signOut.emit() },
    ];
  }
}
