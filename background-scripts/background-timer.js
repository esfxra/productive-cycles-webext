'use strict';

// Dev mode and debug messages
// Debug function is defined in background-manager.js

const Notifications = new NotificationInterface();

class Timer {
  constructor(cycleMinutes, breakMinutes, totalCycles, autoStart) {
    this.time = 0;
    this.state = 'initial';
    this.period = 0;

    this.timeline = [];
    this.subtractor = 0;

    this.comms = {
      port: null,
      portOpen: false,
    };

    this.dev = {
      cycleOffset: 50000,
      breakOffset: 50000,
    };

    this.settings = {
      cycleTime: cycleMinutes * 60000 - this.dev.cycleOffset,
      breakTime: breakMinutes * 60000 - this.dev.breakOffset,
      totalCycles: totalCycles,
      totalBreaks: totalCycles - 1,
      autoStart: autoStart,
    };
  }

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
        this.time = this.settings.cycleTime;

        debug('Timer Initialized');
        debug(`Cycle time: ${this.settings.cycleTime}`);
        debug(`Break time: ${this.settings.breakTime}`);
        debug(`Total cycles: ${this.settings.totalCycles}`);
        debug(`Auto-start: ${this.settings.autoStart}`);
      }
    );
  }

  updatePort(port, portOpen) {
    debug(`portOpen: ${portOpen}`);
    this.comms.port = port;
    this.comms.portOpen = portOpen;
  }

  input(command) {
    switch (command) {
      case 'start':
        this.startCycle();
        break;
      case 'pause':
        this.pauseCycle();
        break;
      case 'skip':
        this.skipBreak();
        break;
      case 'reset-cycle':
        this.resetCycle();
        break;
      case 'reset-all':
        this.resetAll();
        break;
      case 'preload':
        this.postStatus();
        // if (this.state === 'running') {
        //   // this.remaining = this.targetCycles[this.cycle - 1] - Date.now();
        //   // this.countdown();
        // } else if (this.state === 'break') {
        //   // this.remaining = this.targetBreaks[this.break - 1] - Date.now();
        //   // this.countdown();
        // } else {
        //   this.postStatus();
        // }
        break;
    }
  }

  buildTimeline() {
    debug('Build timeline');
    const periods = this.settings.totalCycles + this.settings.totalBreaks;
    let newTimeline = [...this.timeline];

    for (let i = this.period; i < periods; i += 1) {
      if (i === this.period) {
        newTimeline[i] = Date.now() + this.time;
      } else if (i % 2 === 0) {
        newTimeline[i] = newTimeline[i - 1] + this.settings.cycleTime;
      } else if (i % 2 !== 0) {
        newTimeline[i] = newTimeline[i - 1] + this.settings.breakTime;
      }
    }

    this.timeline = [...newTimeline];
  }

  runSubtractor() {
    // debug(`Running subtractor: ${this.time}`);

    if (this.state === 'running' || this.state === 'break') {
      this.time -= 1000;
      this.postStatus();

      if (this.time < 1000) {
        this.stopSubtractor();
        this.next();
      } else {
        this.subtractor = setTimeout(() => {
          this.runSubtractor();
        }, 1000);
      }
    }
  }

  stopSubtractor() {
    clearTimeout(this.subtractor);
  }

  next() {
    const periods = this.settings.totalCycles + this.settings.totalBreaks;
    debug(
      `Next - State: ${this.state}, Period: ${this.period}, Periods: ${periods}`
    );

    // Timer is on 'break'
    if (this.state === 'break') {
      this.endBreak();
      return;
    }

    // Timer is 'running'
    if (this.state === 'running') {
      if (this.period === periods - 1) {
        this.endTimer();
        return;
      } else if (this.period < periods - 1) {
        this.endCycle();
        return;
      }
    }
  }

  startCycle() {
    debug('Start Cycle');

    this.state = 'running';
    this.buildTimeline();
    this.runSubtractor();
  }

  endCycle() {
    debug('End Cycle');

    // Diagnostics.compareTargets();
    Notifications.notify(this.status(), this.settings);
    this.period += 1;
    this.time = this.settings.breakTime;
    this.startBreak();
  }

  endTimer() {
    debug('End Timer');

    // Diagnostics.compareTargets();
    this.state = 'complete';
    this.postStatus();
    Notifications.notify(this.status(), this.settings);
  }

  startBreak() {
    debug('Start Break');

    this.state = 'break';
    this.buildTimeline();
    this.runSubtractor();
  }

  endBreak() {
    debug('End Break');
    // Diagnostics.compareTargets();
    Notifications.notify(this.status(), this.settings);
    this.period += 1;
    this.time = this.settings.cycleTime;

    if (this.settings.autoStart) {
      this.startCycle();
    } else {
      this.state = 'initial';
      this.postStatus();
    }
  }

  pauseCycle() {
    // Understand whether Timer View can be tweaked to fully depend on background messaging
    // If so ... this function should post the new 'paused' state

    this.stopSubtractor();
    this.state = 'paused';
    // this.postStatus();
  }

  skipBreak() {
    this.stopSubtractor();
    this.endBreak();
  }

  resetCycle() {
    debug('Reset Cycle');

    this.stopSubtractor();

    if (this.state === 'initial' && this.period > 0) {
      this.period -= 2;
      Notifications.clear(this.period + 1);
      Notifications.clear(this.period);
    }

    this.state = 'initial';
    this.time = this.settings.cycleTime;
    this.postStatus();
  }

  resetAll() {
    debug('Reset All');

    this.stopSubtractor();

    this.timeline = [];
    this.period = 0;
    this.time = this.settings.cycleTime;
    this.state = 'initial';

    this.postStatus();
    Notifications.clearAll(
      this.settings.totalCycles + this.settings.totalBreaks
    );
  }

  status() {
    return {
      time: Utilities.parseMs(this.time),
      state: this.state,
      cycle: Utilities.mapCycle(this.period),
      period: this.period,
      totalCycles: this.settings.totalCycles,
    };
  }

  postStatus() {
    if (this.comms.portOpen) {
      console.log(this.status());
      this.comms.port.postMessage(this.status());
    }
  }

  sync() {
    debug('Sync');

    if (!(this.state === 'running' || this.state === 'break')) {
      debug(`Timer is ${this.state}. No corrections made.`);
      return;
    }

    if (this.settings.autoStart) {
      // Stop the subtractor
      this.stopSubtractor();

      // Get reference
      const reference = Date.now();
      const periods = this.settings.totalCycles + this.settings.totalBreaks;

      // Determine the correct period
      let correctedPeriod = this.period;
      for (let i = this.period; i < periods; i += 1) {
        const target = this.timeline[i];
        if (reference > target) {
          correctedPeriod = i + 1;
        } else {
          break;
        }
      }

      // Handle 'complete' case
      if (correctedPeriod === periods) {
        this.state = 'complete';
        this.period = correctedPeriod;
        this.time = 0;
        this.postStatus();
        return;
      }

      // Handle other cases
      let correctedState = correctedPeriod % 2 === 0 ? 'running' : 'break';
      // Determine the correct time
      let correctedTime = this.timeline[correctedPeriod] - reference;
      // Set the timer to the corrected values
      this.state = correctedState;
      this.period = correctedPeriod;
      this.time = correctedTime;
      this.postStatus();
      // this.buildTimeline();
      this.runSubtractor();
      return;
    } else {
      const correctedTime = this.timeline[this.period] - Date.now();
      if (correctedTime < 0) {
        this.stopSubtractor();
        this.next();
      } else {
        this.time = correctedTime;
      }
    }
  }
}
