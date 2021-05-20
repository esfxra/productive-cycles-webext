export interface TimerSettings {
  cycleAutoStart: boolean;
  breakAutoStart: boolean;
  cycleMinutes: number;
  breakMinutes: number;
  totalPeriods: number;
}

export interface ExtensionSettings extends TimerSettings {
  showWelcome: boolean;
  showUpdates: boolean;
  showBadge: boolean;
  notificationsEnabled: boolean;
  notificationsSound: boolean;
}

export interface Comms {
  port: chrome.runtime.Port | null;
  open: boolean;
}
