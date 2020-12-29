'use strict';

import { Cycle, Break } from './Period.js';

class Timeline {
  constructor() {
    this.index = 0;
    this.timeline = [];
  }

  get current() {
    return this.timeline[this.index];
  }

  get isLast() {
    return this.index === this.timeline.length - 1;
  }

  build(settings) {
    const { totalPeriods, cycleTime, breakTime } = { ...settings };

    let timeline = [totalPeriods];
    for (let i = 0; i < totalPeriods; i += 1) {
      if (i % 2 === 0) {
        timeline[i] = new Cycle(i, cycleTime);
      } else {
        timeline[i] = new Break(i, breakTime);
      }
    }

    this.timeline = [...timeline];
  }

  updateTime(current, cycleTime, breakTime) {
    if (current.status === 'initial') {
      current.duration = current.isCycle ? cycleTime : breakTime;
      current.remaining = current.duration;
    }
  }

  updateTargets(current, previous, reference) {
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

  update(reference, settings) {
    const { cycleTime, breakTime, autoStart } = { ...settings };
    const updated = [...this.timeline];

    for (let i = this.index; i < updated.length; i += 1) {
      const current = updated[i];
      const previous = updated[i - 1];
      this.updateTime(current, cycleTime, breakTime);
      this.updateTargets(current, previous, reference);
      this.updateEnabled(current, previous, autoStart);
    }

    this.timeline = [...updated];
  }
}

export { Timeline };
