import {
  trigger,
  style,
  animate,
  transition,
  stagger,
  query,
  keyframes
} from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('50ms', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true }),
    query(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
    ], { optional: true })
  ])
]);

export const cardAnimation = trigger('cardAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
  ])
]);

export const chipAnimation = trigger('chipAnimation', [
  transition(':enter', [
    animate('300ms ease-out', keyframes([
      style({ opacity: 0, transform: 'scale(0.5)', offset: 0 }),
      style({ opacity: 0.5, transform: 'scale(1.1)', offset: 0.3 }),
      style({ opacity: 1, transform: 'scale(1)', offset: 1.0 })
    ]))
  ])
]); 