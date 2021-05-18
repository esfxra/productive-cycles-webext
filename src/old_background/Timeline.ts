"use strict";

import { DateTime, Duration } from "luxon";
import { Period } from "./Period";

class Timeline {
  // get current() {
  //   return this.timeline[this.index];
  // }

  // get isFirst() {
  //   return this.index === 0;
  // }

  // get isLast() {
  //   return this.index === this.timeline.length - 1;
  // }

  static build(settings: {
    totalPeriods: number;
    cycleTime: Duration;
    breakTime: Duration;
  }) {
    let timeline: Period[] = [];
    for (let i = 0; i < settings.totalPeriods; i += 1) {
      // Determine whether to use cycle or break duration
      const duration = i % 2 === 0 ? settings.cycleTime : settings.breakTime;
      // Instantiate new period
      timeline[i] = new Period(i, duration);
    }
    return timeline;
  }

  static update(
    timeline: Period[],
    current: number,
    updates: { time: boolean; targets: boolean; autoStart: boolean },
    reference: DateTime,
    settings: { cycleTime: Duration; breakTime: Duration; autoStart: boolean }
  ) {
    const { cycleTime, breakTime, autoStart } = { ...settings };
    const updatedTimeline: Period[] = [...timeline];

    for (let i = current; i < updatedTimeline.length; i += 1) {
      const current = updatedTimeline[i];
      const previous = updatedTimeline[i - 1];
      if (updates.time) updateDuration(current, cycleTime, breakTime);
      if (updates.targets) updateTarget(current, previous, reference);
      if (updates.autoStart) updateEnabled(current, previous, autoStart);
    }

    return updatedTimeline;
  }

  shorten(timeline: Period[], current: number, newLength: number) {
    const shortenedTimeline = timeline.slice(0, newLength);

    // Updated length - 1 should always be a cycle
    if (current > shortenedTimeline.length - 1) {
      current = shortenedTimeline.length - 1;
    }

    return shortenedTimeline;
  }

  lengthen(
    timeline: Period[],
    current: number,
    settings: {
      totalPeriods: number;
      cycleTime: Duration;
      breakTime: Duration;
      autoStart: boolean;
    }
  ) {
    const { totalPeriods, cycleTime, breakTime, autoStart } = { ...settings };
    const updatedTimeline = timeline.slice();

    for (let i = updatedTimeline.length; i < totalPeriods; i += 1) {
      const duration = i % 2 === 0 ? cycleTime : breakTime;
      updatedTimeline[i] = new Period(i, duration);

      updateTarget(updatedTimeline[i], updatedTimeline[i - 1], Date.now());
      updateEnabled(updatedTimeline[i], updatedTimeline[i - 1], autoStart);
    }

    // Additional adjustment to handle adding periods after the last cycle had been completed
    let newCurrent = current;

    if (updatedTimeline[current].status === "complete") {
      if (updatedTimeline[current].isCycle) {
        newCurrent += 1;
        updatedTimeline[newCurrent].end();
        newCurrent += 1;
      } else {
        newCurrent += 1;
      }
    }

    return [newCurrent, updatedTimeline];
  }
}

function updateDuration(
  current: Period,
  cycleTime: Duration,
  breakTime: Duration
) {
  if (current.status === "initial") {
    current.remaining = current.isCycle ? cycleTime : breakTime;
  }
}

// function updateTarget(current: Period, previous: Period, reference: DateTime) {
//   if (current.id === this.index) {
//     // current.target = current.remaining.plus({millise}) + reference;
//     current.target =
//   } else {
//     const offset: Duration = previous.target.plus({ milliseconds: 1000 });
//     current.target = current.duration + offset;
//   }
// }

// function updateEnabled(current: Period, previous: Period, autoStart: boolean) {
//   if (current.id === this.index) {
//     current.enabled = true;
//   } else {
//     if (previous.enabled) {
//       current.autoStart = autoStart;
//     } else {
//       current.enabled = false;
//     }
//   }
// }

export { Timeline };
