import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkspaceState } from './core/workspace-state.service';
import { Category, Transaction } from './models';
import { WorkspacePageComponent } from './workspace-page.component';

registerLocaleData(localePt, 'pt-BR');

const category: Category = {
  id: 'category_1', name: 'Alimentação', type: 'EXPENSE', color: '#123456', icon: 'shopping_cart', isActive: true,
  subcategories: [
    { id: 'automatic_1', categoryId: 'category_1', name: 'Alimentação', isDefault: true, isActive: true },
    { id: 'manual_1', categoryId: 'category_1', name: 'Mercado', isDefault: false, isActive: true },
  ],
};

const transaction: Transaction = {
  id: 'transaction_1', description: 'Compra', amount: 1500, type: 'EXPENSE', status: 'POSTED', occurredOn: '2026-10-06',
  account: { id: 'account_1', name: 'Conta', type: 'CHECKING', initialBalance: 0, isActive: true },
  subcategory: { ...category.subcategories[0], category },
};

describe('Workspace classification UI', () => {
  let state: Record<string, unknown>;

  beforeEach(() => {
    state = {
      activeHousehold: { name: 'Grupo de teste' }, activeView: 'categories', isActionRoute: false,
      categories: [category], displayedCategories: [category], activeCategoryList: [category], expenseCategories: [category], incomeCategories: [], categoryTab: 'EXPENSE', categoryPageCount: 1,
      displayedTransactions: [transaction], transactionTotal: 1, transactionPageCount: 1, currency: 'BRL',
      transactionFilters: {}, accounts: [], cards: [], importBatches: [], filterSubcategories: [],
      filteredSubcategories: category.subcategories.map((subcategory) => ({ ...subcategory, category })),
      transactionForm: { sourceType: 'ACCOUNT', accountId: 'account_1', cardId: '', subcategoryId: '', type: 'EXPENSE', amount: 15, description: 'Compra', occurredOn: '2026-10-06', notes: '' },
      categoryIconLabel: () => 'Mercado',
    };
    TestBed.configureTestingModule({ imports: [WorkspacePageComponent], providers: [{ provide: WorkspaceState, useValue: state }] });
  });

  it('identifies the automatic subcategory and reserves independent actions for manual subcategories', () => {
    const fixture = TestBed.createComponent(WorkspacePageComponent);
    fixture.detectChanges();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.subcategory-row');
    expect(rows[0].textContent).toContain('Alimentação · Genérica');
    expect(rows[0].querySelector('button')).toBeNull();
    expect(rows[1].querySelectorAll('button')).toHaveLength(2);
  });

  it('renders a transaction using its nested parent category without repeating the automatic name', () => {
    state['activeView'] = 'transactions';
    const fixture = TestBed.createComponent(WorkspacePageComponent);
    fixture.detectChanges();
    const element = (fixture.nativeElement as HTMLElement).querySelector('.transaction')!;
    expect(element.textContent).toContain('Alimentação · Conta');
    expect(element.textContent).not.toContain('Alimentação · Alimentação');
    expect((element.querySelector('.category-dot') as HTMLElement).style.background).toBe('rgb(18, 52, 86)');
  });

  it('shows only the subcategory as the transaction detail for a specific classification', () => {
    state['activeView'] = 'transactions';
    state['displayedTransactions'] = [{ ...transaction, subcategory: { ...category.subcategories[1], category } }];
    const fixture = TestBed.createComponent(WorkspacePageComponent);
    fixture.detectChanges();
    const detail = (fixture.nativeElement as HTMLElement).querySelector('.transaction small')!;
    expect(detail.textContent).toContain('Mercado · Conta');
    expect(detail.textContent).not.toContain('Alimentação');
  });

  it('offers one chip autocomplete for selecting automatic and specific subcategories', async () => {
    state['activeView'] = 'transactions';
    state['isActionRoute'] = true;
    state['usesDrawerAction'] = true;
    state['filteredSubcategorySelectionOptions'] = [
      { value: 'automatic_1', label: 'Alimentação', detail: 'Subcategoria genérica', icon: 'shopping_cart', color: '#123456' },
      { value: 'manual_1', label: 'Alimentação · Mercado', detail: 'Subcategoria', icon: 'shopping_cart', color: '#123456' },
    ];
    const fixture = TestBed.createComponent(WorkspacePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('.transaction-form')!;
    const selector = form.querySelector('app-chip-autocomplete') as HTMLElement;
    const input = selector.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(input.getAttribute('aria-label')).toBe('Subcategoria');
    expect(Array.from(selector.querySelectorAll('[role="option"]')).map((option) => option.textContent?.trim())).toEqual(['shopping_cartAlimentaçãoSubcategoria genérica', 'shopping_cartAlimentação · MercadoSubcategoria']);
    expect(form.querySelector('select[name="transactionCategory"]')).toBeNull();
    expect(form.querySelector('select[name="transactionSubcategory"]')).toBeNull();
    expect((form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });
});
