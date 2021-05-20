"use strict";

import PubSub from "pubsub-js";
import { Duration } from "luxon";
import { Period, Timeline } from "./Timeline";
import { TimerSettings, Comms } from "./types";

class Manager {
  timeline: Period[];
  period: number;
  portSubscription: string;
  inputSubscription: string;
  comms: Comms;

  constructor() {
    // Do nothing
  }

  updateComms({ open, port }: Comms): void {
    this.comms = {
      open,
      port,
    };
  }

  postState(): void {
    this.comms.port.postMessage({
      time: "20:00",
      period: "0",
      status: "initial",
      totalPeriods: 7,
    });
  }

  registerSubscribers(TOPIC_COMMS: string, TOPIC_INPUT: string): void {
    this.portSubscription = PubSub.subscribe(
      TOPIC_COMMS,
      (msg: string, data: Comms) => {
        this.updateComms(data);
      }
    );

    this.inputSubscription = PubSub.subscribe(
      TOPIC_INPUT,
      (msg: string, data: string) => {
        this.handleInput(data);
      }
    );
  }

  init(settings: TimerSettings): void {
    // Build the timeline with fetched settings
    this.timeline = Timeline.build(
      settings.totalPeriods,
      Duration.fromObject({ minutes: settings.cycleMinutes }),
      Duration.fromObject({ minutes: settings.breakMinutes })
    );
  }

  current(): Period {
    return this.timeline[this.period];
  }

  handleInput(command: string): void {
    // TODO: Consider implementing a collection of pre-defined strings as type OR an enum
    switch (command) {
      case "start":
        // Build timeline
        // Start alarm / interval process
        // Run UI timer until port is disconnected
        console.log("Starts the timer");
        break;
      case "pause":
        // Stop alarm / interval process
        // Stop UI timer if running
        console.log("Pauses the timer");
        break;
      case "skip":
        console.log("Skips the current break");
        break;
      case "reset-cycle":
        console.log("Resets the current cycle");
        break;
      case "reset-all":
        console.log("Resets all the cycles");
        break;
      case "preload":
        // Initial state post
        this.postState();
        // Run UI timer if needed ... should only run if state is 'running'
        break;
    }
  }
}

export { Manager };
