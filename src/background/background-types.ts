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
  PostMessage = "PostMessage",
  State = "State",
  Index = "Index",
}
