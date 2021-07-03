export interface State {
  remaining: string;
  status: string;
  index: number;
}

export interface StateMessage extends State {
  totalPeriods: number;
}
