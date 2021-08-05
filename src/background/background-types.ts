import { TOPICS } from './background-constants';
import Mediator from './Mediator';

export interface TopicCallback {
  (data?: unknown): void;
}

export interface Participant {
  mediator: Mediator;
}

export interface PeriodState {
  remaining: string;
  status: string;
  index: number;
}

export type Topics = keyof typeof TOPICS;

export type Subscriptions = {
  [key in Topics]?: Array<TopicCallback>;
};
