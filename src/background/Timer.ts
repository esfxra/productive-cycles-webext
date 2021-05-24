import PubSub from "pubsub-js";
import { Topics } from "./utils/types";

interface TimerCommand {
  command: "run" | "stop";
  time?: number;
}

class Timer {
  remaining: number;
  subtractor: ReturnType<typeof setInterval>;
  subscriptions: {
    commands: string;
  };

  constructor() {
    this.remaining = undefined;
    this.subtractor = undefined;
    this.subscriptions = {
      commands: undefined,
    };
  }

  registerSubscriptions(): void {
    const handleCommands = (data) => {
      switch (data.command) {
        case "run":
          this.remaining = data.time;
          this.run();
          break;
        case "stop":
          this.stop();
          break;
      }
    };

    this.subscriptions.commands = PubSub.subscribe(
      Topics.TIMER_COMMAND,
      (_msg: string, data: TimerCommand) => {
        handleCommands(data);
      }
    );
  }

  run(): void {
    // Start the timer
    this.subtractor = setInterval(() => {
      this.remaining = this.remaining - 1000;

      if (this.remaining < 0) {
        // Stop and publish to PERIOD_ENDED topic
        this.stop();
        PubSub.publish(Topics.TIMER_END);
      } else {
        // Publish new time value
        PubSub.publish(Topics.TIMER_TICK, { newTime: this.remaining });
      }
    }, 1000);
  }

  stop(): void {
    // Stop the timer
    clearInterval(this.subtractor);
  }
}

export { Timer };
