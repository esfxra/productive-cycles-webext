import { TOPICS } from './background-constants';

class Timer {
  remaining: number;
  subtractor: ReturnType<typeof setInterval>;

  constructor(duration: number) {
    this.remaining = duration;
    this.subtractor = undefined;
  }

  run(): void {
    // Start the timer
    this.subtractor = setInterval(() => {
      this.remaining = this.remaining - 1000;

      if (this.remaining < 0) {
        // Stop subtracting
        this.stop();
        this.end();
      } else {
        // Post new time to period
        this.tick();
      }
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
    // To be overriden
  }
}

export default Timer;
