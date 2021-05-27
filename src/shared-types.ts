export enum Input {
  Start = "Start",
  Pause = "Pause",
  Skip = "Skip",
  ResetCycle = "ResetCycle",
  ResetAll = "ResetAll",
  Preload = "Preload",
}

export enum Status {
  Initial = "Initial",
  Running = "Running",
  Paused = "Paused",
  Complete = "Complete",
}

export interface TimelineSettings {
  cycleAutoStart: boolean;
  breakAutoStart: boolean;
  cycleMinutes: number;
  breakMinutes: number;
  totalPeriods: number;
}

export interface ExtensionSettings extends TimelineSettings {
  theme: "light" | "dark";
  showWelcome: boolean;
  showUpdates: boolean;
  showBadge: boolean;
  notificationsEnabled: boolean;
  notificationsSound: boolean;
}
