import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import {
  LucideArrowDownLeft, LucideArrowDownUp, LucideArrowLeftRight, LucideArrowUpRight, LucideBadgeDollarSign, LucideChevronDown, LucideChevronLeft,
  LucideChevronRight, LucideCircle, LucideClock3, LucideCreditCard, LucideGoal, LucideHouse, LucideLandmark,
  LucideLayoutDashboard, LucideLogOut, LucideMenu, LucideMoon, LucidePlus, LucideSun,
  LucideReceiptText, LucideRefreshCcw, LucideTags, LucideUpload, LucideUsersRound, LucideWalletCards, LucideX,
} from '@lucide/angular';

/** Local SVG icon set used by product navigation and status controls. */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container *ngComponentOutlet="icon" />`,
  styles: [':host{display:inline-flex;width:1.25rem;height:1.25rem;flex:none}:host ::ng-deep svg{width:100%;height:100%;stroke-width:1.9}'],
})
export class AppIconComponent {
  @Input({ required: true }) name = 'circle';

  get icon(): Type<unknown> {
    return icons[this.name] ?? LucideCircle;
  }
}

const icons: Record<string, Type<unknown>> = {
  circle: LucideCircle, menu: LucideMenu, close: LucideX, home: LucideHouse, users: LucideUsersRound, chevronDown: LucideChevronDown,
  chevronLeft: LucideChevronLeft, chevronRight: LucideChevronRight, overview: LucideLayoutDashboard,
  accounts: LucideLandmark, cards: LucideCreditCard, recurring: LucideRefreshCcw,
  budget: LucideWalletCards, goals: LucideGoal, transactions: LucideArrowDownUp,
  transfers: LucideArrowLeftRight, imports: LucideUpload, categories: LucideTags,
  income: LucideArrowUpRight, expense: LucideArrowDownLeft,
  theme: LucideMoon, moon: LucideMoon, sun: LucideSun, logout: LucideLogOut, plus: LucidePlus, sync: LucideRefreshCcw,
  planned: LucideWalletCards, spent: LucideReceiptText, pending: LucideClock3,
  available: LucideBadgeDollarSign,
};

const paths: Record<string, string> = {
  circle: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'm7 10 5 5 5-5',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  overview: 'M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z',
  accounts: 'M4 6.5 12 3l8 3.5M5 9h14M6 9v8m4-8v8m4-8v8m4-8v8M4 20h16',
  cards: 'M3.5 6.5h17v11h-17zM3.5 10h17M7 15h3',
  recurring: 'M19 8V4m0 0-3 3m3-3 3 3M5 16v4m0 0 3-3m-3 3-3-3M6 8a7 7 0 0 1 11.5-2M18 16A7 7 0 0 1 6.5 18',
  budget: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h4',
  goals: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  transactions: 'M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3',
  transfers: 'M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3',
  imports: 'M12 16V3m0 0-4 4m4-4 4 4M5 14v5h14v-5',
  categories: 'M4 5h16v14H4zM8 9h8M8 13h5',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6.5-1.4 1.4M6.4 17.6 5 19m14 0-1.4-1.4M6.4 6.4 5 5',
  theme: 'M12 3a9 9 0 1 0 9 9c0-.6-.1-1.2-.2-1.7A7 7 0 0 1 12 3Z',
  logout: 'M10 5H5v14h5m4-4 4-3-4-3m4 3H9',
  plus: 'M12 5v14M5 12h14',
  sync: 'M19 8V4m0 0-3 3m3-3 3 3M5 16v4m0 0 3-3m-3 3-3-3M6 8a7 7 0 0 1 11.5-2M18 16A7 7 0 0 1 6.5 18',
};
