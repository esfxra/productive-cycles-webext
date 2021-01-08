'use strict';

import { Timeline } from './Timeline.js';
import { Utilities } from './Utilities.js';

class Timer {
  constructor() {
    this.settings = {
      autoStart: {
        cycles: true,
        breaks: true,
      },
      cycleTime: 0,
      breakTime: 0,
      totalPeriods: 0,
    };

    this.comms = {
      port: null,
      open: false,
    };

    this.periods = new Timeline();
    this.subtractor = 0;
  }

  init(settings) {
    this.settings = settings;
    this.periods.build(this.settings);
  }

  updateAutoStart(autoStart) {
    this.settings.autoStart = { ...this.settings.autoStart, ...autoStart };
    const updates = { time: false, targets: true, autoStart: true };
    this.periods.update(updates, Date.now(), this.settings);
  }

  updateTime(time) {
    this.settings = { ...this.settings, ...time };
    const updates = { time: true, targets: true, autoStart: false };
    this.periods.update(updates, Date.now(), this.settings);
  }

  updateTotalPeriods(totalPeriods) {
    this.settings.totalPeriods = totalPeriods;

    if (totalPeriods < this.periods.timeline.length) {
      this.periods.shorten(this.settings);
    } else if (totalPeriods > this.periods.timeline.length) {
      this.periods.lengthen(this.settings);
    }
  }

  start() {
    const updates = { time: false, targets: true, autoStart: true };
    this.periods.update(updates, Date.now(), this.settings);

    this.periods.current.start();
    this.runSubtractor();
    this.postState();
  }

  end() {
    this.stopSubtractor();
    this.periods.current.end();
    if (this.periods.isLast) this.postState();
    else this.next();
  }

  pause() {
    this.stopSubtractor();
    this.periods.current.pause();
    this.postState();
  }

  skip() {
    this.stopSubtractor();
    this.periods.current.skip();
    this.next();
  }

  reset() {
    this.stopSubtractor();
    if (this.periods.current.status === 'initial' && this.periods.index > 0) {
      [1, 2].forEach(() => {
        this.periods.index -= 1;
        this.periods.current.reset(this.settings);
      });
    } else {
      this.periods.current.reset(this.settings);
    }
    this.postState();
  }

  resetAll() {
    this.stopSubtractor();
    this.periods.timeline.forEach((period) => period.reset(this.settings));
    this.periods.index = 0;
    this.postState();
  }

  next() {
    this.periods.index += 1;
    if (this.periods.current.enabled) this.start();
    else this.postState();
  }

  runSubtractor() {
    this.subtractor = setInterval(() => {
      this.periods.current.remaining -= 1000;
      if (this.periods.current.remaining < 0) {
        this.end();
      } else {
        this.postState();
      }
    }, 1000);
  }

  stopSubtractor() {
    clearInterval(this.subtractor);
  }

  updateComms(port, open) {
    this.comms.port = port;
    this.comms.open = open;
  }

  postState() {
    if (this.comms.open) {
      this.comms.port.postMessage(this.formatState());
    }
  }

  formatState() {
    return {
      period: this.periods.current.id,
      time: Utilities.parseMs(this.periods.current.remaining),
      status: this.periods.current.status,
      totalPeriods: this.settings.totalPeriods,
    };
  }
}

export { Timer };
