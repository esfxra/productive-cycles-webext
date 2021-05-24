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

export type setRemainingCallback = (time: number) => void;

export interface State {
  remaining: string;
  status: string;
  periodIndex: number;
}

export interface StateMessage extends State {
  totalPeriods: number;
}

export enum Topics {
  INPUT = "INPUT",
  POST_MESSAGE = "POST_MESSAGE",
  TIMER_COMMAND = "TIMER_COMMAND",
  TIMER_TICK = "TICK",
  TIMER_END = "PERIOD_ENDED",
}
