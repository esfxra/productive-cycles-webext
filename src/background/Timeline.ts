import { DateTime, Duration } from "luxon";

class Period {
  id: number;
  status: string;
  target: DateTime;
  remaining: Duration;
  enabled: boolean;

  constructor(id: number, duration: Duration) {
    this.id = id;
    this.remaining = duration;

    this.status = "initial";
    this.target = undefined;
    this.enabled = false;
  }
}

class Timeline {
  static build(
    periods: number,
    cycleTime: Duration,
    breakTime: Duration
  ): Period[] {
    const timeline: Period[] = [];
    for (let i = 0; i < periods; i += 1) {
      const duration = i % 2 === 0 ? cycleTime : breakTime;
      timeline[i] = new Period(i, duration);
    }
    return timeline;
  }
}

export { Period, Timeline };
