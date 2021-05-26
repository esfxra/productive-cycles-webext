export interface TimerSettings {
  cycleAutoStart: boolean;
  breakAutoStart: boolean;
  cycleMinutes: number;
  breakMinutes: number;
  totalPeriods: number;
}

export interface ExtensionSettings extends TimerSettings {
  theme: "light" | "dark";
  showWelcome: boolean;
  showUpdates: boolean;
  showBadge: boolean;
  notificationsEnabled: boolean;
  notificationsSound: boolean;
}

export interface State {
  remaining: string;
  status: string;
  index: number;
}

export interface StateMessage extends State {
  totalPeriods: number;
}

export enum Topic {
  Input = "Input",
  PostMessage = "PostMessage",
  TimerCommand = "TimerCommand",
  TimerTick = "Tick",
  TimerEnd = "TimerEnd",
}

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
