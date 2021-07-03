import { ExtensionSettings } from './shared-types';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'light',
  showWelcome: false,
  showUpdates: false,
  showBadge: true,
  notificationsEnabled: true,
  notificationsSound: true,
  cycleAutoStart: true,
  breakAutoStart: true,
  cycleMinutes: 0.1,
  breakMinutes: 5,
  totalPeriods: 7,
};

export const INPUT = {
  Start: 'Start',
  Pause: 'Pause',
  Skip: 'Skip',
  ResetCycle: 'ResetCycle',
  ResetAll: 'ResetAll',
  Preload: 'Preload',
};
