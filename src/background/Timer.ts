import PubSub from 'pubsub-js';
import { TOPICS } from './background-constants';

class Timer {
  remaining: number;
  subtractor: ReturnType<typeof setInterval> | null;

  constructor({ duration }: { duration: number }) {
    this.remaining = duration;
    this.subtractor = null;
  }

  run(): void {
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
  }

  stop(): void {
    // Stop the timer
    clearInterval(this.subtractor);
  }

  end(): void {
    PubSub.publishSync(TOPICS.Period.PeriodEnd);
  }

  tick(): void {
    PubSub.publishSync(TOPICS.Period.PeriodState);
  }
}

export default Timer;
