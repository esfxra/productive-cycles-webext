import { INPUT } from './defaults';
import Mediator from './background/Mediator';

export enum Status {
  Initial = 'Initial',
  Running = 'Running',
  Paused = 'Paused',
  Complete = 'Complete',
}

export type Inputs = keyof typeof INPUT | 'StateCheck';

export interface StoredState {
  targets: number[];
  period: number;
  status: Status;
}

// export interface TimerState {
//   remaining: number;
//   period: number;
//   status: Status;
// }

export interface TimerState {
  remaining: number;
  delay: number;
  period: number;
  status: Status;
}

export type Topics = Inputs;

export interface TopicCallback {
  (data?: unknown): void;
}

export type Subscriptions = {
  [key in Topics]?: Array<TopicCallback>;
};

export interface Participant {
  mediator: Mediator;
}

export interface TimelineSettings {
  cycleAutoStart: boolean;
  breakAutoStart: boolean;
  cycleMinutes: number;
  breakMinutes: number;
  totalPeriods: number;
}

export interface ExtensionSettings extends TimelineSettings {
  theme: 'light' | 'dark';
  showWelcome: boolean;
  showUpdates: boolean;
  showBadge: boolean;
  notificationsEnabled: boolean;
  notificationsSound: boolean;
}
