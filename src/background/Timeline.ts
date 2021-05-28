import PubSub from "pubsub-js";
import { Period } from "./Period";
import { minutesToMillis } from "./utils/utils";
import { Topic } from "./background-types";
import { Status, TimelineSettings } from "../shared-types";

class Timeline {
  periods: Period[];
  index: number;

  settings: TimelineSettings;

  constructor(settings: TimelineSettings) {
    // Declare and assign empty array for periods
    this.periods = [];
    // Assign timeline settings
    this.settings = settings;
    // Set starting period to 0
    this.index = 0;
    // Build periods array with default settings
    this.build();
  }

  get current(): Period {
    // Get the current period
    return this.periods[this.index];
  }

  build(): void {
    // Assign aliases
    const startAt = this.index;
    const totalPeriods = this.settings.totalPeriods;
    const cycleMillis = minutesToMillis(this.settings.cycleMinutes);
    const breakMillis = minutesToMillis(this.settings.breakMinutes);

    // Instantiate new periods
    const timeline: Period[] = [];
    for (let i = startAt; i < totalPeriods; i += 1) {
      const props = {
        id: i,
        duration: i % 2 === 0 ? cycleMillis : breakMillis,
        incrementIndex: this.incrementIndex.bind(this),
        publishState: this.publishState.bind(this),
      };

      timeline[i] = new Period(props);
    }

    this.periods = timeline;
  }

  setTargets(): void {
    // TODO: Implement this from the period index sent as a parameter
    // - This considers that completed periods do not need to be updated

    // Calculate targets using period duration and either: current time or previous period target
    this.periods.forEach((period, idx) => {
      const reference = idx === 0 ? Date.now() : this.periods[idx - 1].target;
      period.target = period.remaining + reference;
    });
  }

  setEnabled(): void {
    // Assign aliases
    const startAt = this.index;
    const length = this.periods.length;
    const cycleAutoStart = this.settings.cycleAutoStart;
    const breakAutoStart = this.settings.breakAutoStart;

    // Enable or disable periods per autoStart settings
    for (let i = startAt; i < length; i += 1) {
      const previous = i === 0 ? null : this.periods[i - 1];

      if (i === startAt) {
        // Always enable current period
        // - This assumes setEnabled is only called when running the timer
        this.periods[i].enabled = true;
      } else if (previous.enabled) {
        // Use settings to enable or disable consecutive periods
        // - NOTE: In case one of the consecutive periods is disabled, all the remaining ones also get disabled
        this.periods[i].enabled = i % 2 === 0 ? cycleAutoStart : breakAutoStart;
      }
    }
  }

  registerSubscriptions(): void {
    PubSub.subscribe(Topic.Start, () => {
      // Set targets
      this.setTargets();
      // Set updated autoStart based on settings
      this.setEnabled();
      // Run period start tasks
      this.current.start();
    });

    PubSub.subscribe(Topic.Pause, () => {
      // Run period pause tasks
      this.current.pause();
    });

    PubSub.subscribe(Topic.Skip, () => {
      // Run period skip tasks
      this.current.skip();
    });

    PubSub.subscribe(Topic.ResetCycle, () => {
      const breakMillis = minutesToMillis(this.settings.breakMinutes);
      const cycleMillis = minutesToMillis(this.settings.cycleMinutes);

      if (this.current.status === Status.Initial) {
        if (this.index === 0) {
          // Do nothing
        } else {
          // Reset previous break, and then previous cycle
          this.index -= 1;
          this.current.reset(breakMillis);
          this.index -= 1;
          this.current.reset(cycleMillis);
        }
      } else {
        // Reset current cycle back to Initial state
        this.current.reset(cycleMillis);
      }
    });

    PubSub.subscribe(Topic.ResetAll, () => {
      const breakMillis = minutesToMillis(this.settings.breakMinutes);
      const cycleMillis = minutesToMillis(this.settings.cycleMinutes);

      // Iterate through the periods array
      this.periods.forEach((period) => {
        period.reset(period.id % 2 === 0 ? cycleMillis : breakMillis);
      });
      // Reset the timeline index
      this.index = 0;
    });

    PubSub.subscribe(Topic.Preload, () => {
      this.current.publishState();
    });
  }

  incrementIndex(): void {
    // Increment the index to set the next period as current
    // TODO: Examine whether to add handling for what to do with the last period
    this.index += 1;
  }

  publishState(): void {
    // Prepare state + totalPeriods (UI currently receives totalPeriods from the port messages)
    const data = {
      ...this.current.state,
      totalPeriods: this.settings.totalPeriods,
    };
    // Publish request to post the state through the port
    PubSub.publishSync(Topic.State, data);
  }
}

export { Timeline };
