import { Duration } from "luxon";
import { Publish, Subscribe } from "./utils/utils";
import { Period, Timeline } from "./Timeline";
import { TimerSettings, State, Status, Input } from "./utils/types";

class Manager {
  timeline: Timeline;

  settings: TimerSettings;

  subscriptions: {
    input: string;
    tick: string;
    periodEnd: string;
  };

  constructor(settings: TimerSettings) {
    // Use settings to initialize timeline
    this.timeline = new Timeline({
      totalPeriods: settings.totalPeriods,
      cycleMillis: minutesToMillis(settings.cycleMinutes),
      breakMillis: minutesToMillis(settings.breakMinutes),
    });
    // Set the index for the current period at 0
    this.timeline.index = 0;
    // Store the settings object
    this.settings = settings;

    this.subscriptions = {
      input: undefined,
      tick: undefined,
      periodEnd: undefined,
    };
  }

  get current(): Period {
    return this.timeline.periods[this.timeline.index];
  }

  get state(): State {
    return {
      remaining: millisToFormattedString(this.current.remaining),
      status: this.current.status,
      index: this.timeline.index,
    };
  }

  postState(): void {
    Publish.bridgeMessage({
      totalPeriods: this.settings.totalPeriods,
      ...this.state,
    });
  }

  registerSubscriptions(): void {
    const input = Subscribe.bridgeInput(this.handleInput.bind(this));
    const tick = Subscribe.timerTick(this.handleTick.bind(this));
    const periodEnd = Subscribe.timerEnd(this.handleTimerEnd.bind(this));

    this.subscriptions = { input, tick, periodEnd };
  }

  start(): void {
    // TODO: Consider having 2 behaviors: "start", "resume"

    // START
    // Set updated targets based on current time
    this.timeline.setTargets();
    // Set updated autoStart based on settings
    this.timeline.setEnabled({
      startAt: this.timeline.index,
      cycleAutoStart: this.settings.cycleAutoStart,
      breakAutoStart: this.settings.breakAutoStart,
    });
    // Update state, and publish
    this.current.status = Status.Running;
    this.postState();
    // Start alarm / interval process
    Publish.runTimer({ time: this.current.remaining });

    // RESUME
    // ...
  }

  pause(): void {
    // Stop alarm / interval process
    Publish.stopTimer();
    // Update state, and publish
    this.current.status = Status.Paused;
    this.postState();
  }

  skip(): void {
    console.log("Skip");
  }

  resetCycle(): void {
    console.log("Reset Cycle");
  }

  resetAll(): void {
    console.log("Reset all");
  }

  handleInput(input: Input): void {
    // Handle incoming messages
    switch (input) {
      case Input.Start:
        this.start();
        break;
      case Input.Pause:
        this.pause();
        break;
      case Input.Skip:
        this.skip();
        break;
      case Input.ResetCycle:
        this.resetCycle();
        break;
      case Input.ResetAll:
        this.resetAll();
        break;
      case Input.Preload:
        // Initial state post
        // Run UI timer if needed ... should only run if state is 'running'
        this.postState();
        break;
    }
  }

  handleTick(newTime: number): void {
    this.current.remaining = newTime;
    this.postState();
  }

  handleTimerEnd(): void {
    this.current.status = Status.Complete;
    this.timeline.index += 1;
  }
}

function minutesToMillis(minutes: number): number {
  // Could also implement as 'minutes * 60000', but using Duration for consistency
  return Duration.fromObject({ minutes: minutes }).as("milliseconds");
}

function millisToFormattedString(milliseconds: number): string {
  return Duration.fromMillis(milliseconds).toFormat("mm:ss");
}

export { Manager };
