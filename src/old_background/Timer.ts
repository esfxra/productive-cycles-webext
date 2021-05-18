"use strict";

import { DateTime, Duration } from "luxon";
import { Timeline } from "./Timeline";
import { Notifications } from "./Notifications.js";
import { Utilities } from "./Utilities.js";
import { Period } from "./Period";

interface TimerSettings {
  autoStart: { cycles: boolean; breaks: boolean };
  cycleTime: Duration;
  breakTime: Duration;
  totalPeriods: number;
  badgeTimer: boolean;
}

interface TimerComms {
  port: chrome.runtime.Port;
  open: boolean;
}

class Timer {
  timeline: Period[];
  index: number;
  settings: TimerSettings;
  // comms: TimerComms;

  constructor() {
    // this.settings = settings;
    // this.comms = comms;
  }

  get current() {
    return this.timeline[this.index];
  }

  get next() {
    if (this.timeline[this.index + 1]) {
      return this.timeline[this.index + 1];
    } else {
      return undefined;
    }
  }

  configure(settings: TimerSettings) {
    this.settings = settings;
  }
}

export { Timer };
