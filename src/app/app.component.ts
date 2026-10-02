import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { Account, AccountTransfer, AccountType, BudgetSummary, Card, CardStatement, Category, Household, HouseholdInvitation, HouseholdMember, ImportBatch, InstallmentPurchase, Overview, RecurringRule, SavingsGoal, Theme, Transaction, TransactionFilters, TransactionStatus, TransactionType } from './models';
import { bankLogoUrlFor, brazilianBanks, cardNetworks, CardNetwork } from './financial-brands';
import { EmptyStateComponent } from './ui/empty-state.component';
import { FeedbackBannerComponent } from './ui/feedback-banner.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterOutlet, EmptyStateComponent, FeedbackBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  theme: Theme = (localStorage.getItem('orfina.theme') as Theme) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  households: Household[] = [];
  householdMembers: HouseholdMember[] = [];
  householdInvitations: HouseholdInvitation[] = [];
  myHouseholdInvitations: HouseholdInvitation[] = [];
  activeHousehold?: Household;
  overview?: Overview;
  accounts: Account[] = [];
  cards: Card[] = [];
  cardStatements: CardStatement[] = [];
  selectedCard?: Card;
  recurringRules: RecurringRule[] = [];
  installmentPurchases: InstallmentPurchase[] = [];
  budgetSummary?: BudgetSummary;
  savingsGoals: SavingsGoal[] = [];
  transfers: AccountTransfer[] = [];
  importBatches: ImportBatch[] = [];
  importPreview?: ImportBatch;
  categories: Category[] = [];
  transactions: Transaction[] = [];
  transactionTotal = 0;
  transactionPage = 1;
  readonly transactionPageSize = 20;
  currentUser?: { id: string; email: string; name: string };
  error = '';
  loading = false;
  sidebarOpen = false;
  userMenuOpen = false;
  householdManagementOpen = false;
  activeView: 'overview' | 'accounts' | 'cards' | 'categories' | 'transactions' | 'recurrences' | 'budget' | 'goals' | 'transfers' | 'imports' = 'overview';
  readonly brazilianBanks = brazilianBanks;
  readonly cardNetworks = cardNetworks;
  householdName = '';
  readonly categoryIcons = [
    { value: 'sell', label: 'Etiqueta' },
    { value: 'payments', label: 'Dinheiro em espécie' },
    { value: 'account_balance', label: 'Banco' },
    { value: 'account_balance_wallet', label: 'Carteira' },
    { value: 'credit_card', label: 'Cartão' },
    { value: 'savings', label: 'Poupança' },
    { value: 'trending_up', label: 'Investimento' },
    { value: 'paid', label: 'Recebimento' },
    { value: 'swap_horiz', label: 'Transferência' },
    { value: 'receipt_long', label: 'Recibo' },
    { value: 'shopping_cart', label: 'Mercado' },
    { value: 'shopping_bag', label: 'Aquisições' },
    { value: 'restaurant', label: 'Alimentação' },
    { value: 'home', label: 'Moradia' },
    { value: 'directions_car', label: 'Transporte' },
    { value: 'directions_bus', label: 'Ônibus e metrô' },
    { value: 'local_gas_station', label: 'Combustível' },
    { value: 'medical_services', label: 'Saúde' },
    { value: 'ecg_heart', label: 'Coração e saúde' },
    { value: 'school', label: 'Educação' },
    { value: 'menu_book', label: 'Livro aberto' },
    { value: 'work', label: 'Trabalho' },
    { value: 'flight', label: 'Viagem' },
    { value: 'celebration', label: 'Lazer' },
    { value: 'beach_access', label: 'Praia e lazer' },
    { value: 'cake', label: 'Celebração' },
    { value: 'card_giftcard', label: 'Presente' },
    { value: 'star_outline', label: 'Prêmio' },
    { value: 'real_estate_agent', label: 'Aluguel' },
    { value: 'handshake', label: 'Empréstimo' },
    { value: 'phone_iphone', label: 'Telefone' },
    { value: 'wifi', label: 'Internet' },
    { value: 'bolt', label: 'Energia' },
    { value: 'water_drop', label: 'Água' },
    { value: 'pets', label: 'Pets' },
    { value: 'child_care', label: 'Filhos' },
    { value: 'construction', label: 'Construção e manutenção' },
    { value: 'church', label: 'Igreja' },
    { value: 'more_horiz', label: 'Outros' },
  ] as const;
  invitationForm: { email: string; role: 'MEMBER' | 'VIEWER' } = { email: '', role: 'MEMBER' };
  accountForm: { name: string; type: AccountType; bankName: string; bankLogoUrl: string; initialBalance: number } = { name: '', type: 'CHECKING', bankName: '', bankLogoUrl: '', initialBalance: 0 };
  cardForm: { name: string; issuerName: string; issuerLogoUrl: string; network: CardNetwork; lastFour: string; creditLimit: number | null; closingDay: number; dueDay: number } = { name: '', issuerName: '', issuerLogoUrl: '', network: 'VISA', lastFour: '', creditLimit: null, closingDay: 1, dueDay: 10 };
  recurringForm: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; startOn: string; endOn: string } = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
  installmentForm: { cardId: string; subcategoryId: string; type: TransactionType; totalAmount: number; installmentCount: number; description: string; firstOccurredOn: string } = { cardId: '', subcategoryId: '', type: 'EXPENSE', totalAmount: 0, installmentCount: 2, description: '', firstOccurredOn: new Date().toISOString().slice(0, 10) };
  budgetMonth = new Date().toISOString().slice(0, 7);
  budgetForm: { categoryId: string; limitAmount: number; notes: string } = { categoryId: '', limitAmount: 0, notes: '' };
  goalForm: { name: string; targetAmount: number; targetDate: string; color: string; icon: string } = { name: '', targetAmount: 0, targetDate: '', color: '#5B5BD6', icon: 'flag' };
  categoryForm: { name: string; type: TransactionType; color: string; icon: string } = { name: '', type: 'EXPENSE', color: '#5B5BD6', icon: 'sell' };
  subcategoryForm: { categoryId: string; name: string } = { categoryId: '', name: '' };
  editingAccountId?: string;
  editingCardId?: string;
  editingCategoryId?: string;
  editingSubcategoryId?: string;
  editingTransactionId?: string;
  transactionForm: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes: string } = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
  transactionFilters: Omit<TransactionFilters, 'page' | 'pageSize'> = { from: '', to: '', accountId: '', categoryId: '', subcategoryId: '', type: undefined, status: undefined, importBatchId: '' };
  transferForm: { sourceAccountId: string; destinationAccountId: string; amount: number; occurredOn: string; description: string; status: 'PENDING' | 'POSTED' } = { sourceAccountId: '', destinationAccountId: '', amount: 0, occurredOn: new Date().toISOString().slice(0, 10), description: '', status: 'POSTED' };
  importForm: { accountId: string; file?: File } = { accountId: '' };

  constructor(private readonly api: ApiService, private readonly changeDetector: ChangeDetectorRef, private readonly router: Router) {}

  ngOnInit() {
    document.documentElement.dataset['theme'] = this.theme;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.syncViewFromUrl(event.urlAfterRedirects);
    });
    this.syncViewFromUrl(this.router.url);
    void this.initialize();
  }

  get authenticated() { return Boolean(this.currentUser); }
  get canManageActiveHousehold() {
    const role = this.activeHousehold?.members[0]?.role;
    return role === 'OWNER' || role === 'ADMIN';
  }
  get currency() { return this.activeHousehold?.currency ?? 'BRL'; }
  get filteredSubcategories() {
    return this.categories
      .filter((category) => category.isActive && category.type === this.transactionForm.type)
      .flatMap((category) => category.subcategories
        .filter((subcategory) => subcategory.isActive)
        .map((subcategory) => ({ ...subcategory, category })));
  }
  get recurringSubcategories() {
    return this.categories
      .filter((category) => category.isActive && category.type === this.recurringForm.type)
      .flatMap((category) => category.subcategories.filter((subcategory) => subcategory.isActive).map((subcategory) => ({ ...subcategory, category })));
  }
  get expenseCategories() { return this.categories.filter((category) => category.type === 'EXPENSE'); }
  get incomeCategories() { return this.categories.filter((category) => category.type === 'INCOME'); }
  get budgetCategories() { return this.categories.filter((category) => category.type === 'EXPENSE' && category.isActive); }
  get displayedTransactions() { return this.activeView === 'transactions' ? this.transactions : this.overview?.recentTransactions ?? []; }
  get transactionPageCount() { return Math.max(1, Math.ceil(this.transactionTotal / this.transactionPageSize)); }
  get filterSubcategories() {
    const category = this.categories.find((item) => item.id === this.transactionFilters.categoryId);
    return category?.subcategories.filter((subcategory) => subcategory.isActive) ?? [];
  }
  get displayedAccounts() { return this.activeView === 'accounts' ? this.accounts : this.overview?.accounts ?? []; }
  get viewTitle() {
    if (this.activeView === 'imports') return 'Importações';
    if (this.activeView === 'transfers') return 'Transferências';
    if (this.activeView === 'accounts') return 'Contas';
    if (this.activeView === 'cards') return 'Cartões';
    if (this.activeView === 'recurrences') return 'Recorrências';
    if (this.activeView === 'budget') return 'Orçamento';
    if (this.activeView === 'goals') return 'Metas';
    if (this.activeView === 'categories') return 'Categorias';
    if (this.activeView === 'transactions') return 'Lançamentos';
    return `Olá, família ${this.activeHousehold?.name ?? ''}`;
  }
  get viewEyebrow() { return this.activeView === 'overview' ? 'VISÃO GERAL' : this.activeView.toUpperCase(); }
  get userName() {
    return this.currentUser?.name || 'Minha conta';
  }
  get userInitial() { return this.userName.slice(0, 1).toUpperCase(); }
  categoryIconLabel(icon: string) { return this.categoryIcons.find((item) => item.value === icon)?.label ?? icon; }
  bankLogoUrl(bankName?: string, fallback?: string) { return bankLogoUrlFor(bankName, fallback); }

  switchTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('orfina.theme', this.theme);
    document.documentElement.dataset['theme'] = this.theme;
    this.render();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.render();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.render();
  }

  selectView(view: 'overview' | 'accounts' | 'cards' | 'categories' | 'transactions' | 'recurrences' | 'budget' | 'goals' | 'transfers' | 'imports') {
    this.activeView = view;
    this.sidebarOpen = false;
    this.userMenuOpen = false;
    void this.router.navigateByUrl({ overview: '/visao-geral', accounts: '/contas', cards: '/cartoes', categories: '/categorias', transactions: '/lancamentos', recurrences: '/recorrencias', budget: '/orcamento', goals: '/metas', transfers: '/transferencias', imports: '/importacoes' }[view]);
    this.render();
  }

  signIn() { location.assign('http://localhost:3000/api/auth/google'); }
  async signOut() {
    this.loading = true;
    this.error = '';

    try {
      await this.api.logout();
      localStorage.removeItem('orfina.active-household');
      this.currentUser = undefined;
      this.households = [];
      this.activeHousehold = undefined;
      this.overview = undefined;
      this.accounts = [];
      this.cards = [];
      this.categories = [];
      this.transactions = [];
      this.transactionTotal = 0;
      this.householdMembers = [];
      this.householdInvitations = [];
      this.myHouseholdInvitations = [];
      this.userMenuOpen = false;
      this.householdManagementOpen = false;
      this.sidebarOpen = false;
      this.activeView = 'overview';
      await this.router.navigateByUrl('/visao-geral');
    } catch (error: unknown) {
      this.error = error instanceof Error
        ? `Não foi possível encerrar a sessão (${error.message})`
        : 'Não foi possível encerrar a sessão. Tente novamente.';
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async initialize() {
    try {
      this.currentUser = await this.api.me();
      this.changeDetector.detectChanges();
    } catch (error: unknown) {
      this.currentUser = undefined;
      this.error = error instanceof Error ? `Não foi possível restaurar a sessão (${error.message})` : 'Não foi possível restaurar a sessão.';
      return;
    }
    await this.run(async () => {
      this.households = await this.api.getHouseholds();
      this.myHouseholdInvitations = await this.api.myHouseholdInvitations();
      const saved = localStorage.getItem('orfina.active-household');
      this.activeHousehold = this.households.find((item) => item.id === saved) ?? this.households[0];
      if (this.activeHousehold) await this.loadDashboard();
    });
  }

  async selectHousehold(id: string) {
    this.activeHousehold = this.households.find((item) => item.id === id);
    if (this.activeHousehold) {
      localStorage.setItem('orfina.active-household', id);
      this.householdManagementOpen = false;
      this.householdMembers = [];
      this.householdInvitations = [];
      await this.run(() => this.loadDashboard());
    }
  }

  async createHousehold() {
    if (!this.householdName.trim()) return;
    await this.run(async () => {
      const household = await this.api.createHousehold(this.householdName);
      this.households = [...this.households, household];
      this.householdName = '';
      await this.selectHousehold(household.id);
    });
  }

  async toggleHouseholdManagement() {
    if (!this.canManageActiveHousehold) return;
    this.householdManagementOpen = !this.householdManagementOpen;
    if (this.householdManagementOpen) await this.run(() => this.loadHouseholdManagement());
    else this.render();
  }

  async createHouseholdInvitation() {
    if (!this.activeHousehold || !this.invitationForm.email.trim()) return;
    await this.run(async () => {
      await this.api.createHouseholdInvitation(this.activeHousehold!.id, this.invitationForm);
      this.invitationForm = { email: '', role: 'MEMBER' };
      await this.loadHouseholdManagement();
    });
  }

  async revokeHouseholdInvitation(invitation: HouseholdInvitation) {
    if (!this.activeHousehold || !confirm(`Revogar o convite para ${invitation.email}?`)) return;
    await this.run(async () => {
      await this.api.revokeHouseholdInvitation(this.activeHousehold!.id, invitation.id);
      await this.loadHouseholdManagement();
    });
  }

  async acceptHouseholdInvitation(invitation: HouseholdInvitation) {
    await this.run(async () => {
      await this.api.acceptHouseholdInvitation(invitation.id);
      this.myHouseholdInvitations = await this.api.myHouseholdInvitations();
      this.households = await this.api.getHouseholds();
      this.activeHousehold = this.households.find((item) => item.id === invitation.householdId) ?? this.activeHousehold;
      if (this.activeHousehold) {
        localStorage.setItem('orfina.active-household', this.activeHousehold.id);
        await this.loadDashboard();
      }
    });
  }

  async saveAccount() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const data = { ...this.accountForm, bankName: this.accountForm.bankName || undefined, bankLogoUrl: this.accountForm.bankLogoUrl || undefined, initialBalance: Math.round(this.accountForm.initialBalance * 100) };
      if (this.editingAccountId) await this.api.updateAccount(this.activeHousehold!.id, this.editingAccountId, data);
      else await this.api.createAccount(this.activeHousehold!.id, data);
      this.cancelAccountEdit();
      await this.loadDashboard();
    });
  }

  editAccount(account: Account) {
    this.editingAccountId = account.id;
    this.accountForm = { name: account.name, type: account.type, bankName: account.bankName ?? '', bankLogoUrl: bankLogoUrlFor(account.bankName, account.bankLogoUrl) ?? '', initialBalance: account.initialBalance / 100 };
    this.render();
  }

  async viewAccountTransactions(account: Account) {
    this.transactionFilters = { from: '', to: '', accountId: account.id, categoryId: '', subcategoryId: '', type: undefined };
    this.selectView('transactions');
    await this.applyTransactionFilters();
  }

  cancelAccountEdit() {
    this.editingAccountId = undefined;
    this.accountForm = { name: '', type: 'CHECKING', bankName: '', bankLogoUrl: '', initialBalance: 0 };
  }

  async setAccountStatus(account: Account, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a conta ${account.name}?`)) return;
    await this.run(async () => {
      await this.api.setAccountStatus(this.activeHousehold!.id, account.id, isActive);
      await this.loadDashboard();
    });
  }

  selectBank(name: string) {
    const bank = this.brazilianBanks.find((item) => item.name === name);
    this.accountForm.bankName = name;
    this.accountForm.bankLogoUrl = bank?.logoUrl ?? '';
  }

  selectCardIssuer(name: string) {
    const bank = this.brazilianBanks.find((item) => item.name === name);
    this.cardForm.issuerName = name;
    this.cardForm.issuerLogoUrl = bank?.logoUrl ?? '';
  }

  async saveCard() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const data = { ...this.cardForm, issuerName: this.cardForm.issuerName || undefined, issuerLogoUrl: this.cardForm.issuerLogoUrl || undefined, lastFour: this.cardForm.lastFour || undefined, creditLimit: this.cardForm.creditLimit === null ? undefined : Math.round(this.cardForm.creditLimit * 100) };
      if (this.editingCardId) await this.api.updateCard(this.activeHousehold!.id, this.editingCardId, data);
      else await this.api.createCard(this.activeHousehold!.id, data);
      this.cancelCardEdit();
      this.cards = await this.api.cards(this.activeHousehold!.id);
    });
  }

  editCard(card: Card) {
    this.editingCardId = card.id;
    this.cardForm = { name: card.name, issuerName: card.issuerName ?? '', issuerLogoUrl: bankLogoUrlFor(card.issuerName, card.issuerLogoUrl) ?? '', network: card.network, lastFour: card.lastFour ?? '', creditLimit: card.creditLimit === undefined ? null : card.creditLimit / 100, closingDay: card.closingDay, dueDay: card.dueDay };
    this.render();
  }

  cancelCardEdit() { this.editingCardId = undefined; this.cardForm = { name: '', issuerName: '', issuerLogoUrl: '', network: 'VISA', lastFour: '', creditLimit: null, closingDay: 1, dueDay: 10 }; }

  async selectCard(card: Card) {
    if (!this.activeHousehold) return;
    await this.run(async () => { this.selectedCard = card; this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, card.id); });
  }

  async closeStatement(statement: CardStatement) {
    if (!this.activeHousehold || !confirm('Fechar esta fatura? Ajustes posteriores deverão ser rastreáveis.')) return;
    await this.run(async () => { await this.api.closeStatement(this.activeHousehold!.id, statement.id); if (this.selectedCard) this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, this.selectedCard.id); });
  }

  async payStatement(statement: CardStatement) {
    if (!this.activeHousehold) return;
    const accountId = this.accounts.find((account) => account.isActive)?.id;
    if (!accountId) { this.error = 'Cadastre uma conta ativa para pagar a fatura.'; return; }
    const amountText = prompt('Valor do pagamento (R$):', ((statement.totalAmount - statement.payments.reduce((sum, payment) => sum + payment.amount, 0)) / 100).toFixed(2).replace('.', ','));
    if (!amountText) return;
    const amount = Number(amountText.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) { this.error = 'Informe um valor de pagamento válido.'; return; }
    await this.run(async () => {
      await this.api.payStatement(this.activeHousehold!.id, statement.id, { accountId, amount: Math.round(amount * 100), paidOn: new Date().toISOString().slice(0, 10), idempotencyKey: crypto.randomUUID() });
      if (this.selectedCard) this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, this.selectedCard.id);
      await this.loadDashboard();
    });
  }

  onRecurringSourceChange() { this.recurringForm.accountId = ''; this.recurringForm.cardId = ''; }
  onRecurringTypeChange() { this.recurringForm.subcategoryId = ''; }
  async saveRecurringRule() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const { sourceType, ...form } = this.recurringForm;
      await this.api.createRecurringRule(this.activeHousehold!.id, { ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, amount: Math.round(form.amount * 100), endOn: form.endOn || undefined });
      this.recurringForm = { sourceType: 'ACCOUNT', accountId: this.accounts.find((account) => account.isActive)?.id ?? '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
      this.recurringRules = await this.api.recurringRules(this.activeHousehold!.id);
    });
  }
  async setRecurringRuleStatus(rule: RecurringRule, status: 'ACTIVE' | 'PAUSED' | 'ENDED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setRecurringRuleStatus(this.activeHousehold!.id, rule.id, status); this.recurringRules = await this.api.recurringRules(this.activeHousehold!.id); });
  }

  onInstallmentTypeChange() { this.installmentForm.subcategoryId = ''; }
  get installmentSubcategories() {
    return this.categories.filter((category) => category.isActive && category.type === this.installmentForm.type)
      .flatMap((category) => category.subcategories.filter((subcategory) => subcategory.isActive).map((subcategory) => ({ ...subcategory, category })));
  }
  async saveInstallmentPurchase() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      await this.api.createInstallmentPurchase(this.activeHousehold!.id, { ...this.installmentForm, totalAmount: Math.round(this.installmentForm.totalAmount * 100) });
      this.installmentForm = { cardId: '', subcategoryId: '', type: 'EXPENSE', totalAmount: 0, installmentCount: 2, description: '', firstOccurredOn: new Date().toISOString().slice(0, 10) };
      this.installmentPurchases = await this.api.installmentPurchases(this.activeHousehold!.id);
      await this.loadDashboard();
    });
  }
  async cancelFutureInstallments(purchase: InstallmentPurchase) {
    if (!this.activeHousehold || !confirm(`Cancelar as parcelas futuras de ${purchase.description}?`)) return;
    await this.run(async () => { await this.api.cancelFutureInstallments(this.activeHousehold!.id, purchase.id); this.installmentPurchases = await this.api.installmentPurchases(this.activeHousehold!.id); await this.loadDashboard(); });
  }

  async loadBudget() {
    if (!this.activeHousehold) return;
    this.budgetSummary = await this.api.budgetSummary(this.activeHousehold.id, this.budgetMonth);
  }

  async changeBudgetMonth() { await this.run(() => this.loadBudget()); }
  async saveBudget() {
    if (!this.activeHousehold || !this.budgetForm.categoryId) return;
    await this.run(async () => {
      await this.api.upsertBudget(this.activeHousehold!.id, this.budgetMonth, { categoryId: this.budgetForm.categoryId, limitAmount: Math.round(this.budgetForm.limitAmount * 100), notes: this.budgetForm.notes || undefined });
      this.budgetForm = { categoryId: '', limitAmount: 0, notes: '' };
      await this.loadBudget();
    });
  }
  async deleteBudget(categoryId: string) {
    if (!this.activeHousehold || !confirm('Remover este limite do mês?')) return;
    await this.run(async () => { await this.api.deleteBudget(this.activeHousehold!.id, this.budgetMonth, categoryId); await this.loadBudget(); });
  }
  async copyPreviousBudget() {
    if (!this.activeHousehold) return;
    const [year, month] = this.budgetMonth.split('-').map(Number);
    const sourceMonth = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
    await this.run(async () => { await this.api.copyBudgets(this.activeHousehold!.id, sourceMonth, this.budgetMonth); await this.loadBudget(); });
  }
  async setBudgetClosed(closed: boolean) {
    if (!this.activeHousehold || !confirm(closed ? 'Encerrar este orçamento? O snapshot ficará somente leitura.' : 'Reabrir este orçamento?')) return;
    await this.run(async () => { await this.api.setBudgetMonthClosed(this.activeHousehold!.id, this.budgetMonth, closed); await this.loadBudget(); });
  }
  async saveGoal() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      await this.api.createGoal(this.activeHousehold!.id, { ...this.goalForm, targetAmount: Math.round(this.goalForm.targetAmount * 100), targetDate: this.goalForm.targetDate || undefined, icon: this.goalForm.icon || undefined });
      this.goalForm = { name: '', targetAmount: 0, targetDate: '', color: '#5B5BD6', icon: 'flag' };
      this.savingsGoals = await this.api.goals(this.activeHousehold!.id);
    });
  }
  async contributeToGoal(goal: SavingsGoal) {
    if (!this.activeHousehold) return;
    const raw = prompt(`Contribuição para ${goal.name} (R$):`);
    if (!raw) return;
    const amount = Number(raw.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) { this.error = 'Informe uma contribuição válida.'; return; }
    await this.run(async () => { await this.api.contributeToGoal(this.activeHousehold!.id, goal.id, { amount: Math.round(amount * 100), occurredOn: new Date().toISOString().slice(0, 10), idempotencyKey: crypto.randomUUID() }); this.savingsGoals = await this.api.goals(this.activeHousehold!.id); });
  }
  async setGoalStatus(goal: SavingsGoal, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setGoalStatus(this.activeHousehold!.id, goal.id, status); this.savingsGoals = await this.api.goals(this.activeHousehold!.id); });
  }

  async setCardStatus(card: Card, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} o cartão ${card.name}?`)) return;
    await this.run(async () => { await this.api.setCardStatus(this.activeHousehold!.id, card.id, isActive); this.cards = await this.api.cards(this.activeHousehold!.id); });
  }

  async saveCategory() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      if (this.editingCategoryId) {
        const { name, color, icon } = this.categoryForm;
        await this.api.updateCategory(this.activeHousehold!.id, this.editingCategoryId, { name, color, icon });
      } else await this.api.createCategory(this.activeHousehold!.id, this.categoryForm);
      this.cancelCategoryEdit();
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  editCategory(category: Category) {
    this.editingCategoryId = category.id;
    this.categoryForm = { name: category.name, type: category.type, color: category.color, icon: category.icon };
    this.render();
  }

  cancelCategoryEdit() {
    this.editingCategoryId = undefined;
    this.categoryForm = { name: '', type: 'EXPENSE', color: '#5B5BD6', icon: 'sell' };
  }

  async setCategoryStatus(category: Category, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a categoria ${category.name}?`)) return;
    await this.run(async () => {
      await this.api.setCategoryStatus(this.activeHousehold!.id, category.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  async saveSubcategory() {
    if (!this.activeHousehold || !this.subcategoryForm.categoryId) return;
    await this.run(async () => {
      if (this.editingSubcategoryId) await this.api.updateSubcategory(this.activeHousehold!.id, this.editingSubcategoryId, { name: this.subcategoryForm.name });
      else await this.api.createSubcategory(this.activeHousehold!.id, this.subcategoryForm.categoryId, { name: this.subcategoryForm.name });
      this.cancelSubcategoryEdit();
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  editSubcategory(category: Category, subcategory: Category['subcategories'][number]) {
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryForm = { categoryId: category.id, name: subcategory.name };
    this.render();
  }

  cancelSubcategoryEdit() {
    this.editingSubcategoryId = undefined;
    this.subcategoryForm = { categoryId: '', name: '' };
  }

  async setSubcategoryStatus(category: Category, subcategory: Category['subcategories'][number], isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a subcategoria ${subcategory.name}?`)) return;
    await this.run(async () => {
      await this.api.setSubcategoryStatus(this.activeHousehold!.id, subcategory.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  onTransactionTypeChange() { this.transactionForm.subcategoryId = ''; }
  onTransactionSourceChange() { this.transactionForm.accountId = ''; this.transactionForm.cardId = ''; }

  async applyTransactionFilters(page = 1) {
    if (!this.activeHousehold) return;
    this.transactionPage = page;
    await this.run(() => this.loadTransactions());
  }

  clearTransactionFilters() {
    this.transactionFilters = { from: '', to: '', accountId: '', categoryId: '', subcategoryId: '', type: undefined };
    void this.applyTransactionFilters();
  }

  onFilterCategoryChange() {
    this.transactionFilters.subcategoryId = '';
    void this.applyTransactionFilters();
  }

  async saveTransaction() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const { sourceType, ...form } = this.transactionForm;
      const data = { ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, notes: form.notes || undefined, amount: Math.round(form.amount * 100) };
      if (this.editingTransactionId) await this.api.updateTransaction(this.activeHousehold!.id, this.editingTransactionId, data);
      else await this.api.createTransaction(this.activeHousehold!.id, data);
      this.cancelTransactionEdit();
      await this.loadDashboard();
    });
  }

  editTransaction(transaction: Transaction) {
    this.editingTransactionId = transaction.id;
    this.transactionForm = {
      sourceType: transaction.card ? 'CARD' : 'ACCOUNT',
      accountId: transaction.account?.id ?? '',
      cardId: transaction.card?.id ?? '',
      subcategoryId: transaction.subcategory.id,
      type: transaction.type,
      amount: transaction.amount / 100,
      description: transaction.description,
      occurredOn: transaction.occurredOn.slice(0, 10),
      notes: transaction.notes ?? '',
    };
    this.render();
  }

  cancelTransactionEdit() {
    this.editingTransactionId = undefined;
    this.transactionForm = { sourceType: 'ACCOUNT', accountId: this.overview?.accounts[0]?.id ?? '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
  }

  async deleteTransaction(transactionId: string) {
    if (!this.activeHousehold || !confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
    await this.run(async () => {
      await this.api.deleteTransaction(this.activeHousehold!.id, transactionId);
      await this.loadDashboard();
    });
  }

  async setTransactionStatus(transaction: Transaction, status: TransactionStatus) {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setTransactionStatus(this.activeHousehold!.id, transaction.id, status); await this.loadDashboard(); });
  }

  async saveTransfer() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      await this.api.createTransfer(this.activeHousehold!.id, { ...this.transferForm, amount: Math.round(this.transferForm.amount * 100), description: this.transferForm.description || undefined });
      this.transferForm = { sourceAccountId: '', destinationAccountId: '', amount: 0, occurredOn: new Date().toISOString().slice(0, 10), description: '', status: 'POSTED' };
      await this.loadDashboard();
    });
  }

  async setTransferStatus(transfer: AccountTransfer, status: 'PENDING' | 'POSTED' | 'DISCARDED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setTransferStatus(this.activeHousehold!.id, transfer.id, status); await this.loadDashboard(); });
  }

  onImportFile(event: Event) { this.importForm.file = (event.target as HTMLInputElement).files?.[0]; }

  async previewImport() {
    if (!this.activeHousehold || !this.importForm.file) return;
    await this.run(async () => {
      const contentBase64 = await this.readAsBase64(this.importForm.file!);
      this.importPreview = await this.api.previewImport(this.activeHousehold!.id, { fileName: this.importForm.file!.name, contentBase64, mapping: {}, accountId: this.importForm.accountId || undefined });
      this.importBatches = await this.api.importBatches(this.activeHousehold!.id);
    });
  }

  async commitImport(createMissingCategories: boolean) {
    if (!this.activeHousehold || !this.importPreview) return;
    await this.run(async () => { await this.api.commitImport(this.activeHousehold!.id, this.importPreview!.id, createMissingCategories); this.importPreview = undefined; this.importBatches = await this.api.importBatches(this.activeHousehold!.id); await this.loadDashboard(); });
  }

  async cancelImport(batch: ImportBatch) {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.cancelImport(this.activeHousehold!.id, batch.id); this.importBatches = await this.api.importBatches(this.activeHousehold!.id); if (this.importPreview?.id === batch.id) this.importPreview = undefined; });
  }

  private async loadDashboard() {
    if (!this.activeHousehold) return;
    const [overview, accounts, cards, categories, recurringRules, installmentPurchases, budgetSummary, savingsGoals, transfers, importBatches] = await Promise.all([this.api.overview(this.activeHousehold.id), this.api.accounts(this.activeHousehold.id), this.api.cards(this.activeHousehold.id), this.api.categories(this.activeHousehold.id), this.api.recurringRules(this.activeHousehold.id), this.api.installmentPurchases(this.activeHousehold.id), this.api.budgetSummary(this.activeHousehold.id, this.budgetMonth), this.api.goals(this.activeHousehold.id), this.api.transfers(this.activeHousehold.id), this.api.importBatches(this.activeHousehold.id)]);
    this.overview = overview;
    this.accounts = accounts;
    this.cards = cards;
    this.categories = categories;
    this.recurringRules = recurringRules;
    this.installmentPurchases = installmentPurchases;
    this.budgetSummary = budgetSummary;
    this.savingsGoals = savingsGoals;
    this.transfers = transfers;
    this.importBatches = importBatches;
    await this.loadTransactions();
    if (!this.transactionForm.accountId) this.transactionForm.accountId = this.overview.accounts[0]?.id ?? '';
    if (!this.importForm.accountId) this.importForm.accountId = this.overview.accounts[0]?.id ?? '';
  }

  private async loadTransactions() {
    if (!this.activeHousehold) return;
    const page = await this.api.transactions(this.activeHousehold.id, { ...this.transactionFilters, page: this.transactionPage, pageSize: this.transactionPageSize });
    this.transactions = page.items;
    this.transactionTotal = page.total;
    this.transactionPage = page.page;
  }

  private async loadHouseholdManagement() {
    if (!this.activeHousehold) return;
    [this.householdMembers, this.householdInvitations] = await Promise.all([
      this.api.householdMembers(this.activeHousehold.id),
      this.api.householdInvitations(this.activeHousehold.id),
    ]);
  }

  private async run(action: () => Promise<void>) {
    this.loading = true;
    this.error = '';
    try { await action(); } catch (error: unknown) { this.error = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'; } finally {
      this.loading = false;
      this.render();
    }
  }

  private render() {
    queueMicrotask(() => this.changeDetector.detectChanges());
  }

  private syncViewFromUrl(url: string) {
    const path = url.split('?')[0];
    const view = path === '/contas' ? 'accounts'
      : path === '/cartoes' ? 'cards'
      : path === '/categorias' ? 'categories'
      : path === '/lancamentos' ? 'transactions'
          : path === '/recorrencias' ? 'recurrences'
          : path === '/orcamento' ? 'budget'
          : path === '/metas' ? 'goals'
          : path === '/transferencias' ? 'transfers'
          : path === '/importacoes' ? 'imports'
          : 'overview';
    this.activeView = view;
    this.render();
  }

  private readAsBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.readAsDataURL(file);
    });
  }
}
