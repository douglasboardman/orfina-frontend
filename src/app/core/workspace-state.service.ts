import { Subscription } from 'rxjs';
import { ApplicationRef, Injectable, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApiError, ApiService } from '../api.service';
import { Account, AccountTransfer, AccountType, ArchivedFinanceItems, ArchivedFinanceItemType, BudgetSummary, Card, CardStatement, Category, FinancialRealizationMode, Household, HouseholdInvitation, HouseholdMember, ImportBatch, InstallmentPurchase, Overview, RecurringMaterializationMode, RecurringRule, RecurringTransferRule, SavingsGoal, Theme, Transaction, TransactionFilters, TransactionStatus, TransactionType } from '../models';
import { bankLogoUrlFor, brazilianBanks, cardNetworks, CardNetwork } from '../financial-brands';
import { SessionStore } from './session.store';
import { UiStore } from './ui.store';
import { HouseholdContextStore } from './household-context.store';
import { NavigableWorkspaceView, WorkspaceView } from '../layout/workspace-view';
import type { QuickCreateKind } from '../ui/quick-create-dialog.component';
import type { ChipAutocompleteOption } from '../ui/chip-autocomplete.component';
import type { FinancialEntryMode } from '../ui/financial-entry-form.component';

@Injectable({ providedIn: 'root' })
export class WorkspaceState implements OnInit {
  householdMembers: HouseholdMember[] = [];
  archivedHouseholdMembers: HouseholdMember[] = [];
  householdInvitations: HouseholdInvitation[] = [];
  myHouseholdInvitations: HouseholdInvitation[] = [];
  overview?: Overview;
  accounts: Account[] = [];
  cards: Card[] = [];
  cardStatements: CardStatement[] = [];
  statements: CardStatement[] = [];
  statementDetail?: CardStatement;
  statementTransactions: Transaction[] = [];
  statementTransactionTotal = 0;
  statementFilters: { search: string; categoryId: string; status: '' | TransactionStatus; mode: '' | 'SINGLE' | 'FIXED' | 'INSTALLMENT' } = { search: '', categoryId: '', status: '', mode: '' };
  transactionDeletionCandidate?: Transaction;
  selectedCard?: Card;
  paymentStatement?: CardStatement;
  paymentAmount = 0;
  recurringRules: RecurringRule[] = [];
  installmentPurchases: InstallmentPurchase[] = [];
  budgetSummary?: BudgetSummary;
  savingsGoals: SavingsGoal[] = [];
  contributionGoal?: SavingsGoal;
  contributionAmount = 0;
  transfers: AccountTransfer[] = [];
  recurringTransferRules: RecurringTransferRule[] = [];
  importBatches: ImportBatch[] = [];
  importPreview?: ImportBatch;
  categories: Category[] = [];
  archivedFinanceItems: ArchivedFinanceItems = { accounts: [], cards: [], categories: [], subcategories: [] };
  archivedGoals: SavingsGoal[] = [];
  archivedDeletionBlockedMessage = '';
  transactions: Transaction[] = [];
  transactionTotal = 0;
  transactionPage = 1;
  readonly transactionPageSize = 20;
  categoryTab: 'EXPENSE' | 'INCOME' = 'EXPENSE';
  categoryPage = 1;
  readonly categoryPageSize = 6;
  error = '';
  loading = false;
  backendVersion?: string;
  householdManagementOpen = false;
  quickCreateOpen = false;
  activeView: WorkspaceView = 'overview';
  /** The dashboard opens in the planning lens; the choice only changes presentation. */
  overviewMode: 'PROJECTED' | 'REALIZED' = 'PROJECTED';
  readonly brazilianBanks = brazilianBanks;
  readonly cardNetworks = cardNetworks;
  householdName = '';
  groupName = '';
  recurringMaterializationMode: RecurringMaterializationMode = 'ON_OCCURRENCE_DATE';
  recurringMaterializationValue = 0;
  financialRealizationMode: FinancialRealizationMode = 'MANUAL';
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
  invitationForm: { email: string; role: 'MANAGER' | 'MEMBER' | 'VIEWER' } = { email: '', role: 'MEMBER' };
  accountForm: { name: string; type: AccountType; bankName: string; bankLogoUrl: string; initialBalance: number } = { name: '', type: 'CHECKING', bankName: '', bankLogoUrl: '', initialBalance: 0 };
  cardForm: { name: string; issuerName: string; issuerLogoUrl: string; network: CardNetwork; lastFour: string; creditLimit: number | null; closingDay: number; dueDay: number } = { name: '', issuerName: '', issuerLogoUrl: '', network: 'VISA', lastFour: '', creditLimit: null, closingDay: 1, dueDay: 10 };
  recurringForm: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; startOn: string; endOn: string } = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
  transactionCreationMode: FinancialEntryMode = 'ONE_OFF';
  recurrenceCreationMode: FinancialEntryMode = 'FIXED';
  cardCreationMode: FinancialEntryMode = 'INSTALLMENT';
  installmentForm: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; totalAmount: number; installmentCount: number; startInstallmentNumber: number; description: string; firstOccurredOn: string } = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: 'EXPENSE', totalAmount: 0, installmentCount: 2, startInstallmentNumber: 1, description: '', firstOccurredOn: new Date().toISOString().slice(0, 10) };
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
  editingOccurrence?: Transaction;
  occurrenceEditScope: 'ONE' | 'FOLLOWING' = 'ONE';
  transactionForm: { sourceType: 'ACCOUNT' | 'CARD'; accountId: string; cardId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes: string } = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
  transactionFilters: Omit<TransactionFilters, 'page' | 'pageSize'> = { from: '', to: '', accountId: '', cardId: '', categoryId: '', subcategoryId: '', type: undefined, status: undefined, importBatchId: '' };
  transferForm: { sourceAccountId: string; destinationAccountId: string; amount: number; occurredOn: string; description: string; status: 'PENDING' | 'POSTED' } = { sourceAccountId: '', destinationAccountId: '', amount: 0, occurredOn: new Date().toISOString().slice(0, 10), description: '', status: 'PENDING' };
  transferEntryMode: 'ONE_OFF' | 'RECURRING' = 'ONE_OFF';
  recurringTransferForm: { sourceAccountId: string; destinationAccountId: string; amount: number; description: string; startOn: string; endOn: string } = { sourceAccountId: '', destinationAccountId: '', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
  editingRecurringTransferRuleId?: string;
  recurringTransferDialogOpen = false;
  editingHouseholdMember?: HouseholdMember;
  memberEditForm: { displayName: string; role: 'MANAGER' | 'MEMBER' | 'VIEWER'; isActive: boolean; archive: boolean } = { displayName: '', role: 'MEMBER', isActive: true, archive: false };
  importForm: { accountId: string; file?: File } = { accountId: '' };

  constructor(
    private readonly api: ApiService,
    private readonly applicationRef: ApplicationRef,
    private readonly router: Router,
    private readonly session: SessionStore,
    private readonly ui: UiStore,
    private readonly householdContext: HouseholdContextStore,
  ) {}

  private routeSubscription?: Subscription;

  ngOnInit() {
    document.documentElement.dataset['theme'] = this.theme;
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.syncViewFromUrl(event.urlAfterRedirects);
    });
    this.syncViewFromUrl(this.router.url);
    void this.initialize();
  }

  ngOnDestroy() { this.routeSubscription?.unsubscribe(); this.clearFinancialState(); }
  clearFinancialState() {
    this.householdContext.clear(); this.overview = undefined; this.accounts = []; this.cards = [];
    this.categories = []; this.archivedFinanceItems = { accounts: [], cards: [], categories: [], subcategories: [] }; this.archivedGoals = []; this.archivedDeletionBlockedMessage = ''; this.transactions = []; this.cardStatements = []; this.paymentStatement = undefined; this.recurringRules = [];
    this.installmentPurchases = []; this.statements = []; this.statementDetail = undefined; this.statementTransactions = []; this.statementTransactionTotal = 0; this.transactionDeletionCandidate = undefined; this.budgetSummary = undefined; this.savingsGoals = []; this.contributionGoal = undefined; this.transfers = []; this.recurringTransferRules = [];
    this.importBatches = []; this.importPreview = undefined; this.householdMembers = []; this.archivedHouseholdMembers = []; this.householdInvitations = [];
    this.myHouseholdInvitations = []; this.quickCreateOpen = false; this.recurringTransferDialogOpen = false; this.editingRecurringTransferRuleId = undefined;
  }
  get isSystemAdmin() { return this.currentUser?.systemRole === 'SYSTEM_ADMIN'; }
  get theme() { return this.ui.theme(); }
  set theme(theme: Theme) { this.ui.setTheme(theme); }
  get sidebarOpen() { return this.ui.sidebarOpen(); }
  set sidebarOpen(open: boolean) { this.ui.setSidebarOpen(open); }
  get userMenuOpen() { return this.ui.userMenuOpen(); }
  set userMenuOpen(open: boolean) { this.ui.setUserMenuOpen(open); }
  get households() { return this.householdContext.households(); }
  set households(households: Household[]) { this.householdContext.setHouseholds(households); }
  get activeHousehold() { return this.householdContext.activeHousehold(); }
  set activeHousehold(household: Household | undefined) { this.householdContext.setActiveHousehold(household); }
  get referenceMonth() { return this.householdContext.referenceMonth(); }
  set referenceMonth(referenceMonth: string) { this.householdContext.setReferenceMonth(referenceMonth); }
  get currentUser() { return this.session.user(); }
  get authenticated() { return this.session.authenticated(); }
  get canManageActiveHousehold() {
    const role = this.activeHousehold?.members[0]?.role;
    return role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER';
  }
  get canManageHouseholdUsers() {
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
  get bankSelectionOptions(): ChipAutocompleteOption[] {
    return this.brazilianBanks.map((bank) => ({ value: bank.name, label: bank.name, logoUrl: bank.logoUrl }));
  }
  get categorySelectionOptions(): ChipAutocompleteOption[] {
    return this.categories
      .filter((category) => category.isActive)
      .map((category) => ({
        value: category.id,
        label: category.name,
        detail: category.type === 'EXPENSE' ? 'Despesa' : 'Receita',
        icon: category.icon,
        color: category.color,
      }));
  }
  get filteredSubcategorySelectionOptions() { return this.subcategorySelectionOptions(this.filteredSubcategories); }
  get recurringSubcategorySelectionOptions() { return this.subcategorySelectionOptions(this.recurringSubcategories); }
  get installmentSubcategorySelectionOptions() { return this.subcategorySelectionOptions(this.installmentSubcategories); }
  get budgetCategorySelectionOptions(): ChipAutocompleteOption[] {
    return this.budgetCategories.map((category) => ({ value: category.id, label: category.name, icon: category.icon, color: category.color }));
  }
  get recurringSubcategories() {
    return this.categories
      .filter((category) => category.isActive && category.type === this.recurringForm.type)
      .flatMap((category) => category.subcategories.filter((subcategory) => subcategory.isActive).map((subcategory) => ({ ...subcategory, category })));
  }
  get expenseCategories() { return this.categories.filter((category) => category.type === 'EXPENSE'); }
  get incomeCategories() { return this.categories.filter((category) => category.type === 'INCOME'); }
  get activeCategoryTabLabel() { return this.categoryTab === 'EXPENSE' ? 'Despesas' : 'Receitas'; }
  get activeCategoryList() { return this.categoryTab === 'EXPENSE' ? this.expenseCategories : this.incomeCategories; }
  get categoryPageCount() { return Math.max(1, Math.ceil(this.activeCategoryList.length / this.categoryPageSize)); }
  get activeCategoryPage() { return Math.min(this.categoryPage, this.categoryPageCount); }
  get displayedCategories() {
    const start = (this.activeCategoryPage - 1) * this.categoryPageSize;
    return this.activeCategoryList.slice(start, start + this.categoryPageSize);
  }
  get budgetCategories() { return this.categories.filter((category) => category.type === 'EXPENSE' && category.isActive); }
  get displayedTransactions() { return this.activeView === 'transactions' ? this.transactions : this.overview?.recentTransactions ?? []; }
  get transactionPageCount() { return Math.max(1, Math.ceil(this.transactionTotal / this.transactionPageSize)); }
  get filterSubcategories() {
    const category = this.categories.find((item) => item.id === this.transactionFilters.categoryId);
    return category?.subcategories.filter((subcategory) => subcategory.isActive) ?? [];
  }
  get filterSubcategorySelectionOptions(): ChipAutocompleteOption[] {
    const category = this.categories.find((item) => item.id === this.transactionFilters.categoryId);
    return this.filterSubcategories.map((subcategory) => ({
      value: subcategory.id,
      label: subcategory.name,
      detail: category?.name,
      icon: category?.icon,
      color: category?.color,
    }));
  }
  get displayedAccounts() { return this.activeView === 'accounts' ? this.accounts : this.overview?.accounts ?? []; }
  get viewTitle() {
    if (this.activeView === 'profile') return 'Perfil e preferências';
    if (this.activeView === 'group') return 'Configurações do grupo';
    if (this.activeView === 'imports') return 'Importações';
    if (this.activeView === 'transfers') return 'Transferências';
    if (this.activeView === 'accounts') return 'Contas';
    if (this.activeView === 'cards') return this.isStatementDetailRoute ? 'Fatura do cartão' : 'Cartões';
    if (this.activeView === 'recurrences') return 'Recorrências';
    if (this.activeView === 'budget') return 'Orçamento';
    if (this.activeView === 'goals') return 'Metas';
    if (this.activeView === 'categories') return 'Categorias';
    if (this.activeView === 'transactions') return 'Lançamentos';
    return `Olá, ${this.activeHousehold?.name ?? ''}`;
  }
  get referenceMonthLabel() {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${this.referenceMonth}-01T12:00:00.000Z`));
  }
  get isActionRoute() { return /\/(nova|novo(?:-limite)?|editar)(?:\/|$)/.test(this.router.url.split('?')[0]); }
  get isInstallmentAction() { return this.router.url.split('?')[0] === '/cartoes/parcelamentos/nova'; }
  get isStatementDetailRoute() { return /^\/cartoes\/faturas\/[^/]+\/[^/]+$/.test(this.router.url.split('?')[0]); }
  get usesDrawerAction() { return this.isActionRoute && !this.isInstallmentAction && ['accounts', 'cards', 'categories', 'transactions'].includes(this.activeView); }
  get isSubcategoryAction() { return this.router.url.split('?')[0].startsWith('/categorias/subcategorias/'); }
  get actionDrawerLabel() {
    if (this.activeView === 'accounts') return this.editingAccountId ? 'Editar conta' : 'Nova conta';
    if (this.activeView === 'cards') return this.editingCardId ? 'Editar cartão' : 'Novo cartão';
    if (this.activeView === 'transactions') return this.editingTransactionId ? 'Editar lançamento' : 'Novo lançamento';
    if (this.isSubcategoryAction) return this.editingSubcategoryId ? 'Editar subcategoria' : 'Nova subcategoria';
    if (this.activeView === 'categories') return this.editingCategoryId ? 'Editar categoria' : 'Nova categoria';
    return 'Formulário';
  }
  get filteredStatementTransactions() {
    const search = this.statementFilters.search.trim().toLocaleLowerCase('pt-BR');
    return this.statementTransactions.filter((transaction) =>
      (!search || transaction.description.toLocaleLowerCase('pt-BR').includes(search))
      && (!this.statementFilters.categoryId || transaction.subcategory.category.id === this.statementFilters.categoryId)
      && (!this.statementFilters.status || transaction.status === this.statementFilters.status)
      && (!this.statementFilters.mode || transaction.mode === this.statementFilters.mode),
    );
  }
  get statementOptions() {
    return this.statementDetail ? this.statements.filter((item) => item.cardId === this.statementDetail!.cardId) : [];
  }
  /** A statement belongs to the month when its payment is due. */
  get currentStatements() {
    return this.statements.filter((item) => item.dueOn.slice(0, 7) === this.referenceMonth);
  }
  statementStatusLabel(status: CardStatement['status']) { return status === 'OPEN' ? 'Aberta' : status === 'CLOSED' ? 'Fechada' : 'Paga'; }
  statementModeLabel(mode?: Transaction['mode']) { return mode === 'INSTALLMENT' ? 'Parcelada' : mode === 'FIXED' ? 'Fixa' : 'Avulsa'; }
  statementPurchaseTotal(transaction: Transaction) { return transaction.installmentPurchase?.totalAmount ?? transaction.amount; }
  statementProjectedTotal(statement: CardStatement) {
    const forecastImpact = this.statementTransactions
      .filter((transaction) => transaction.isForecast)
      .reduce((sum, transaction) => sum + (transaction.type === 'EXPENSE' ? transaction.amount : -transaction.amount), 0);
    return statement.totalAmount + forecastImpact;
  }
  statementLimitPercent(statement: CardStatement) { return statement.limitUsagePercent ?? 0; }
  statementOutstanding(statement: CardStatement) { return Math.max(0, statement.totalAmount - statement.payments.reduce((sum, payment) => sum + payment.amount, 0)); }
  setCategoryTab(tab: 'EXPENSE' | 'INCOME') {
    this.categoryTab = tab;
    this.categoryPage = 1;
    this.render();
  }
  setCategoryPage(page: number) {
    this.categoryPage = Math.max(1, Math.min(page, this.categoryPageCount));
    this.render();
  }
  get viewEyebrow() { return this.activeView === 'overview' ? 'VISÃO GERAL' : this.activeView.toUpperCase(); }
  get userName() {
    return this.activeHousehold?.members[0]?.displayName || this.currentUser?.name || 'Minha conta';
  }
  get userAvatarUrl() { return this.currentUser?.avatarUrl; }
  get userInitial() { return this.userName.slice(0, 1).toUpperCase(); }
  categoryIconLabel(icon: string) { return this.categoryIcons.find((item) => item.value === icon)?.label ?? icon; }
  bankLogoUrl(bankName?: string, fallback?: string) { return bankLogoUrlFor(bankName, fallback); }

  private subcategorySelectionOptions(items: Array<{ id: string; name: string; isDefault: boolean; category: Category }>): ChipAutocompleteOption[] {
    return items.map((subcategory) => ({
      value: subcategory.id,
      label: subcategory.isDefault ? subcategory.name : `${subcategory.category.name} · ${subcategory.name}`,
      detail: subcategory.isDefault ? 'Subcategoria genérica' : 'Subcategoria',
      icon: subcategory.category.icon,
      color: subcategory.category.color,
    }));
  }

  switchTheme() {
    this.ui.toggleTheme();
    document.documentElement.dataset['theme'] = this.theme;
    this.render();
  }

  toggleSidebar() {
    this.ui.setSidebarOpen(!this.sidebarOpen, !matchMedia('(max-width: 860px)').matches);
    this.render();
  }

  toggleUserMenu() {
    this.ui.toggleUserMenu();
    this.render();
  }

  openQuickCreate() {
    this.quickCreateOpen = true;
    this.ui.closeUserMenu();
    this.render();
  }

  closeQuickCreate() {
    this.quickCreateOpen = false;
    this.render();
  }

  startQuickCreate(kind: QuickCreateKind) {
    this.quickCreateOpen = false;
    if (matchMedia('(max-width: 860px)').matches) this.ui.setSidebarOpen(false);
    if (kind === 'TRANSFER') {
      this.transferForm = { sourceAccountId: '', destinationAccountId: '', amount: 0, occurredOn: new Date().toISOString().slice(0, 10), description: '', status: 'PENDING' };
      this.transferEntryMode = 'ONE_OFF';
      void this.router.navigateByUrl('/transferencias/nova');
      return;
    }
    this.editingTransactionId = undefined;
    this.transactionForm = { sourceType: 'ACCOUNT', accountId: this.overview?.accounts[0]?.id ?? '', cardId: '', subcategoryId: '', type: kind, amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
    void this.router.navigateByUrl('/lancamentos/novo');
  }

  selectView(view: NavigableWorkspaceView) {
    this.activeView = view;
    if (matchMedia('(max-width: 860px)').matches) this.ui.setSidebarOpen(false);
    this.ui.closeUserMenu();
    void this.router.navigateByUrl({ overview: '/visao-geral', accounts: '/contas', cards: '/cartoes', categories: '/categorias', transactions: '/lancamentos', recurrences: '/recorrencias', budget: '/orcamento', goals: '/metas', transfers: '/transferencias', imports: '/importacoes' }[view]);
    this.render();
  }

  signIn() {
    this.error = '';
    this.session.beginGoogleSignIn();
  }
  async signOut() {
    this.loading = true;
    this.error = '';

    try {
      await this.session.logout();
      localStorage.removeItem('orfina.active-household');
      this.householdContext.clear();
      this.overview = undefined;
      this.accounts = [];
      this.cards = [];
      this.categories = [];
      this.transactions = [];
      this.transactionTotal = 0;
      this.householdMembers = [];
      this.archivedHouseholdMembers = [];
      this.householdInvitations = [];
      this.myHouseholdInvitations = [];
      this.ui.closeUserMenu();
      this.householdManagementOpen = false;
      this.ui.setSidebarOpen(false);
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
      const restored = await this.session.restore();
      if (!restored) return;
    this.applicationRef.tick();
    } catch (error: unknown) {
      this.error = error instanceof Error ? `Não foi possível restaurar a sessão (${error.message})` : 'Não foi possível restaurar a sessão.';
      return;
    }
    await this.run(async () => {
      this.households = await this.api.getHouseholds();
      void this.api.version().then((release) => { this.backendVersion = release.build ? `${release.version} · ${release.build}` : release.version; this.render(); }).catch(() => undefined);
      this.myHouseholdInvitations = await this.api.myHouseholdInvitations();
      const saved = localStorage.getItem('orfina.active-household');
      this.activeHousehold = this.households.find((item) => item.id === saved) ?? this.households[0];
      if (this.activeHousehold) {
        this.groupName = this.activeHousehold.name;
        await this.loadDashboard();
        if (this.activeView === 'group' && this.canManageHouseholdUsers) await this.loadHouseholdManagement();
        if (this.activeView === 'group' && this.canManageActiveHousehold) await this.loadArchivedItems();
        this.hydrateActionFromPath(this.router.url.split('?')[0]);
      }
    });
  }

  async selectHousehold(id: string) {
    this.activeHousehold = this.households.find((item) => item.id === id);
    if (this.activeHousehold) {
      this.groupName = this.activeHousehold.name;
      this.recurringMaterializationMode = this.activeHousehold.recurringMaterializationMode;
      this.recurringMaterializationValue = this.activeHousehold.recurringMaterializationValue;
      this.financialRealizationMode = this.activeHousehold.financialRealizationMode ?? 'MANUAL';
      localStorage.setItem('orfina.active-household', id);
      this.householdManagementOpen = false;
      this.householdMembers = [];
      this.householdInvitations = [];
      await this.run(() => this.loadDashboard());
    }
  }

  async changeReferenceMonth(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month === this.referenceMonth) return;
    this.referenceMonth = month;
    this.budgetMonth = month;
    await this.run(() => this.loadDashboard());
  }

  async stepReferenceMonth(offset: number) {
    const [year, month] = this.referenceMonth.split('-').map(Number);
    const target = new Date(Date.UTC(year, month - 1 + offset, 1));
    await this.changeReferenceMonth(`${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}`);
  }

  openAction(path: string) { void this.router.navigateByUrl(path); }
  openCardFinancialEntry(card: Card) {
    const today = new Date().toISOString().slice(0, 10);
    this.cardCreationMode = 'ONE_OFF';
    this.transactionForm = { sourceType: 'CARD', accountId: '', cardId: card.id, subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: today, notes: '' };
    this.recurringForm = { sourceType: 'CARD', accountId: '', cardId: card.id, subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', startOn: today, endOn: '' };
    this.installmentForm = { sourceType: 'CARD', accountId: '', cardId: card.id, subcategoryId: '', type: 'EXPENSE', totalAmount: 0, installmentCount: 2, startInstallmentNumber: 1, description: '', firstOccurredOn: today };
    this.lockFinancialFormsToCard();
    this.openAction('/cartoes/parcelamentos/nova');
  }
  cancelAction(view: string) { void this.router.navigateByUrl(`/${view}`); }
  cancelCurrentAction() {
    if (this.activeView === 'accounts') this.cancelAccountEdit();
    else if (this.activeView === 'cards') this.cancelCardEdit();
    else if (this.activeView === 'categories' && this.isSubcategoryAction) this.cancelSubcategoryEdit();
    else if (this.activeView === 'categories') this.cancelCategoryEdit();
    else if (this.activeView === 'transactions') this.cancelTransactionEdit();
    else this.cancelAction(this.viewPath(this.activeView));
  }

  private viewPath(view: string) {
    return ({ overview: 'visao-geral', accounts: 'contas', cards: 'cartoes', categories: 'categorias', transactions: 'lancamentos', recurrences: 'recorrencias', budget: 'orcamento', goals: 'metas', transfers: 'transferencias', imports: 'importacoes', profile: 'configuracoes/perfil', group: 'configuracoes/grupo' } as Record<string, string>)[view] ?? 'visao-geral';
  }

  async viewOverviewCategory(categoryId: string) {
    this.transactionFilters = { ...this.transactionFilters, categoryId, ...this.transactionMonthBounds() };
    await this.router.navigateByUrl('/lancamentos');
    await this.applyTransactionFilters();
  }

  async viewOverviewCategories() {
    this.transactionFilters = { ...this.transactionFilters, categoryId: '', ...this.transactionMonthBounds() };
    await this.router.navigateByUrl('/lancamentos');
    await this.applyTransactionFilters();
  }

  get isProjectedOverview() { return this.overviewMode === 'PROJECTED'; }

  get dashboardBalance() {
    const indicators = this.overview?.indicators;
    return this.isProjectedOverview
      ? (indicators?.projectedAvailableBalance ?? indicators?.availableBalance ?? this.overview?.totalBalance ?? 0)
      : (indicators?.availableBalance ?? this.overview?.totalBalance ?? 0);
  }

  get dashboardWeeklyFlow() {
    return this.isProjectedOverview
      ? (this.overview?.charts?.projectedWeeklyFlow ?? this.overview?.charts?.weeklyFlow ?? [])
      : (this.overview?.charts?.weeklyFlow ?? []);
  }

  get dashboardExpenseByCategory() {
    return this.isProjectedOverview
      ? (this.overview?.charts?.projectedExpenseByCategory ?? this.overview?.charts?.expenseByCategory ?? [])
      : (this.overview?.charts?.expenseByCategory ?? []);
  }

  setOverviewMode(mode: 'PROJECTED' | 'REALIZED') {
    if (this.overviewMode === mode) return;
    this.overviewMode = mode;
    this.render();
  }

  weeklyPercent(week: { income: number; expenses: number }, key: 'income' | 'expenses') {
    const highest = Math.max(...this.dashboardWeeklyFlow.flatMap((item) => [item.income, item.expenses]), 1);
    return Math.max(2, Math.round((week[key] / highest) * 100));
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

  async createHouseholdFromDialog() {
    const name = prompt('Nome do novo grupo familiar:')?.trim();
    if (!name) return;
    this.householdName = name;
    await this.createHousehold();
  }

  async renameActiveHousehold() {
    if (!this.activeHousehold || !this.canManageActiveHousehold) return;
    const name = this.groupName.trim();
    if (name.length < 2 || name === this.activeHousehold.name) return;
    await this.run(async () => {
      const updated = await this.api.updateHousehold(this.activeHousehold!.id, { name });
      this.households = this.households.map((household) => household.id === updated.id ? updated : household);
      this.activeHousehold = updated;
      this.groupName = updated.name;
    });
  }

  async saveRecurringMaterializationSettings() {
    if (!this.activeHousehold || !this.canManageActiveHousehold) return;
    const value = this.recurringMaterializationMode === 'ON_OCCURRENCE_DATE' ? 0 : this.recurringMaterializationValue;
    await this.run(async () => {
      const updated = await this.api.updateHousehold(this.activeHousehold!.id, { recurringMaterializationMode: this.recurringMaterializationMode, recurringMaterializationValue: value });
      this.households = this.households.map((household) => household.id === updated.id ? updated : household);
      this.activeHousehold = updated;
      this.recurringMaterializationMode = updated.recurringMaterializationMode;
      this.recurringMaterializationValue = updated.recurringMaterializationValue;
    });
  }

  async saveFinancialRealizationSettings() {
    if (!this.activeHousehold || !this.canManageActiveHousehold) return;
    await this.run(async () => {
      const updated = await this.api.updateHousehold(this.activeHousehold!.id, { financialRealizationMode: this.financialRealizationMode });
      this.households = this.households.map((household) => household.id === updated.id ? updated : household);
      this.activeHousehold = updated;
      this.financialRealizationMode = updated.financialRealizationMode ?? this.financialRealizationMode;
    });
  }

  async toggleHouseholdManagement() {
    if (!this.canManageHouseholdUsers) return;
    this.householdManagementOpen = !this.householdManagementOpen;
    if (this.householdManagementOpen) await this.run(() => this.loadHouseholdManagement());
    else this.render();
  }

  async createHouseholdInvitation() {
    if (!this.activeHousehold || !this.canManageHouseholdUsers || !this.invitationForm.email.trim()) return;
    await this.run(async () => {
      await this.api.createHouseholdInvitation(this.activeHousehold!.id, this.invitationForm);
      this.invitationForm = { email: '', role: 'MEMBER' };
      await this.loadHouseholdManagement();
    });
  }

  openHouseholdMemberEditor(member: HouseholdMember) {
    if (!this.canManageHouseholdUsers || member.role === 'OWNER' || member.role === 'ADMIN') return;
    this.editingHouseholdMember = member;
    this.memberEditForm = { displayName: member.displayName ?? member.user.name, role: member.role as 'MANAGER' | 'MEMBER' | 'VIEWER', isActive: member.isActive, archive: Boolean(member.archivedAt) };
    this.render();
  }
  closeHouseholdMemberEditor() { this.editingHouseholdMember = undefined; this.render(); }
  async archiveHouseholdMember() {
    const member = this.editingHouseholdMember;
    if (!member || !confirm(`Arquivar ${member.displayName || member.user.name} deste grupo? A pessoa perderá o acesso a esta família, mas seus lançamentos e histórico serão preservados.`)) return;
    this.memberEditForm.archive = true;
    this.memberEditForm.isActive = false;
    await this.saveHouseholdMember();
  }
  async restoreHouseholdMember() {
    this.memberEditForm.archive = false;
    this.memberEditForm.isActive = true;
    await this.saveHouseholdMember();
  }
  async saveHouseholdMember() {
    const member = this.editingHouseholdMember;
    if (!this.activeHousehold || !member || !this.canManageHouseholdUsers) return;
    await this.run(async () => {
      const updated = await this.api.updateHouseholdMember(this.activeHousehold!.id, member.userId, { ...this.memberEditForm, displayName: this.memberEditForm.displayName.trim() || undefined });
      this.editingHouseholdMember = undefined;
      await this.loadHouseholdManagement();
      await this.loadArchivedItems();
    });
  }

  async revokeHouseholdInvitation(invitation: HouseholdInvitation) {
    if (!this.activeHousehold || !this.canManageHouseholdUsers || !confirm(`Revogar o convite para ${invitation.email}?`)) return;
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
    this.openAction(`/contas/${account.id}/editar`);
  }

  async viewAccountTransactions(account: Account) {
    this.transactionFilters = { ...this.transactionMonthBounds(), accountId: account.id, cardId: '', categoryId: '', subcategoryId: '', type: undefined, status: undefined, importBatchId: '' };
    this.selectView('transactions');
    await this.applyTransactionFilters();
  }

  cancelAccountEdit() {
    this.editingAccountId = undefined;
    this.accountForm = { name: '', type: 'CHECKING', bankName: '', bankLogoUrl: '', initialBalance: 0 };
    this.cancelAction('contas');
  }

  async setAccountStatus(account: Account, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a conta ${account.name}?`)) return;
    await this.run(async () => {
      await this.api.setAccountStatus(this.activeHousehold!.id, account.id, isActive);
      await this.loadDashboard();
      await this.loadArchivedItems();
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
    this.openAction(`/cartoes/${card.id}/editar`);
  }

  cancelCardEdit() { this.editingCardId = undefined; this.cardForm = { name: '', issuerName: '', issuerLogoUrl: '', network: 'VISA', lastFour: '', creditLimit: null, closingDay: 1, dueDay: 10 }; this.cancelAction('cartoes'); }

  async selectCard(card: Card) {
    if (!this.activeHousehold) return;
    await this.run(async () => { this.selectedCard = card; this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, card.id); });
  }

  async openStatement(statement: CardStatement) {
    const card = statement.card ?? this.cards.find((item) => item.id === statement.cardId);
    if (!card) return;
    await this.router.navigateByUrl(`/cartoes/faturas/${card.id}/${statement.id}`);
  }

  async selectStatement(statementId: string) {
    if (!this.statementDetail) return;
    const statement = this.statements.find((item) => item.id === statementId);
    if (statement) await this.openStatement(statement);
  }

  clearStatementFilters() {
    this.statementFilters = { search: '', categoryId: '', status: '', mode: '' };
    this.render();
  }

  private async hydrateStatementDetailFromPath(path: string) {
    const match = path.match(/^\/cartoes\/faturas\/([^/]+)\/([^/]+)$/);
    if (!match || !this.activeHousehold) {
      this.statementDetail = undefined;
      this.statementTransactions = [];
      this.statementTransactionTotal = 0;
      return;
    }
    const [, cardId, statementId] = match;
    const statement = this.statements.find((item) => item.id === statementId && item.cardId === cardId)
      ?? (await this.api.statements(this.activeHousehold.id)).find((item) => item.id === statementId && item.cardId === cardId);
    if (!statement) {
      this.statementDetail = undefined;
      this.statementTransactions = [];
      this.statementTransactionTotal = 0;
      this.error = 'Fatura não encontrada.';
      return;
    }
    const page = await this.api.transactions(this.activeHousehold.id, { statementId, page: 1, pageSize: 100 });
    this.statementDetail = statement;
    this.statementTransactions = page.items;
    this.statementTransactionTotal = page.total;
  }

  async closeStatement(statement: CardStatement) {
    if (!this.activeHousehold || !confirm('Fechar esta fatura? Ajustes posteriores deverão ser rastreáveis.')) return;
    await this.run(async () => {
      await this.api.closeStatement(this.activeHousehold!.id, statement.id);
      if (this.selectedCard) this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, this.selectedCard.id);
      this.statements = await this.api.statements(this.activeHousehold!.id);
      await this.hydrateStatementDetailFromPath(this.router.url.split('?')[0]);
    });
  }

  async payStatement(statement: CardStatement) {
    if (!this.activeHousehold) return;
    const accountId = this.accounts.find((account) => account.isActive)?.id;
    if (!accountId) { this.error = 'Cadastre uma conta ativa para pagar a fatura.'; return; }
    this.paymentStatement = statement;
    this.paymentAmount = (statement.totalAmount - statement.payments.reduce((sum, payment) => sum + payment.amount, 0)) / 100;
    this.render();
  }

  cancelStatementPayment() {
    this.paymentStatement = undefined;
    this.paymentAmount = 0;
    this.render();
  }

  async submitStatementPayment() {
    if (!this.activeHousehold || !this.paymentStatement || !Number.isFinite(this.paymentAmount) || this.paymentAmount <= 0) {
      this.error = 'Informe um valor de pagamento válido.';
      return;
    }
    const accountId = this.accounts.find((account) => account.isActive)?.id;
    if (!accountId) { this.error = 'Cadastre uma conta ativa para pagar a fatura.'; return; }
    const statement = this.paymentStatement;
    await this.run(async () => {
      await this.api.payStatement(this.activeHousehold!.id, statement.id, { accountId, amount: Math.round(this.paymentAmount * 100), paidOn: new Date().toISOString().slice(0, 10), idempotencyKey: crypto.randomUUID() });
      if (this.selectedCard) this.cardStatements = await this.api.cardStatements(this.activeHousehold!.id, this.selectedCard.id);
      await this.loadDashboard();
      await this.hydrateStatementDetailFromPath(this.router.url.split('?')[0]);
      this.paymentStatement = undefined;
      this.paymentAmount = 0;
    });
  }

  onRecurringSourceChange() { this.recurringForm.accountId = ''; this.recurringForm.cardId = ''; }
  onRecurringTypeChange() { this.recurringForm.subcategoryId = ''; }
  setRecurrenceType(type: TransactionType) {
    if (this.recurringForm.type === type && this.installmentForm.type === type) return;
    this.recurringForm.type = type;
    this.installmentForm.type = type;
    this.onRecurringTypeChange();
    this.onInstallmentTypeChange();
  }
  setFinancialEntryType(context: 'TRANSACTION' | 'RECURRENCE' | 'CARD', type: TransactionType) {
    this.transactionForm.type = type;
    this.onTransactionTypeChange();
    this.setRecurrenceType(type);
  }
  setRecurringCreationMode(mode: FinancialEntryMode) {
    if (mode === 'ONE_OFF') return;
    this.recurrenceCreationMode = mode;
  }
  get canConvertEditingTransaction() {
    return Boolean(this.editingTransactionId && this.editingOccurrence && !this.editingOccurrence.installmentPurchaseId && !this.editingOccurrence.recurringRuleId);
  }
  get editingTransactionScheduleLabel() {
    if (!this.editingOccurrence) return '';
    if (this.editingOccurrence.recurringRuleId) return 'Fixa';
    if (this.editingOccurrence.installmentPurchaseId) return 'Parcelada';
    return 'Avulsa';
  }
  setTransactionCreationMode(mode: FinancialEntryMode) {
    if (this.editingTransactionId && !this.canConvertEditingTransaction) return;
    if (this.editingTransactionId && mode !== 'ONE_OFF') this.prepareTransactionConversion(mode);
    this.transactionCreationMode = mode;
  }
  setCardCreationMode(mode: FinancialEntryMode) {
    this.cardCreationMode = mode;
    this.lockFinancialFormsToCard();
  }
  onFinancialSourceChange(mode: FinancialEntryMode) {
    if (mode === 'FIXED') this.onRecurringSourceChange();
    else if (mode === 'INSTALLMENT') this.onInstallmentSourceChange();
    else this.onTransactionSourceChange();
  }
  async submitFinancialEntry(context: 'TRANSACTION' | 'RECURRENCE' | 'CARD', mode: FinancialEntryMode) {
    if (context === 'TRANSACTION' && this.editingTransactionId && mode !== 'ONE_OFF') return this.convertTransaction(mode);
    if (mode === 'ONE_OFF') return this.saveTransaction();
    if (mode === 'FIXED') return this.saveRecurringRule();
    return this.saveInstallmentPurchase();
  }
  async saveRecurringRule() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const { sourceType, ...form } = this.recurringForm;
      await this.api.createRecurringRule(this.activeHousehold!.id, { ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, amount: Math.round(form.amount * 100), endOn: form.endOn || undefined });
      this.recurringForm = { sourceType: 'ACCOUNT', accountId: this.accounts.find((account) => account.isActive)?.id ?? '', cardId: '', subcategoryId: '', type: this.recurringForm.type, amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
      this.recurringRules = await this.api.recurringRules(this.activeHousehold!.id);
      await this.router.navigateByUrl(this.activeView === 'transactions' ? '/lancamentos' : this.activeView === 'cards' ? '/cartoes' : '/recorrencias');
    });
  }
  private prepareTransactionConversion(mode: Exclude<FinancialEntryMode, 'ONE_OFF'>) {
    const { sourceType, accountId, cardId, subcategoryId, type, amount, description, occurredOn, notes } = this.transactionForm;
    if (mode === 'FIXED') {
      this.recurringForm = { sourceType, accountId, cardId, subcategoryId, type, amount, description, startOn: occurredOn, endOn: '' };
      return;
    }
    this.installmentForm = { sourceType, accountId, cardId, subcategoryId, type, totalAmount: amount, installmentCount: 2, startInstallmentNumber: 1, description, firstOccurredOn: occurredOn };
  }
  private async convertTransaction(mode: Exclude<FinancialEntryMode, 'ONE_OFF'>) {
    if (!this.activeHousehold || !this.editingTransactionId || !this.canConvertEditingTransaction) return;
    await this.run(async () => {
      if (mode === 'FIXED') {
        const { sourceType, ...form } = this.recurringForm;
        await this.api.convertTransaction(this.activeHousehold!.id, this.editingTransactionId!, { mode, ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, amount: Math.round(form.amount * 100), endOn: form.endOn || undefined });
      } else {
        const { sourceType, ...form } = this.installmentForm;
        await this.api.convertTransaction(this.activeHousehold!.id, this.editingTransactionId!, { mode, ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, totalAmount: Math.round(form.totalAmount * 100) });
      }
      this.cancelTransactionEdit();
      await this.loadDashboard();
    });
  }
  async setRecurringRuleStatus(rule: RecurringRule, status: 'ACTIVE' | 'PAUSED' | 'ENDED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setRecurringRuleStatus(this.activeHousehold!.id, rule.id, status); this.recurringRules = await this.api.recurringRules(this.activeHousehold!.id); });
  }

  onInstallmentTypeChange() { this.installmentForm.subcategoryId = ''; }
  onInstallmentSourceChange() { this.installmentForm.accountId = ''; this.installmentForm.cardId = ''; }
  get installmentSubcategories() {
    return this.categories.filter((category) => category.isActive && category.type === this.installmentForm.type)
      .flatMap((category) => category.subcategories.filter((subcategory) => subcategory.isActive).map((subcategory) => ({ ...subcategory, category })));
  }
  async saveInstallmentPurchase() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const { sourceType, ...form } = this.installmentForm;
      await this.api.createInstallmentPurchase(this.activeHousehold!.id, { ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, totalAmount: Math.round(form.totalAmount * 100) });
      this.installmentForm = { sourceType: 'ACCOUNT', accountId: '', cardId: '', subcategoryId: '', type: this.installmentForm.type, totalAmount: 0, installmentCount: 2, startInstallmentNumber: 1, description: '', firstOccurredOn: new Date().toISOString().slice(0, 10) };
      this.installmentPurchases = await this.api.installmentPurchases(this.activeHousehold!.id);
      await this.loadDashboard();
      await this.router.navigateByUrl(this.activeView === 'transactions' ? '/lancamentos' : this.activeView === 'recurrences' ? '/recorrencias' : '/cartoes');
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
      await this.router.navigateByUrl('/orcamento');
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
      await this.router.navigateByUrl('/metas');
    });
  }
  async contributeToGoal(goal: SavingsGoal) {
    if (!this.activeHousehold) return;
    this.contributionGoal = goal;
    this.contributionAmount = 0;
    this.render();
  }
  cancelGoalContribution() {
    this.contributionGoal = undefined;
    this.contributionAmount = 0;
    this.render();
  }
  async submitGoalContribution() {
    if (!this.activeHousehold || !this.contributionGoal || !Number.isFinite(this.contributionAmount) || this.contributionAmount <= 0) {
      this.error = 'Informe uma contribuição válida.';
      return;
    }
    const goal = this.contributionGoal;
    await this.run(async () => {
      await this.api.contributeToGoal(this.activeHousehold!.id, goal.id, { amount: Math.round(this.contributionAmount * 100), occurredOn: new Date().toISOString().slice(0, 10), idempotencyKey: crypto.randomUUID() });
      this.savingsGoals = await this.api.goals(this.activeHousehold!.id);
      this.contributionGoal = undefined;
      this.contributionAmount = 0;
    });
  }
  async setGoalStatus(goal: SavingsGoal, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setGoalStatus(this.activeHousehold!.id, goal.id, status); this.savingsGoals = await this.api.goals(this.activeHousehold!.id); await this.loadArchivedItems(); });
  }

  async setCardStatus(card: Card, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} o cartão ${card.name}?`)) return;
    await this.run(async () => { await this.api.setCardStatus(this.activeHousehold!.id, card.id, isActive); await this.loadDashboard(); await this.loadArchivedItems(); });
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
    this.openAction(`/categorias/${category.id}/editar`);
  }

  cancelCategoryEdit() {
    this.editingCategoryId = undefined;
    this.categoryForm = { name: '', type: 'EXPENSE', color: '#5B5BD6', icon: 'sell' };
    this.cancelAction('categorias');
  }

  async setCategoryStatus(category: Category, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a categoria ${category.name}?`)) return;
    await this.run(async () => {
      await this.api.setCategoryStatus(this.activeHousehold!.id, category.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
      await this.loadArchivedItems();
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
    if (subcategory.isDefault) { this.editCategory(category); return; }
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryForm = { categoryId: category.id, name: subcategory.name };
    this.openAction(`/categorias/subcategorias/${subcategory.id}/editar`);
  }

  cancelSubcategoryEdit() {
    this.editingSubcategoryId = undefined;
    this.subcategoryForm = { categoryId: '', name: '' };
    this.cancelAction('categorias');
  }

  async setSubcategoryStatus(category: Category, subcategory: Category['subcategories'][number], isActive: boolean) {
    if (subcategory.isDefault || !this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a subcategoria ${subcategory.name}?`)) return;
    await this.run(async () => {
      await this.api.setSubcategoryStatus(this.activeHousehold!.id, subcategory.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
      await this.loadArchivedItems();
    });
  }

  archivedItemTypeLabel(type: ArchivedFinanceItemType) {
    return ({ ACCOUNT: 'Conta', CARD: 'Cartão', CATEGORY: 'Categoria', SUBCATEGORY: 'Subcategoria' } as const)[type];
  }

  async reactivateArchivedFinanceItem(type: ArchivedFinanceItemType, item: { id: string; name: string }) {
    if (!this.activeHousehold || !confirm(`Reativar ${this.archivedItemTypeLabel(type).toLowerCase()} ${item.name}?`)) return;
    await this.run(async () => {
      if (type === 'ACCOUNT') await this.api.setAccountStatus(this.activeHousehold!.id, item.id, true);
      else if (type === 'CARD') await this.api.setCardStatus(this.activeHousehold!.id, item.id, true);
      else if (type === 'CATEGORY') await this.api.setCategoryStatus(this.activeHousehold!.id, item.id, true);
      else await this.api.setSubcategoryStatus(this.activeHousehold!.id, item.id, true);
      await this.loadDashboard();
      await this.loadArchivedItems();
    });
  }

  async reactivateArchivedGoal(goal: SavingsGoal) {
    if (!this.activeHousehold || !confirm(`Reativar a meta ${goal.name}?`)) return;
    await this.run(async () => {
      await this.api.setGoalStatus(this.activeHousehold!.id, goal.id, 'ACTIVE');
      await this.loadDashboard();
      await this.loadArchivedItems();
    });
  }

  async reactivateArchivedHouseholdMember(member: HouseholdMember) {
    if (!this.activeHousehold || !this.canManageHouseholdUsers || !confirm(`Reativar ${member.displayName || member.user.name} neste grupo?`)) return;
    await this.run(async () => {
      await this.api.updateHouseholdMember(this.activeHousehold!.id, member.userId, { role: member.role as 'MANAGER' | 'MEMBER' | 'VIEWER', displayName: member.displayName, isActive: true, archive: false });
      await this.loadHouseholdManagement();
      await this.loadArchivedItems();
    });
  }

  async deleteArchivedFinanceItem(type: ArchivedFinanceItemType, item: { id: string; name: string }) {
    if (!this.activeHousehold || !confirm(`Excluir definitivamente ${this.archivedItemTypeLabel(type).toLowerCase()} ${item.name}? Esta ação não pode ser desfeita.`)) return;
    this.loading = true;
    this.archivedDeletionBlockedMessage = '';
    this.render();
    try {
      await this.api.deleteArchivedFinanceItem(this.activeHousehold.id, type, item.id);
      await this.loadDashboard();
      await this.loadArchivedItems();
    } catch (error: unknown) {
      this.archivedDeletionBlockedMessage = this.messageForError(error);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async deleteArchivedGoal(goal: SavingsGoal) {
    if (!this.activeHousehold || !confirm(`Excluir definitivamente a meta ${goal.name}? Esta ação não pode ser desfeita.`)) return;
    this.loading = true;
    this.archivedDeletionBlockedMessage = '';
    this.render();
    try {
      await this.api.deleteArchivedGoal(this.activeHousehold.id, goal.id);
      await this.loadDashboard();
      await this.loadArchivedItems();
    } catch (error: unknown) {
      this.archivedDeletionBlockedMessage = this.messageForError(error);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async deleteArchivedHouseholdMember(member: HouseholdMember) {
    if (!this.activeHousehold || !this.canManageHouseholdUsers || !confirm(`Excluir definitivamente o vínculo de ${member.displayName || member.user.name} deste grupo? Esta ação não pode ser desfeita.`)) return;
    this.loading = true;
    this.archivedDeletionBlockedMessage = '';
    this.render();
    try {
      await this.api.deleteArchivedHouseholdMember(this.activeHousehold.id, member.userId);
      await this.loadHouseholdManagement();
      await this.loadArchivedItems();
    } catch (error: unknown) {
      this.archivedDeletionBlockedMessage = this.messageForError(error);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  closeArchivedDeletionBlockedMessage() {
    this.archivedDeletionBlockedMessage = '';
    this.render();
  }

  onTransactionTypeChange() { this.transactionForm.subcategoryId = ''; }
  onTransactionSourceChange() { this.transactionForm.accountId = ''; this.transactionForm.cardId = ''; }

  async applyTransactionFilters(page = 1) {
    if (!this.activeHousehold) return;
    this.transactionPage = page;
    await this.run(() => this.loadTransactions());
  }

  clearTransactionFilters() {
    this.transactionFilters = { ...this.transactionMonthBounds(), accountId: '', cardId: '', categoryId: '', subcategoryId: '', type: undefined, status: undefined, importBatchId: '' };
    void this.applyTransactionFilters();
  }

  onFilterCategoryChange() {
    this.transactionFilters.subcategoryId = '';
    void this.applyTransactionFilters();
  }

  onFilterAccountChange() {
    this.transactionFilters.cardId = '';
    void this.applyTransactionFilters();
  }

  onFilterCardChange() {
    this.transactionFilters.accountId = '';
    void this.applyTransactionFilters();
  }

  setFilterCategory(categoryId: string) {
    this.transactionFilters.categoryId = categoryId;
    this.onFilterCategoryChange();
  }

  setFilterSubcategory(subcategoryId: string) {
    this.transactionFilters.subcategoryId = subcategoryId;
    void this.applyTransactionFilters();
  }

  async saveTransaction() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const { sourceType, ...form } = this.transactionForm;
      const data = { ...form, accountId: sourceType === 'ACCOUNT' ? form.accountId : undefined, cardId: sourceType === 'CARD' ? form.cardId : undefined, notes: form.notes || undefined, amount: Math.round(form.amount * 100) };
      if (this.editingTransactionId) {
        if (this.occurrenceEditScope === 'FOLLOWING' && (this.editingOccurrence?.installmentPurchaseId || this.editingOccurrence?.recurringRuleId)) await this.api.updateTransactionOccurrence(this.activeHousehold!.id, this.editingTransactionId, { ...data, scope: 'FOLLOWING' });
        else await this.api.updateTransaction(this.activeHousehold!.id, this.editingTransactionId, data);
      }
      else await this.api.createTransaction(this.activeHousehold!.id, data);
      this.cancelTransactionEdit();
      await this.loadDashboard();
    });
  }

  async editTransaction(transaction: Transaction) {
    if (transaction.isForecast) {
      if (!this.activeHousehold || !transaction.recurringRuleId) return;
      const confirmed = confirm('O registro desta despesa ou receita fixa ainda não foi gerado. Deseja gerá-lo antecipadamente para edição?');
      if (!confirmed) return;
      await this.run(async () => {
        const materialized = await this.api.materializeRecurringOccurrence(this.activeHousehold!.id, transaction.recurringRuleId!, transaction.occurredOn.slice(0, 10));
        await this.loadDashboard();
        this.startTransactionEdit(materialized);
      });
      return;
    }
    this.startTransactionEdit(transaction);
  }

  private startTransactionEdit(transaction: Transaction) {
    this.transactionCreationMode = 'ONE_OFF';
    this.editingTransactionId = transaction.id;
    this.editingOccurrence = transaction;
    this.occurrenceEditScope = 'ONE';
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
    this.openAction(`/lancamentos/${transaction.id}/editar`);
  }

  cancelTransactionEdit() {
    this.editingTransactionId = undefined;
    this.editingOccurrence = undefined;
    this.occurrenceEditScope = 'ONE';
    this.transactionForm = { sourceType: 'ACCOUNT', accountId: this.overview?.accounts[0]?.id ?? '', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
    this.cancelAction('lancamentos');
  }

  private lockFinancialFormsToCard() {
    this.transactionForm.sourceType = 'CARD'; this.transactionForm.accountId = '';
    this.recurringForm.sourceType = 'CARD'; this.recurringForm.accountId = '';
    this.installmentForm.sourceType = 'CARD'; this.installmentForm.accountId = '';
  }

  async deleteTransaction(transaction: Transaction | string) {
    if (!this.activeHousehold) return;
    const item = typeof transaction === 'string' ? this.transactions.find((candidate) => candidate.id === transaction) : transaction;
    if (!item) return;
    const scheduled = Boolean(item.recurringRuleId || item.installmentPurchaseId);
    if (scheduled) {
      this.transactionDeletionCandidate = item;
      this.render();
      return;
    }
    await this.confirmTransactionDeletion(item, 'ONE');
  }

  cancelTransactionDeletion() {
    this.transactionDeletionCandidate = undefined;
    this.render();
  }

  async confirmScheduledTransactionDeletion(scope: 'ONE' | 'FOLLOWING') {
    const item = this.transactionDeletionCandidate;
    if (!item) return;
    this.transactionDeletionCandidate = undefined;
    await this.confirmTransactionDeletion(item, scope);
  }

  private async confirmTransactionDeletion(item: Transaction, scope: 'ONE' | 'FOLLOWING') {
    const scheduled = Boolean(item.recurringRuleId || item.installmentPurchaseId);
    const impact = scope === 'FOLLOWING' ? 'Esta e as próximas ocorrências serão removidas.' : 'Somente esta ocorrência será removida.';
    if (!confirm(`Excluir ${scheduled ? 'lançamento agendado' : 'este lançamento'}? ${impact} Esta ação não pode ser desfeita.`)) return;
    await this.run(async () => {
      await this.api.deleteTransaction(this.activeHousehold!.id, item.id, scheduled ? scope : undefined);
      await this.loadDashboard();
      await this.hydrateStatementDetailFromPath(this.router.url.split('?')[0]);
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
      this.transferForm = { sourceAccountId: '', destinationAccountId: '', amount: 0, occurredOn: new Date().toISOString().slice(0, 10), description: '', status: 'PENDING' };
      await this.loadDashboard();
      await this.router.navigateByUrl('/transferencias');
    });
  }

  async setTransferStatus(transfer: AccountTransfer, status: 'PENDING' | 'POSTED' | 'DISCARDED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setTransferStatus(this.activeHousehold!.id, transfer.id, status); await this.loadDashboard(); });
  }
  setTransferEntryMode(mode: 'ONE_OFF' | 'RECURRING') {
    this.transferEntryMode = mode;
    this.render();
  }
  closeRecurringTransferDialog() {
    this.editingRecurringTransferRuleId = undefined;
    this.recurringTransferDialogOpen = false;
    this.recurringTransferForm = { sourceAccountId: '', destinationAccountId: '', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
    this.render();
  }
  async saveRecurringTransferRule() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const form = this.recurringTransferForm;
      const data = { ...form, amount: Math.round(form.amount * 100), description: form.description || undefined, endOn: form.endOn || undefined };
      if (this.editingRecurringTransferRuleId) await this.api.updateRecurringTransferRule(this.activeHousehold!.id, this.editingRecurringTransferRuleId, data);
      else await this.api.createRecurringTransferRule(this.activeHousehold!.id, data);
      this.recurringTransferForm = { sourceAccountId: '', destinationAccountId: '', amount: 0, description: '', startOn: new Date().toISOString().slice(0, 10), endOn: '' };
      this.editingRecurringTransferRuleId = undefined;
      this.recurringTransferDialogOpen = false;
      this.recurringTransferRules = await this.api.recurringTransferRules(this.activeHousehold!.id);
      if (this.activeView === 'transfers' && this.isActionRoute) await this.router.navigateByUrl('/transferencias');
    });
  }
  async setRecurringTransferRuleStatus(rule: RecurringTransferRule, status: 'ACTIVE' | 'PAUSED' | 'ENDED') {
    if (!this.activeHousehold) return;
    await this.run(async () => { await this.api.setRecurringTransferRuleStatus(this.activeHousehold!.id, rule.id, status); this.recurringTransferRules = await this.api.recurringTransferRules(this.activeHousehold!.id); });
  }
  async materializeRecurringTransferOccurrence(rule: RecurringTransferRule) {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      await this.api.materializeRecurringTransferOccurrence(this.activeHousehold!.id, rule.id, new Date().toISOString().slice(0, 10));
      await this.loadDashboard();
    });
  }
  editRecurringTransferRule(rule: RecurringTransferRule) {
    this.editingRecurringTransferRuleId = rule.id;
    this.recurringTransferForm = { sourceAccountId: rule.sourceAccountId, destinationAccountId: rule.destinationAccountId, amount: rule.amount / 100, description: rule.description ?? '', startOn: rule.startOn.slice(0, 10), endOn: rule.endOn?.slice(0, 10) ?? '' };
    this.recurringTransferDialogOpen = true;
    this.render();
  }
  async deleteRecurringTransferRule(rule: RecurringTransferRule) {
    if (!this.activeHousehold || !confirm(`Excluir toda a regra de transferência recorrente “${rule.sourceAccount.name} → ${rule.destinationAccount.name}”? As ocorrências futuras serão removidas.`)) return;
    await this.run(async () => {
      await this.api.deleteRecurringTransferRule(this.activeHousehold!.id, rule.id);
      if (this.editingRecurringTransferRuleId === rule.id) this.closeRecurringTransferDialog();
      this.recurringTransferRules = await this.api.recurringTransferRules(this.activeHousehold!.id);
    });
  }

  onImportFile(event: Event) { this.importForm.file = (event.target as HTMLInputElement).files?.[0]; }

  async previewImport() {
    if (!this.activeHousehold || !this.importForm.file) return;
    await this.run(async () => {
      const contentBase64 = await this.readAsBase64(this.importForm.file!);
      this.importPreview = await this.api.previewImport(this.activeHousehold!.id, { fileName: this.importForm.file!.name, contentBase64, mapping: {}, accountId: this.importForm.accountId || undefined });
      this.importBatches = await this.api.importBatches(this.activeHousehold!.id);
      await this.router.navigateByUrl('/importacoes');
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
    const [overview, accounts, cards, statements, categories, recurringRules, installmentPurchases, budgetSummary, savingsGoals, transfers, recurringTransferRules, importBatches] = await Promise.all([this.api.overview(this.activeHousehold.id, this.referenceMonth), this.api.accounts(this.activeHousehold.id), this.api.cards(this.activeHousehold.id), this.api.statements(this.activeHousehold.id), this.api.categories(this.activeHousehold.id), this.api.recurringRules(this.activeHousehold.id), this.api.installmentPurchases(this.activeHousehold.id), this.api.budgetSummary(this.activeHousehold.id, this.referenceMonth), this.api.goals(this.activeHousehold.id), this.api.transfers(this.activeHousehold.id), this.api.recurringTransferRules(this.activeHousehold.id), this.api.importBatches(this.activeHousehold.id)]);
    this.overview = overview;
    this.accounts = accounts;
    this.cards = cards;
    this.statements = statements;
    this.categories = categories;
    this.recurringRules = recurringRules;
    this.installmentPurchases = installmentPurchases;
    this.budgetSummary = budgetSummary;
    this.savingsGoals = savingsGoals;
    this.transfers = transfers;
    this.recurringTransferRules = recurringTransferRules;
    this.importBatches = importBatches;
    await this.loadTransactions();
    if (!this.transactionForm.accountId) this.transactionForm.accountId = this.overview.accounts[0]?.id ?? '';
    if (!this.importForm.accountId) this.importForm.accountId = this.overview.accounts[0]?.id ?? '';
    const path = this.router.url.split('?')[0];
    this.hydrateActionFromPath(path);
    await this.hydrateStatementDetailFromPath(path);
  }

  private async loadTransactions() {
    if (!this.activeHousehold) return;
    const monthBounds = this.transactionMonthBounds();
    this.transactionFilters = { ...this.transactionFilters, ...monthBounds };
    const page = await this.api.transactions(this.activeHousehold.id, { ...this.transactionFilters, ...monthBounds, page: this.transactionPage, pageSize: this.transactionPageSize });
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

  private async loadArchivedItems() {
    if (!this.activeHousehold || !this.canManageActiveHousehold) return;
    const [financialItems, goals, members] = await Promise.all([
      this.api.archivedFinanceItems(this.activeHousehold.id),
      this.api.archivedGoals(this.activeHousehold.id),
      this.canManageHouseholdUsers ? this.api.archivedHouseholdMembers(this.activeHousehold.id) : Promise.resolve([] as HouseholdMember[]),
    ]);
    this.archivedFinanceItems = financialItems;
    this.archivedGoals = goals;
    this.archivedHouseholdMembers = members;
  }

  private async run(action: () => Promise<void>) {
    this.loading = true;
    this.error = '';
    this.render();
    try { await action(); } catch (error: unknown) { this.error = this.messageForError(error); } finally {
      this.loading = false;
      this.render();
    }
  }

  private render() {
    queueMicrotask(() => this.applicationRef.tick());
  }

  private messageForError(error: unknown) {
    if (error instanceof ApiError && error.issues.length) {
      const labels: Record<string, string> = { accountId: 'Conta ou cartão', cardId: 'Cartão', subcategoryId: 'Subcategoria', type: 'Tipo', amount: 'Valor', totalAmount: 'Valor total', description: 'Descrição', occurredOn: 'Data', startOn: 'Início', firstOccurredOn: 'Data da ocorrência', installmentCount: 'Parcelas', startInstallmentNumber: 'Parcela início' };
      return error.issues.map((issue) => `${labels[issue.path] ?? issue.path}: ${issue.message}`).join(' ');
    }
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
  }

  private syncViewFromUrl(url: string) {
    const path = url.split('?')[0];
    const view = path === '/configuracoes/perfil' ? 'profile'
      : path === '/configuracoes/grupo' ? 'group'
      : path.startsWith('/contas') ? 'accounts'
      : path.startsWith('/cartoes') ? 'cards'
      : path.startsWith('/categorias') ? 'categories'
      : path.startsWith('/lancamentos') ? 'transactions'
          : path.startsWith('/recorrencias') ? 'recurrences'
          : path.startsWith('/orcamento') ? 'budget'
          : path.startsWith('/metas') ? 'goals'
          : path.startsWith('/transferencias') ? 'transfers'
          : path.startsWith('/importacoes') ? 'imports'
          : 'overview';
    this.activeView = view;
    if (path === '/lancamentos/novo') this.transactionCreationMode = 'ONE_OFF';
    if (path === '/transferencias/nova') this.transferEntryMode = 'ONE_OFF';
    if (view === 'recurrences' && path.endsWith('/nova')) this.recurrenceCreationMode = 'FIXED';
    if (path === '/cartoes/parcelamentos/nova') this.lockFinancialFormsToCard();
    if (view === 'group' && this.activeHousehold) {
      this.groupName = this.activeHousehold.name;
      this.financialRealizationMode = this.activeHousehold.financialRealizationMode ?? 'MANUAL';
      if (this.canManageHouseholdUsers) void this.run(() => this.loadHouseholdManagement());
      if (this.canManageActiveHousehold) void this.run(() => this.loadArchivedItems());
    }
    this.hydrateActionFromPath(path);
    if (view === 'cards' && this.activeHousehold) void this.run(() => this.hydrateStatementDetailFromPath(path));
    this.render();
  }

  /** Restores an edit form when an action URL is opened directly or refreshed. */
  private hydrateActionFromPath(path: string) {
    const match = path.match(/^\/(contas|cartoes|lancamentos|categorias)(?:\/subcategorias)?\/([^/]+)\/editar$/);
    if (!match) return;
    const [, domain, id] = match;
    if (domain === 'contas' && id !== this.editingAccountId) {
      const account = this.accounts.find((item) => item.id === id);
      if (account) { this.editingAccountId = account.id; this.accountForm = { name: account.name, type: account.type, bankName: account.bankName ?? '', bankLogoUrl: bankLogoUrlFor(account.bankName, account.bankLogoUrl) ?? '', initialBalance: account.initialBalance / 100 }; }
    } else if (domain === 'cartoes' && id !== this.editingCardId) {
      const card = this.cards.find((item) => item.id === id);
      if (card) { this.editingCardId = card.id; this.cardForm = { name: card.name, issuerName: card.issuerName ?? '', issuerLogoUrl: bankLogoUrlFor(card.issuerName, card.issuerLogoUrl) ?? '', network: card.network, lastFour: card.lastFour ?? '', creditLimit: card.creditLimit === undefined ? null : card.creditLimit / 100, closingDay: card.closingDay, dueDay: card.dueDay }; }
    } else if (domain === 'lancamentos' && id !== this.editingTransactionId) {
      const transaction = this.transactions.find((item) => item.id === id);
      if (transaction) { this.transactionCreationMode = 'ONE_OFF'; this.editingTransactionId = transaction.id; this.editingOccurrence = transaction; this.occurrenceEditScope = 'ONE'; this.transactionForm = { sourceType: transaction.account ? 'ACCOUNT' : 'CARD', accountId: transaction.account?.id ?? '', cardId: transaction.card?.id ?? '', subcategoryId: transaction.subcategory.id, type: transaction.type, amount: transaction.amount / 100, description: transaction.description, occurredOn: transaction.occurredOn.slice(0, 10), notes: transaction.notes ?? '' }; }
    } else if (domain === 'categorias') {
      const category = this.categories.find((item) => item.id === id);
      const subcategory = this.categories.flatMap((item) => item.subcategories.map((sub) => ({ category: item, sub }))).find((item) => item.sub.id === id);
      if (subcategory?.sub.isDefault) { this.editCategory(subcategory.category); return; }
      if (subcategory && id !== this.editingSubcategoryId) { this.editingSubcategoryId = id; this.subcategoryForm = { categoryId: subcategory.category.id, name: subcategory.sub.name }; }
      else if (category && id !== this.editingCategoryId) { this.editingCategoryId = id; this.categoryForm = { name: category.name, type: category.type, color: category.color, icon: category.icon }; }
    }
  }

  private monthEnd(month: string) {
    const [year, monthIndex] = month.split('-').map(Number);
    return `${year}-${String(monthIndex).padStart(2, '0')}-${String(new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()).padStart(2, '0')}`;
  }

  /** Transactions are always scoped to the workspace's selected reference month. */
  private transactionMonthBounds() {
    return { from: `${this.referenceMonth}-01`, to: this.monthEnd(this.referenceMonth) };
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
