import { ExtensionSettings } from "./types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: "light",
  showWelcome: false,
  showUpdates: false,
  showBadge: true,
  notificationsEnabled: true,
  notificationsSound: true,
  cycleAutoStart: true,
  breakAutoStart: true,
  cycleMinutes: 25,
  breakMinutes: 5,
  totalPeriods: 7,
};
