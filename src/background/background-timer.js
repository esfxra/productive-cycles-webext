'use strict';

import {
  NotificationInterface,
  Utilities,
  Diagnostics,
  debug,
} from './background-helper.js';

class Timer {
  constructor(defaultValues) {
    const {
      cycleMinutes,
      breakMinutes,
      totalCycles,
      autoStart,
    } = defaultValues;

    this.state = {
      period: 0,
      time: 0,
      status: 'initial',
    };

    this.timeline = [];
    this.subtractor = 0;

    this.comms = {
      port: null,
      portOpen: false,
    };

    this.notifications = new NotificationInterface();
    this.utilities = Utilities;
    this.diagnostics = Diagnostics;

    this.dev = {
      cycleOffset: 40000,
      breakOffset: 40000,
    };

    this.settings = {
      cycleTime: cycleMinutes * 60000 - this.dev.cycleOffset,
      breakTime: breakMinutes * 60000 - this.dev.breakOffset,
      totalCycles: totalCycles,
      totalBreaks: totalCycles - 1,
      autoStart: autoStart,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Getters, Setters
  |--------------------------------------------------------------------------
  */
  getSettings() {
    return {
      cycleTime: this.settings.cycleTime,
      breakTime: this.settings.breakTime,
      totalPeriods: this.settings.totalCycles + this.settings.totalBreaks,
      autoStart: this.settings.autoStart,
    };
  }

  getState() {
    return {
      period: this.state.period,
      time: this.state.time,
      status: this.state.status,
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /*
  |--------------------------------------------------------------------------
  | Timer Init - Find settings in storage
  |--------------------------------------------------------------------------
  */
  init() {
    // Check stored settings and reconfigure the timer
    chrome.storage.local.get(
      ['minutes', 'break', 'totalCycles', 'autoStart'],
      (storage) => {
        // Timer settings
        if (storage.minutes !== undefined) {
          this.settings.cycleTime =
            storage.minutes * 60000 - this.dev.cycleOffset;
        }
        if (storage.break !== undefined) {
          this.settings.breakTime =
            storage.break * 60000 - this.dev.breakOffset;
        }
        if (storage.totalCycles !== undefined) {
          this.settings.totalCycles = storage.totalCycles;
          this.settings.totalBreaks = storage.totalCycles - 1;
        }
        if (storage.autoStart !== undefined) {
          this.settings.autoStart = storage.autoStart;
        }

        // Initial time value
        this.state.time = this.settings.cycleTime;

        debug('Init - Timer Initialized');
        debug(`Init - Cycle time: ${this.settings.cycleTime}`);
        debug(`Init - Break time: ${this.settings.breakTime}`);
        debug(`Init - Total cycles: ${this.settings.totalCycles}`);
        debug(`Init - Auto-start: ${this.settings.autoStart}`);
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Timeline
  |--------------------------------------------------------------------------
  */
  buildTimeline() {
    const { period, time } = this.getState();
    const { cycleTime, breakTime, totalPeriods } = this.getSettings();

    debug('Timeline - Building timeline');
    let newTimeline = [...this.timeline];

    const reference = Date.now();
    const buffer = 1000; // Considers interval in between

    for (let i = period; i < totalPeriods; i += 1) {
      if (i === period) {
        newTimeline[i] = reference + time;
      } else if (i % 2 === 0) {
        newTimeline[i] = newTimeline[i - 1] + cycleTime + buffer;
      } else if (i % 2 !== 0) {
        newTimeline[i] = newTimeline[i - 1] + breakTime + buffer;
      }
    }

    this.timeline = [...newTimeline];
  }

  /*
  |--------------------------------------------------------------------------
  | Subtractor functions
  |--------------------------------------------------------------------------
  */
  runSubtractor() {
    const subtractAndCheck = () => {
      let { time } = this.getState();
      const newTime = time - 1000;
      this.setState({ time: newTime });

      if (newTime >= 0) {
        console.log(`Posting: ${newTime}`);
        this.postState();
        return;
      } else {
        console.log(`Not Posting: ${newTime}`);
        this.stopSubtractor();
        this.next();
        return;
      }
    };

    this.subtractor = setInterval(() => {
      subtractAndCheck();
    }, 1000);
  }

  stopSubtractor() {
    clearInterval(this.subtractor);
  }

  /*
  |--------------------------------------------------------------------------
  | Next
  |--------------------------------------------------------------------------
  */
  next() {
    const { period, status } = this.getState();
    const { totalPeriods } = this.getSettings();

    debug('Next');

    // Timer is on 'break'
    if (status === 'break') {
      this.endBreak();
      return;
    }

    // Timer is 'running'
    if (status === 'running') {
      if (period === totalPeriods - 1) {
        this.endTimer();
        return;
      } else if (period < totalPeriods - 1) {
        this.endCycle();
        return;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | State flow: Cycle start & end, and Break start & end
  |--------------------------------------------------------------------------
  */
  startCycle() {
    const { status } = this.getState();
    const { autoStart } = this.getSettings();

    debug('Start Cycle');

    if (autoStart === false || status === 'initial' || status === 'paused') {
      this.buildTimeline();
    }

    this.setState({ status: 'running' });
    debug(`Posting: ${this.state.time}`);
    this.postState();

    this.runSubtractor();
  }

  endCycle() {
    const { period } = this.getState();
    const { breakTime } = this.getSettings();

    debug('End Cycle');

    this.diagnostics.compareTargets(period, this.timeline);

    this.notifications.notify(this.getState(), this.getSettings());

    this.setState({ period: period + 1, time: breakTime });

    this.startBreak();
  }

  startBreak() {
    debug('Start Break');

    this.setState({ status: 'break' });
    debug(`Posting: ${this.state.time}`);
    this.postState();

    this.runSubtractor();
  }

  endBreak() {
    debug('End Break');

    const { period } = this.getState();
    const { cycleTime, autoStart } = this.getSettings();

    this.diagnostics.compareTargets(period, this.timeline);
    this.notifications.notify(this.getState(), this.getSettings());

    this.setState({ period: period + 1, time: cycleTime });

    if (autoStart) {
      this.startCycle();
    } else {
      this.setState({ status: 'initial' });
      this.postState();
    }
  }

  endTimer() {
    const { period } = this.getState();

    debug('End Timer');

    this.diagnostics.compareTargets(period, this.timeline);

    this.setState({ status: 'complete' });

    this.postState();

    this.notifications.notify(this.getState(), this.getSettings());
  }

  /*
  |--------------------------------------------------------------------------
  | Timer control
  |--------------------------------------------------------------------------
  */
  pauseCycle() {
    this.stopSubtractor();

    this.setState({ status: 'paused' });

    // Understand whether Timer View can be tweaked to fully depend on background messaging
    // If so ... this function should post the new 'paused' state
    // this.postState();
  }

  skipBreak() {
    debug('Skip break');

    this.stopSubtractor();

    const { period } = this.getState();
    const { cycleTime, autoStart } = this.getSettings();

    this.setState({ period: period + 1, time: cycleTime });

    if (autoStart) {
      this.buildTimeline();
      this.startCycle();
    } else {
      this.setState({ status: 'initial' });
      this.postState();
    }
  }

  resetCycle() {
    const { period, status } = this.getState();
    const { cycleTime } = this.getSettings();

    debug('Reset Cycle');

    this.stopSubtractor();

    if (status === 'initial' && period > 0) {
      this.setState({ period: period - 2 });

      this.notifications.clear(period + 1);
      this.notifications.clear(period);
    }

    this.setState({ status: 'initial', time: cycleTime });

    this.postState();
  }

  resetAll() {
    const { cycleTime, totalPeriods } = this.getSettings();

    debug('Reset All');

    this.stopSubtractor();

    this.timeline = [];

    this.setState({ period: 0, time: cycleTime, status: 'initial' });

    this.postState();

    this.notifications.clearAll(totalPeriods);
  }

  /*
  |--------------------------------------------------------------------------
  | Sync
  |--------------------------------------------------------------------------
  */
  determineAdjustments(reference) {
    const { period } = this.getState();
    const { autoStart, totalPeriods } = this.getSettings();

    let adjustedPeriod;
    let adjustedStatus;
    let adjustedTime;

    if (!autoStart) {
      adjustedPeriod = period;
      adjustedStatus = adjustedPeriod % 2 === 0 ? 'running' : 'break';
      adjustedTime = this.timeline[period] - reference;
    } else {
      // Determine period adjustment
      adjustedPeriod = period;
      for (let i = period; i < totalPeriods; i += 1) {
        const target = this.timeline[i];
        if (reference > target) {
          adjustedPeriod = i + 1;
        } else {
          break;
        }
      }

      // Determine status adjustment
      adjustedStatus = adjustedPeriod % 2 === 0 ? 'running' : 'break';

      // Determine time adjustment
      adjustedTime = this.timeline[adjustedPeriod] - reference;
    }

    return {
      period: adjustedPeriod,
      status: adjustedStatus,
      time: adjustedTime,
    };
  }

  applyAdjustments(adjustments) {
    const { period } = this.getState();
    const { autoStart } = this.getSettings();

    const applyAndRestart = () => {
      this.setState(adjustments);
      debug(`Posting ${this.state.time}`);
      this.postState();
      this.runSubtractor();
    };

    if (!autoStart) {
      if (adjustments.time < 0) {
        this.next();
      } else {
        applyAndRestart();
      }
    } else {
      applyAndRestart();
    }
  }

  sync(reference) {
    this.stopSubtractor();

    // Determine the adjustments needed
    let adjustments = this.determineAdjustments(reference);

    // Make sure the time has been adjusted to the nearest second
    const remaining = adjustments.time;
    const surplus = remaining - Math.floor(remaining / 1000) * 1000;
    adjustments.time = remaining - surplus;

    debug(adjustments);
    debug(`Surplus: ${surplus}`);

    setTimeout(() => {
      this.applyAdjustments(adjustments);
    }, surplus);
  }

  /*
  |--------------------------------------------------------------------------
  | Comms-related
  |--------------------------------------------------------------------------
  */
  formatState() {
    return {
      period: this.state.period,
      time: this.utilities.parseMs(this.state.time),
      status: this.state.status,
      totalPeriods: this.settings.totalCycles + this.settings.totalBreaks,
    };
  }

  updatePort(port, portOpen) {
    debug(`portOpen: ${portOpen}`);
    this.comms.port = port;
    this.comms.portOpen = portOpen;
  }

  postState() {
    if (this.comms.portOpen) {
      this.comms.port.postMessage(this.formatState());
    }
  }
}

export { Timer };
