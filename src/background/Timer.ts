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
      } else {
        // Post new time to period
        this.tick();
      }
    }, 1000);
  }

  stop(): void {
    // Stop the timer
    clearInterval(this.subtractor);
    this.end();
  }

  tick(): void {
    // To be overriden
  }

  end(): void {
    // To be overriden
  }
}

export { Timer };
