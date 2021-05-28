export interface State {
  remaining: string;
  status: string;
  index: number;
}

export interface StateMessage extends State {
  totalPeriods: number;
}

export enum Topic {
  Start = "Start",
  Pause = "Pause",
  Skip = "Skip",
  ResetCycle = "ResetCycle",
  ResetAll = "ResetAll",
  Preload = "Preload",
  State = "State",
}
