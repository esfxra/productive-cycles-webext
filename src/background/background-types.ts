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
