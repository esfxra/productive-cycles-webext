"use strict";

import { DateTime, Duration } from "luxon";

class Period {
  id: number;
  target: DateTime | null;
  remaining: Duration;
  status: "initial" | "running" | "paused" | "complete";
  enabled: boolean;

  constructor(id: number, duration: Duration) {
    this.id = id;
    this.remaining = duration;

    // Defaults on instantiation
    this.target = null;
    this.status = "initial";
    this.enabled = false;
  }

  get isCycle() {
    return this.id % 2 === 0;
  }

  set autoStart(setting: boolean) {
    this.enabled = setting;
  }

  start() {
    this.status = "running";
  }

  end() {
    this.status = "complete";
    this.remaining = Duration.fromObject({ milliseconds: 0 });
  }

  reset(duration: Duration) {
    this.status = "initial";
    this.remaining = duration;
  }

  pause() {
    if (this.isCycle) {
      this.status = "paused";
    }
  }

  skip() {
    if (!this.isCycle) {
      this.status = "paused";
    }
  }

  // actual(reference) {
  //   return this.target - reference;
  // }

  // adjust(reference) {
  //   const actual = this.actual(reference);
  //   const surplus = actual - Math.floor(actual / 1000) * 1000;
  //   this.remaining = actual - surplus;

  //   return surplus;
  // }
}

export { Period };
