import Timer from './Timer';
import PubSub from 'pubsub-js';
import { millisToFormattedString } from './utils/utils';
import { TOPICS } from './background-constants';
import { Status } from '../shared-types';
import { State } from './background-types';

class Period extends Timer {
  id: number;
  status: Status;
  target: number | null;
  enabled: boolean;

  constructor({ id, duration }: { id: number; duration: number }) {
    // Assignments
    super({ duration });
    this.id = id;

    // Default values
    this.status = Status.Initial;
    this.target = null;
    this.enabled = false;
  }

  get state(): State {
    return {
      remaining: millisToFormattedString(this.remaining),
      status: this.status,
      index: this.id,
    };
  }

  start(): void {
    this.status = Status.Running;
    PubSub.publishSync(TOPICS.Period.PeriodState);

    this.run();
  }

  pause(): void {
    this.stop();
    this.status = Status.Paused;
    PubSub.publishSync(TOPICS.Period.PeriodState);
  }

  skip(): void {
    this.stop();
    this.complete();
    PubSub.publishSync(TOPICS.Period.PeriodState);
  }

  reset({ duration }: { duration: number }): void {
    this.stop();
    this.remaining = duration;
    this.status = Status.Initial;
    this.target = null;
    this.enabled = false;
    PubSub.publishSync(TOPICS.Period.PeriodState);
  }

  /**
   * Queue end tasks to be checked by _____.
   * This is to prevent conflicts with the alarm set in parallel when the period was started.
   */
  complete(): void {
    this.status = Status.Complete;
  }
}

export default Period;
