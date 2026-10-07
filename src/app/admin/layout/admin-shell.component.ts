import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionStore } from '../../core/session.store';
import { UiStore } from '../../core/ui.store';
import { AdminAccessStore } from '../data/admin-access.store';
import { AppIconComponent } from '../../ui/app-icon.component';
@Component({ selector: 'app-admin-shell', imports: [RouterLink, RouterLinkActive, RouterOutlet, AppIconComponent], styleUrl: '../admin.css', template: `
  <a class="skip-link" href="#admin-content">Pular para o conteúdo</a>
  <header class="admin-topbar"><button class="mobile-menu" aria-label="Abrir navegação" (click)="navigation.showModal()"><app-icon name="menu" /></button><a routerLink="/admin/acessos" class="brand">Orfina <span>Administração</span></a><div class="top-actions"><button (click)="toggleTheme()" aria-label="Alternar tema"><app-icon name="theme" /></button><details><summary>{{ session.user()?.name }}</summary><div class="user-popover"><a routerLink="/visao-geral">Voltar ao Orfina</a><button (click)="logout()">Sair</button></div></details></div></header>
  <div class="admin-layout"><nav class="admin-nav" aria-label="Administração"><a routerLink="/admin/acessos" routerLinkActive="active"><app-icon name="accounts" /> Acessos</a><a routerLink="/admin/auditoria" routerLinkActive="active"><app-icon name="spent" /> Auditoria</a></nav><main id="admin-content" class="admin-main"><router-outlet /></main></div>
  <dialog #navigation class="navigation-dialog" aria-label="Navegação administrativa"><button class="close-control" aria-label="Fechar navegação" (click)="navigation.close()"><app-icon name="close" /></button><nav aria-label="Administração móvel"><a routerLink="/admin/acessos" (click)="navigation.close()">Acessos</a><a routerLink="/admin/auditoria" (click)="navigation.close()">Auditoria</a></nav></dialog>
` })
export class AdminShellComponent implements OnDestroy {
  readonly session = inject(SessionStore); private readonly ui = inject(UiStore); private readonly router = inject(Router); private readonly store = inject(AdminAccessStore);
  @ViewChild('navigation', { static: true }) navigation!: ElementRef<HTMLDialogElement>;
  private readonly lost = () => { this.store.clear(); void this.router.navigateByUrl('/acesso-restrito'); };
  constructor() { document.documentElement.dataset['theme'] = this.ui.theme(); window.addEventListener('orfina-session-lost', this.lost); }
  toggleTheme() { this.ui.toggleTheme(); document.documentElement.dataset['theme'] = this.ui.theme(); }
  async logout() { try { await this.session.logout(); this.store.clear(); await this.router.navigateByUrl('/visao-geral'); } catch { this.store.feedback.set('Não foi possível sair. Tente novamente.'); } }
  ngOnDestroy() { window.removeEventListener('orfina-session-lost', this.lost); this.store.clear(); }
}
