import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [
      style({opacity: 0}),
      animate('350ms',
      style({opacity: 1}))
    ]),
    transition(':leave', [
      style({opacity: 1}),
      animate('350ms',
      style({opacity: 0}))
    ])
  ]);

  export const rotate = trigger('rotate',[
    transition(':enter', [
      animate('1000ms',
      keyframes([
        style({transform: 'rotate(0deg)', offset: '0'}),
        style({transform: 'rotate(2turn)', offset: '1'})
      ]))
    ])
  ]);

  export const submenu = trigger('submenu', [
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
  ]);