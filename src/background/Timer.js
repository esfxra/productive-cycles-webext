'use strict';

import { Timeline } from './Timeline.js';
import { Notifications } from './Notifications.js';
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
      badgeTimer: true,
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
    Notifications.clearAll(this.settings.totalPeriods);
    Utilities.updateBadgeColor(this.periods.current.isCycle);
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
    this.notify();

    if (this.periods.isLast) this.postState();
    else this.next();
  }

  next() {
    this.periods.index += 1;

    Utilities.updateBadgeColor(this.periods.current.isCycle);

    if (this.periods.current.enabled) this.start();
    else this.postState();
  }

  pause() {
    this.stopSubtractor();
    this.periods.current.pause();
    this.postState();
  }

  skip() {
    this.stopSubtractor();
    this.periods.current.skip();
    this.notify();
    this.next();
  }

  reset() {
    this.stopSubtractor();
    if (this.periods.current.status === 'initial' && this.periods.index > 0) {
      [1, 2].forEach(() => {
        this.periods.index -= 1;
        this.periods.current.reset(this.settings);
        Notifications.clear(this.periods.index);
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
    Notifications.clearAll(this.settings.totalPeriods);
  }

  runSubtractor() {
    this.stopSubtractor();

    this.subtractor = setInterval(() => {
      this.periods.current.remaining -= 1000;

      if (this.periods.current.remaining < 0) this.end();
      else this.postState();
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
    const time = Utilities.parseMs(this.periods.current.remaining);

    if (this.settings.badgeTimer) {
      Utilities.updateBadgeTime(this.periods.current.status, time);
    }

    if (this.comms.open) {
      this.comms.port.postMessage(this.formatState(time));
    }
  }

  formatState(time) {
    return {
      period: this.periods.current.id,
      time: time,
      status: this.periods.current.status,
      totalPeriods: this.settings.totalPeriods,
    };
  }

  notify() {
    let type = '';
    if (this.periods.isLast) type = 'complete';
    else type = this.periods.current.isCycle ? 'cycle' : 'break';

    Notifications.send(this.periods.current.id, this.settings.breakTime, type);
  }
}

export { Timer };
