import PubSub from "pubsub-js";
import { Timer } from "./Timer";
import { millisToFormattedString } from "./utils/utils";
import { Status } from "../shared-types";
import { State, Topic } from "./background-types";

interface PeriodWithTimer {
  id: number;
  remaining: number;
  status: Status;
  target: number;
  enabled: boolean;

  start: () => void;
  pause: () => void;
  reset: (duration: number) => void;
  run: () => void;
  stop: () => void;
  tick: () => void;
  end: () => void;
}

class Period extends Timer implements PeriodWithTimer {
  id: number;
  status: Status;
  target: number;
  enabled: boolean;

  constructor(id: number, duration: number) {
    super(duration);

    this.id = id;
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
    this.publishState();
    this.run();
  }

  pause(): void {
    this.stop();
    this.status = Status.Paused;
    this.publishState();
  }

  skip(): void {
    this.stop();
    this.status = Status.Complete;
    this.publishIndex();
  }

  reset(duration: number): void {
    this.stop();
    this.status = Status.Initial;
    this.remaining = duration;
    // TODO: Understand if target should be reset to null or undefined
    // TODO: Understand if enabled should be reset to false
  }

  tick(): void {
    // Publish state
    this.publishState();
  }

  end(): void {
    // Mark period as complete, publish state, perform timeline index update
    this.status = Status.Complete;
    this.publishState();
    this.publishIndex();
  }

  publishIndex(): void {
    // TODO: This could be better implemented by a method passed down from the Timeline class
    PubSub.publishSync(Topic.Index, { index: this.id + 1 });
  }

  publishState(): void {
    PubSub.publish(Topic.State, this.state);
  }
}

export { Period };
