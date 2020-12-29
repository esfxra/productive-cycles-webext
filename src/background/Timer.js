'use strict';

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

    this.current = 0;
    this.timeline = [];
    this.subtractor = 0;
  }

  get period() {
    return this.timeline[this.current];
  }

  get isLast() {
    return this.current === this.settings.totalPeriods - 1;
  }

  init(settings) {
    this.settings = settings;
    this.timeline = Utilities.buildTimeline(this.settings);
  }

  start() {
    this.timeline = Utilities.updateTimeline(
      this.current,
      this.timeline,
      Date.now(),
      this.settings
    );

    this.period.start();
    this.runSubtractor();
    this.postState();
  }

  end() {
    this.stopSubtractor();
    console.log(
      `Diagnostic - Difference is ${Date.now() - this.period.target - 1000}`
    );
    this.period.end();
    if (this.isLast) this.postState();
    else this.next();
  }

  pause() {
    this.stopSubtractor();
    this.period.pause();
    this.postState();
  }

  skip() {
    this.stopSubtractor();
    this.period.skip();
    this.next();
  }

  reset() {
    this.stopSubtractor();
    if (this.period.status === 'initial' && this.current > 0) {
      [1, 2].forEach(() => {
        this.current -= 1;
        this.period.reset();
      });
    } else {
      this.period.reset();
    }
    this.postState();
  }

  resetAll() {
    this.stopSubtractor();
    this.timeline.forEach((period) => period.reset());
    this.current = 0;
    this.postState();
  }

  next() {
    this.current += 1;
    if (this.period.enabled) this.start();
    else this.postState();
  }

  sync(reference) {
    this.stopSubtractor();

    if (this.period.actual < 0) {
      const period = Utilities.determinePeriod(
        this.current,
        this.timeline,
        reference
      );

      this.current = period;

      if (this.period.actual < 0) {
        this.end();
      } else {
        const surplus = this.period.adjust;
        setTimeout(() => this.start(), surplus);
      }
    } else {
      const surplus = this.period.adjust;
      setTimeout(() => {
        this.postState();
        this.runSubtractor();
      }, surplus);
    }
  }

  runSubtractor() {
    this.subtractor = setInterval(() => {
      this.period.remaining -= 1000;
      if (this.period.remaining < 0) {
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
      period: this.period.id,
      time: Utilities.parseMs(this.period.remaining),
      status: this.period.status,
      totalPeriods: this.settings.totalPeriods,
    };
  }
}

export { Timer };
