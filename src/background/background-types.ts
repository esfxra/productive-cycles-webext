import Mediator from './Mediator';
import { TOPICS } from './background-constants';

export interface TopicCallback {
  (data?: unknown): void;
}

export type Topics = keyof typeof TOPICS;

export type Subscriptions = {
  [key in Topics]?: Array<TopicCallback>;
};

export interface Participant {
  mediator: Mediator | null;
}

export interface PeriodState {
  remaining: string;
  status: string;
  index: number;
}
