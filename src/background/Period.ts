import Timer from './Timer';
import Alarms from './Alarms';
import { millisToFormattedString } from './utils/utils';
import { TOPICS } from './background-constants';
import { Status } from '../shared-types';
import { State } from './background-types';

class Period extends Timer {
  id: number;
  status: Status;
  target: number;
  enabled: boolean;

  constructor({ id, duration }: { id: number; duration: number }) {
    // Assignments
    super(duration);
    this.id = id;

    // Default values
    this.status = Status.Initial;
    this.target = undefined;
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

    // Set alarm
    Alarms.schedule(`alarm-period-${this.id}`, Date.now() + this.remaining);

    // Run bridge timer
    this.run();
  }

  pause(): void {
    this.stop();
    this.status = Status.Paused;
    PubSub.publishSync(TOPICS.Period.PeriodState);
  }

  skip(): void {
    this.stop();
    PubSub.publishSync(TOPICS.Period.PeriodState);
    // TODO: Implement code to start tasks for the next period
    // - I.E. ... autoStart on or off checks
  }

  reset(duration: number): void {
    this.stop();
    this.status = Status.Initial;
    this.remaining = duration;
    PubSub.publishSync(TOPICS.Period.PeriodState);
    // TODO: Understand if target should be reset to null or undefined
    // TODO: Understand if enabled should be reset to false
  }

  tick(): void {
    // Publish state
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
