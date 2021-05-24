import PubSub from "pubsub-js";
import { Topics, StateMessage } from "./types";

// The purpose of the Publisher and Subscriber classes ...
// .. is to build type-checked APIs

class Publish {
  // Bridge-related
  static bridgeInput({ input }: { input: string }): void {
    PubSub.publish(Topics.INPUT, { input: input });
  }

  static bridgeMessage(message: StateMessage): void {
    // TODO: Consider adding additional types in the future. This would cover:
    // - Messages related to settings
    // - Messages related to statistics
    PubSub.publish(Topics.POST_MESSAGE, message);
  }

  // Timer-related
  static runTimer({ time }: { time: number }): void {
    PubSub.publish(Topics.TIMER_COMMAND, { command: "run", time: time });
  }

  static stopTimer(): void {
    PubSub.publish(Topics.TIMER_COMMAND, { command: "stop" });
  }
}

class Subscribe {
  static bridgeInput(callback: (input: string) => void): string {
    return PubSub.subscribe(
      Topics.INPUT,
      (_msg: string, data: { input: string }) => {
        callback(data.input);
      }
    );
  }

  static timerTick(callback: (newTime: number) => void): string {
    return PubSub.subscribe(
      Topics.TIMER_TICK,
      (_msg: string, data: { newTime: number }) => {
        callback(data.newTime);
      }
    );
  }

  static timerEnd(callback: () => void): string {
    return PubSub.subscribe(Topics.TIMER_END, () => {
      callback();
    });
  }
}

export { Publish, Subscribe };
