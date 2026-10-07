import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionStore } from '../core/session.store';
@Component({ selector: 'app-access-restricted', imports: [RouterLink], styleUrl: './admin.css', template: `
  <main class="restricted"><a routerLink="/visao-geral" class="brand">Orfina</a><h1>{{ connectionError ? 'Não foi possível verificar a conexão' : 'Acesso restrito' }}</h1><p>{{ connectionError ? 'Tente novamente para verificar sua sessão. Seu acesso não foi alterado.' : 'O acesso ao Orfina está restrito a usuários autorizados. Solicite a liberação ao administrador.' }}</p><div class="dialog-actions"><a class="button" routerLink="/visao-geral">Voltar</a>@if (connectionError) { <a class="button primary" routerLink="/admin/acessos">Tentar novamente</a> }@else { <button class="primary" (click)="signIn()">Entrar com outra conta Google</button> }</div></main>
` })
export class AccessRestrictedComponent {
  private readonly session = inject(SessionStore); readonly connectionError = inject(ActivatedRoute).snapshot.data['connectionError'] === true;
  constructor() { if (!this.connectionError) this.session.clear(); }
  async signIn() { try { await this.session.logout(); } catch { /* The callback also clears stale cookies. */ } this.session.beginGoogleSignIn(); }
}
