import { Status } from "../shared-types";

interface TimelineInit {
  totalPeriods: number;
  cycleMillis: number;
  breakMillis: number;
}

interface TimelineBuild extends TimelineInit {
  startAt: number;
}

class Period {
  status: Status;
  target: number;
  remaining: number;
  enabled: boolean;

  constructor(duration: number) {
    this.remaining = duration;

    this.status = Status.Initial;
    this.target = undefined;
    this.enabled = false;
  }
}

class Timeline {
  periods: Period[];
  index: number;

  constructor({ totalPeriods, cycleMillis, breakMillis }: TimelineInit) {
    // Declare and assign empty array for periods
    this.periods = [];
    // Build periods array with default values
    this.build({ startAt: 0, totalPeriods, cycleMillis, breakMillis });
    // Set starting period to 0
    this.index = 0;
  }

  build({
    startAt,
    totalPeriods,
    cycleMillis,
    breakMillis,
  }: TimelineBuild): void {
    const timeline: Period[] = [];
    for (let i = startAt; i < totalPeriods; i += 1) {
      const duration = i % 2 === 0 ? cycleMillis : breakMillis;
      timeline[i] = new Period(duration);
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

  setEnabled({
    startAt,
    cycleAutoStart,
    breakAutoStart,
  }: {
    startAt: number;
    cycleAutoStart: boolean;
    breakAutoStart: boolean;
  }): void {
    // Enable or disable periods per autoStart settings
    for (let i = startAt; i < this.periods.length; i += 1) {
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
}

export { Period, Timeline };
