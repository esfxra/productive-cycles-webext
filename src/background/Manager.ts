"use strict";

import PubSub from "pubsub-js";
import { Period, Timeline } from "./Timeline";
import { Topics, TimerSettings } from "./types";

class Manager {
  timeline: Period[];
  period: number;
  portSubscription: string;
  inputSubscription: string;

  constructor() {
    // Do nothing
  }

  // init(settings: TimerSettings): void {
  //   // Build the timeline with fetched settings
  //   this.timeline = Timeline.build(
  //     settings.totalPeriods,
  //     Duration.fromObject({ minutes: settings.cycleMinutes }),
  //     Duration.fromObject({ minutes: settings.breakMinutes })
  //   );
  // }

  registerSubscriptions(): void {
    PubSub.subscribe(Topics.PRELOAD, (msg, data) => {
      this.postState();
    });
  }

  postState(): void {
    PubSub.publish(Topics.PUBLISH_MESSAGE, {
      time: "20:00",
      period: "0",
      status: "initial",
      totalPeriods: 7,
    });
  }

  current(): Period {
    return this.timeline[this.period];
  }
}

export { Manager };
