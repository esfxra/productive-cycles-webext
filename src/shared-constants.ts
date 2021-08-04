import { ExtensionSettings } from './shared-types';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'light',
  showWelcome: false,
  showUpdates: false,
  showBadge: true,
  notificationsEnabled: true,
  notificationsSound: true,
  cycleAutoStart: true,
  breakAutoStart: false,
  cycleMinutes: 2,
  breakMinutes: 1,
  totalPeriods: 7,
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
