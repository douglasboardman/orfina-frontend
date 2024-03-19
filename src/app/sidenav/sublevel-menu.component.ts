import { Component, Input, OnInit } from '@angular/core';
import { INavbarData } from './helper';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
        >
          <mat-icon class="sublevel-link-icon">arrow_right</mat-icon>
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
        <mat-icon class="sublevel-link-icon">arrow_right</mat-icon>
        <span class="sublevel-link-text" *ngIf="collapsed">{{item.label}}</span>
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
    trigger('submenu', [
      state('hidden', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*'
      })),
      transition('visible <=> hidden', [style({overflow: 'hidden'}),
      animate('{{transitionParams}}')]),
      transition('void => *', animate(0))
    ])
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

  constructor() {}

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
}
