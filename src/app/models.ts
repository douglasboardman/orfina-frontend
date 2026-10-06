export type Theme = 'light' | 'dark';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AccountType = 'CHECKING' | 'SALARY' | 'SAVINGS' | 'INVESTMENT' | 'CASH';

export interface Household { id: string; name: string; currency: string; timezone: string; members: { role: string }[]; }
export interface HouseholdMember { householdId: string; userId: string; role: string; user: { id: string; name: string; email: string; avatarUrl?: string }; }
export interface HouseholdInvitation { id: string; householdId: string; email: string; role: 'MEMBER' | 'VIEWER'; status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'; expiresAt: string; household?: { id: string; name: string; currency: string }; }
export interface Account { id: string; name: string; type: AccountType; bankName?: string; bankLogoUrl?: string; initialBalance: number; balance?: number; isActive: boolean; }
export interface Card { id: string; name: string; issuerName?: string; issuerLogoUrl?: string; network: import('./financial-brands').CardNetwork; lastFour?: string; creditLimit?: number; closingDay: number; dueDay: number; isActive: boolean; }
export type CardStatementStatus = 'OPEN' | 'CLOSED' | 'PAID';
export interface CardPayment { id: string; accountId: string; amount: number; paidOn: string; }
export interface CardStatement { id: string; cardId: string; cycleStart: string; cycleEnd: string; dueOn: string; totalAmount: number; status: CardStatementStatus; payments: CardPayment[]; }
export interface InstallmentPurchase { id: string; cardId: string; totalAmount: number; installmentCount: number; description: string; firstOccurredOn: string; canceledAt?: string; card: Card; transactions: { id: string; installmentNumber?: number; amount: number; statement?: { status: CardStatementStatus } }[]; }
export type RecurringRuleStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';
export interface RecurringRule { id: string; accountId?: string; cardId?: string; amount: number; description: string; type: TransactionType; startOn: string; endOn?: string; status: RecurringRuleStatus; account?: Account; card?: Card; category: Category; subcategory: Subcategory; }
export interface Subcategory { id: string; name: string; categoryId: string; isDefault: boolean; isActive: boolean; }
export interface Category { id: string; name: string; type: TransactionType; color: string; icon: string; isActive: boolean; subcategories: Subcategory[]; }
export type TransactionStatus = 'PENDING' | 'POSTED' | 'DISCARDED';
export type AccountTransferStatus = TransactionStatus;
export interface Transaction { id: string; description: string; amount: number; type: TransactionType; status: TransactionStatus; occurredOn: string; notes?: string; account?: Account; card?: Card; subcategory: Subcategory & { category: Category }; }
export interface TransactionFilters { page?: number; pageSize?: number; from?: string; to?: string; accountId?: string; cardId?: string; statementId?: string; recurringRuleId?: string; categoryId?: string; subcategoryId?: string; type?: TransactionType; status?: TransactionStatus; importBatchId?: string; }
export interface TransactionPage { items: Transaction[]; total: number; page: number; pageSize: number; }
export interface Overview {
  referenceMonth: string;
  isForecast: boolean;
  totalBalance: number;
  pendingCommitments: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  cardOpenTotal: number;
  upcomingStatements: (CardStatement & { card: Card })[];
  recurringForecast: { id: string; amount: number; description: string; startOn: string; endOn?: string }[];
  indicators: { availableBalance: number; realizedIncome: number; realizedExpenses: number; pendingCommitments: number; cardOpenTotal: number; budgetCommitted: number };
  comparison: { income: { current: number; previous: number }; expenses: { current: number; previous: number }; balance: { current: number; previous: number } };
  charts: { weeklyFlow: { week: number; income: number; expenses: number }[]; expenseByCategory: { categoryId: string; name: string; color: string; amount: number }[]; budget: { limitAmount: number; spentAmount: number; pendingAmount: number } };
}
export interface BudgetRow { id: string; categoryId: string; limitAmount: number; notes?: string; category: Category; spentAmount: number; pendingAmount: number; availableAmount: number; percentUsed: number; }
export interface BudgetSummary { referenceMonth: string; isClosed: boolean; closedAt?: string; rows: BudgetRow[]; unbudgeted: { category: Category; spentAmount: number; pendingAmount: number }[]; totals: { plannedAmount: number; spentAmount: number; pendingAmount: number; availableAmount: number; unbudgetedAmount: number; projectedRecurring: number; projectedInstallments: number; cardOpenTotal: number }; }
export interface AccountTransfer { id: string; sourceAccountId: string; destinationAccountId: string; amount: number; occurredOn: string; status: AccountTransferStatus; description?: string; sourceAccount: Account; destinationAccount: Account; importItem?: { batchId: string }; }
export type ImportBatchStatus = 'DRAFT' | 'VALIDATED' | 'COMMITTED' | 'CANCELED' | 'FAILED';
export interface ImportItem { id: string; rowNumber: number; status: 'VALID' | 'INVALID' | 'POSSIBLE_DUPLICATE' | 'COMMITTED' | 'CANCELED'; diagnostics?: { code: string; message: string }[]; data: { description?: string; amount?: number; occurredOn?: string; kind?: string }; }
export interface ImportBatch { id: string; fileName?: string; format: string; status: ImportBatchStatus; diagnostics?: { totalRows?: number; validCount?: number; invalidCount?: number }; items?: ImportItem[]; createdAt: string; }
export type SavingsGoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export interface SavingsGoal { id: string; name: string; targetAmount: number; targetDate?: string; color: string; icon?: string; status: SavingsGoalStatus; savedAmount: number; remainingAmount: number; percentComplete: number; monthlyRequiredAmount: number | null; contributions: { id: string; amount: number; occurredOn: string; notes?: string }[]; }
