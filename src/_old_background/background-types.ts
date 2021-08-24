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

export interface Notification {
  id: string;
  title: string;
  message: string;
}

export type Topics = keyof typeof TOPICS;

export type Subscriptions = {
  [key in Topics]?: Array<TopicCallback>;
};
