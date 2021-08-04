import Mediator from './Mediator';
import { millisToFormattedString } from './utils/utils';
import { Participant, PeriodState } from './background-types';
import { Status } from '../shared-types';

class Period implements Participant {
  mediator: Mediator;
  subtractor: ReturnType<typeof setInterval> | null;
  id: number;
  remaining: number;
  status: Status;
  target: number | null;
  enabled: boolean;

  constructor({
    mediator,
    id,
    duration,
  }: {
    mediator: Mediator;
    id: number;
    duration: number;
  }) {
    this.mediator = mediator;
    this.id = id;
    this.remaining = duration;

    this.status = Status.Initial;
    this.target = null;
    this.enabled = false;
  }

  get state(): PeriodState {
    return {
      remaining: millisToFormattedString(this.remaining),
      status: this.status,
      index: this.id,
    };
  }

  start(): void {
    this.status = Status.Running;
    this.mediator.publish('PeriodTick');

    this.run();
  }

  pause(): void {
    this.stop();
    this.status = Status.Paused;
    this.mediator.publish('PeriodTick');
  }

  skip(): void {
    this.stop();
    this.complete();
    this.mediator.publish('PeriodEnd');
  }

  reset({ duration, publish }: { duration: number; publish: boolean }): void {
    this.stop();
    this.remaining = duration;
    this.status = Status.Initial;
    this.target = null;
    this.enabled = false;

    if (publish) {
      this.mediator.publish('PeriodTick');
    }
  }

  /**
   * Queue end tasks to be checked by _____.
   * This is to prevent conflicts with the alarm set in parallel when the period was started.
   */
  complete(): void {
    this.status = Status.Complete;
  }

  run = (): void => {
    // Start the timer
    this.subtractor = setInterval(() => {
      this.remaining = this.remaining - 1000;

      if (this.remaining < 0) {
        // Stop subtracting
        this.stop();
        this.end();
        return;
      }

      // Post new time to period
      this.tick();
      return;
    }, 1000);
  };

  stop = (): void => {
    // Stop the timer
    clearInterval(this.subtractor);
  };

  end = (): void => {
    this.complete();
    this.mediator.publish('PeriodEnd');
  };

  tick = (): void => {
    this.mediator.publish('PeriodTick');
  };
}

export default Period;
