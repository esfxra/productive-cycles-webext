import { ExtensionSettings, StoredState, TimerState, Status } from './types';

export const SETTINGS: ExtensionSettings = {
  theme: 'light',
  showWelcome: false,
  showUpdates: false,
  showBadge: true,
  notificationsEnabled: true,
  notificationsSound: true,
  cycleAutoStart: true,
  breakAutoStart: true,
  cycleMinutes: 0.2,
  breakMinutes: 0.1,
  totalPeriods: 7,
};

export const STORED_STATE: StoredState = {
  targets: [],
  period: 0,
  status: Status.Initial,
};

export const TIMER_STATE: TimerState = {
  remaining: SETTINGS.cycleMinutes * 60000,
  delay: null,
  period: 0,
  status: Status.Initial,
};

/**
 * @todo Use enum type-checking instead of string-based values
 */
export const INPUT = {
  Start: 'Start',
  Pause: 'Pause',
  Skip: 'Skip',
  ResetCycle: 'ResetCycle',
  ResetAll: 'ResetAll',
  Preload: 'Preload',
};
