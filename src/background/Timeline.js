'use strict';

import { Cycle, Break } from './Period.js';
import { Utilities } from './Utilities.js';

class Timeline {
  constructor() {
    this.index = 0;
    this.timeline = [];
  }

  get current() {
    return this.timeline[this.index];
  }

  get isFirst() {
    return this.index === 0;
  }

  get isLast() {
    return this.index === this.timeline.length - 1;
  }

  build(settings) {
    const { totalPeriods, cycleTime, breakTime } = { ...settings };

    let timeline = [totalPeriods];
    for (let i = 0; i < totalPeriods; i += 1) {
      if (i % 2 === 0) timeline[i] = new Cycle(i, cycleTime);
      else timeline[i] = new Break(i, breakTime);
    }

    this.timeline = [...timeline];
    // this.log();
  }

  updateTime(current, cycleTime, breakTime) {
    if (current.status === 'initial') {
      current.duration = current.isCycle ? cycleTime : breakTime;
      current.remaining = current.duration;
    }
  }

  updateTarget(current, previous, reference) {
    if (current.id === this.index) {
      current.target = current.remaining + reference;
    } else {
      const offset = previous.target + 1000;
      current.target = current.duration + offset;
    }
  }

  updateEnabled(current, previous, autoStart) {
    if (current.id === this.index) {
      current.enabled = true;
    } else {
      if (previous.enabled) current.autoStart(autoStart);
      else current.enabled = false;
    }
  }

  update(updates, reference, settings) {
    const { cycleTime, breakTime, autoStart } = { ...settings };
    const updated = [...this.timeline];

    for (let i = this.index; i < updated.length; i += 1) {
      const current = updated[i];
      const previous = updated[i - 1];
      if (updates.time) this.updateTime(current, cycleTime, breakTime);
      if (updates.targets) this.updateTarget(current, previous, reference);
      if (updates.autoStart) this.updateEnabled(current, previous, autoStart);
    }

    this.timeline = [...updated];
    // this.log();
  }

  shorten(settings) {
    const { totalPeriods } = { ...settings };
    const updated = this.timeline.slice(0, totalPeriods);

    // Updated length - 1 should always be a cycle
    if (this.index > updated.length - 1) this.index = updated.length - 1;

    this.timeline = [...updated];
    // this.log();
  }

  lengthen(settings) {
    const { totalPeriods, cycleTime, breakTime, autoStart } = { ...settings };
    const updated = this.timeline.slice();

    for (let i = updated.length; i < totalPeriods; i += 1) {
      if (i % 2 === 0) updated[i] = new Cycle(i, cycleTime);
      else updated[i] = new Break(i, breakTime);

      this.updateTarget(updated[i], updated[i - 1], Date.now());
      this.updateEnabled(updated[i], updated[i - 1], autoStart);
    }

    this.timeline = [...updated];

    // Additional adjustment to handle adding periods after the last cycle had been completed
    if (this.current.status === 'complete') {
      if (this.current.isCycle) {
        this.index += 1;
        this.current.end();
        this.index += 1;
      } else {
        this.index += 1;
      }
    }

    // this.log();
  }

  log() {
    let output = [];
    this.timeline.forEach((period) => {
      const logged = {
        id: period.id,
        duration: Utilities.parseMs(period.duration),
        remaining: Utilities.parseMs(period.remaining),
        status: period.status,
        enabled: period.enabled,
        target: new Date(period.target).toTimeString(),
      };

      output.push(logged);
    });
    console.log(output);
  }
}

export { Timeline };
