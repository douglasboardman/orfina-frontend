import { Component, Input, OnInit } from '@angular/core';
import { INavbarData } from './helper';

@Component({
  selector: 'app-sublevel-menu',
  template: `
    <ul *ngIf="collapsed && data.subitens && data.subitens.length > 0"
      class="sublevel-nav"
    >
      <li *ngFor="let item of data.subitens" class="sublevel-nav-item">
        <a class="sublevel-nav-link"
          *ngIf="item.subitens && item.subitens.length > 0"
        >
          <span class="sublevel-link-text" *ngIf="collapsed">{{item.label}}</span>
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
        <span class="sublevel-link-text" *ngIf="collapsed">{{item.label}}</span>
      </a>
      <div *ngIf="item.subitens && item.subitens"></div>
      </li>
    </ul>
  `,
  styleUrls: ['./sidenav.component.scss']
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

  constructor() {}

  ngOnInit(): void {
  }
}
