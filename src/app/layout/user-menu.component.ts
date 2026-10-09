import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Household, HouseholdInvitation } from '../models';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="user-menu" role="menu">
      <div class="user-menu-heading"><span class="avatar large"><img *ngIf="userAvatarUrl" [src]="userAvatarUrl" alt="" referrerpolicy="no-referrer"><span *ngIf="!userAvatarUrl">{{ userInitial }}</span></span><div><strong>{{ userName }}</strong><small>Conta Google conectada</small></div></div>
      <button type="button" class="user-menu-item" (click)="profile.emit()">Perfil e preferências</button>
      <a *ngIf="isSystemAdmin" class="user-menu-item" routerLink="/admin/acessos">Administração do sistema</a>
      <div class="user-menu-section">
        <p class="eyebrow">GRUPO FAMILIAR</p>
        <select [ngModel]="activeHousehold?.id" (ngModelChange)="householdSelected.emit($event)" aria-label="Selecionar grupo familiar"><option *ngFor="let household of households" [value]="household.id">{{ household.name }}</option></select>
        <button class="user-menu-item manage-group-button" type="button" (click)="createHousehold.emit()">Criar grupo familiar</button>
        <button *ngIf="canManageActiveHousehold" class="user-menu-item manage-group-button" type="button" (click)="configureGroup.emit()">Configurar grupo</button>
        <div *ngIf="invitations.length" class="received-invitations"><p class="eyebrow">CONVITES RECEBIDOS</p><div *ngFor="let invitation of invitations" class="invitation-row"><span>{{ invitation.household?.name }}<small>{{ invitation.role === 'MANAGER' ? 'Gestor financeiro' : invitation.role === 'VIEWER' ? 'Somente leitura' : 'Pode lançar' }}</small></span><button type="button" (click)="acceptInvitation.emit(invitation)" [disabled]="loading">Aceitar</button></div></div>
      </div>
      <button type="button" class="user-menu-item danger" (click)="signOut.emit()">Sair</button>
    </div>
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
}
