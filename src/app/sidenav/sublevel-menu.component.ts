import { Component, Input } from '@angular/core';
import { INavbarData } from './helper';
import { fadeInOut, submenu } from '../animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sublevel-menu',
  template: `
    <ul *ngIf="collapsed && data.subitens && data.subitens.length > 0"
    [@submenu]="expanded
      ? {value: 'visible', 
      params: {transitionParams: '400ms cubic-bezier(0.86, 0, 0.07, 1)', height: '*'}}
      : {value: 'hidden',
          params: {transitionParams: '400ms cubic-bezier(0.86, 0, 0.07, 1)', height: '0'}}"
      class="sublevel-nav"
    >
      <li *ngFor="let item of data.subitens" class="sublevel-nav-item">
        <a class="sublevel-nav-link"
        (click)="handleClick(item)"
        *ngIf="item.subitens && item.subitens.length > 0"
        [ngClass]="getActiveClass(item)"
        >
          <!-- <mat-icon class="sublevel-link-icon">minimize</mat-icon> -->
          <span class="sublevel-link-text" @fadeInOut *ngIf="collapsed">{{item.label}}</span>
            <mat-icon *ngIf="item.subitens && collapsed" class="menu-collapse-icon">
              {{!item.expanded ? 'chevron_right' : 'expand_more'}}
            </mat-icon>
        </a>
        <a class="sublevel-nav-link"
          *ngIf="!item.subitens || (item.subitens && item.subitens.length ===0)"
          [routerLink]="[item.routerLink]"
          routerLinkActive="active-sublevel"
          [routerLinkActiveOptions]="{exact: true}"
        >
        <!-- <mat-icon class="sublevel-link-icon">minimize</mat-icon> -->
        <span class="sublevel-link-text" @fadeInOut *ngIf="collapsed">{{item.label}}</span>
      </a>
        <div *ngIf="item.subitens && item.subitens">
          <app-sublevel-menu
            [data]="item"
            [collapsed]="collapsed"
            [multiple]="multiple"
            [expanded]="item.expanded"
          ></app-sublevel-menu>
        </div>
      </li>
    </ul>
  `,
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    fadeInOut,
    submenu
  ]
})
export class SublevelMenuComponent {

  @Input() data: INavbarData = {
    routerLink: 'dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    subitens: []
  }

  @Input() collapsed = false;
  @Input() animating: boolean | undefined;
  @Input() expanded: boolean | undefined;
  @Input() multiple: boolean = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
  }

  handleClick(item: any): void {
    if(!this.multiple) {
      if(this.data.subitens && this.data.subitens.length >0) {
        for(let modelItem of this.data.subitens) {
          if(item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      }
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(item: INavbarData): string {
    return item.expanded && this.router.url.includes(item.routerLink) ? 'active-sublevel' : '';
  }
}
