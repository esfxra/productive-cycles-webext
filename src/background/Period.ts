import { Timer } from "./Timer";
import { millisToFormattedString } from "./utils/utils";
import { Status } from "../shared-types";
import { State } from "./background-types";

interface PeriodConstructor {
  id: number;
  duration: number;
  nextPeriod: () => void;
  publishState: () => void;
}

class Period extends Timer {
  id: number;
  status: Status;
  target: number;
  enabled: boolean;
  nextPeriod: () => void;
  publishState: () => void;

  constructor({ id, duration, nextPeriod, publishState }: PeriodConstructor) {
    // Assignments
    super(duration);
    this.id = id;
    this.nextPeriod = nextPeriod;
    this.publishState = publishState;

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
    this.nextPeriod();
    // TODO: Implement code to start tasks for the next period
    // - I.E. ... autoStart on or off checks
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

    this.nextPeriod();
    // this.publishState();
    // this.incrementIndex();
  }
}

export { Period };
