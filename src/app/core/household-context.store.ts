import { Injectable, signal } from '@angular/core';
import { Household } from '../models';

@Injectable({ providedIn: 'root' })
export class HouseholdContextStore {
  private readonly householdsState = signal<Household[]>([]);
  private readonly activeHouseholdState = signal<Household | undefined>(undefined);
  private readonly referenceMonthState = signal(new Date().toISOString().slice(0, 7));

  readonly households = this.householdsState.asReadonly();
  readonly activeHousehold = this.activeHouseholdState.asReadonly();
  readonly referenceMonth = this.referenceMonthState.asReadonly();

  setHouseholds(households: Household[]) { this.householdsState.set(households); }
  setActiveHousehold(household: Household | undefined) { this.activeHouseholdState.set(household); }
  setReferenceMonth(referenceMonth: string) { this.referenceMonthState.set(referenceMonth); }

  clear() {
    this.householdsState.set([]);
    this.activeHouseholdState.set(undefined);
  }
}
