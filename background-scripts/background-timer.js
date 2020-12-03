'use strict';

// Dev mode and debug messages
// Debug function is defined in background-manager.js

class Timer {
  constructor(cycleTime, breakTime, cycles, auto) {
    this.time = 0;
    this.state = 'initial';
    this.period = 0;

    this.timeline = [];
    this.subtractor = 0;

    this.comms = {
      port: null,
      portOpen: false,
    };

    this.settings = {
      cycleTime: cycleTime * 60000,
      breakTime: breakTime * 60000,
      totalCycles: cycles,
      totalBreaks: cycles - 1,
      autoStart: auto,
      cycleDevOffset: 0,
      breakDevOffset: 0,
    };
  }

  init() {
    // initTrackerStorage();

    chrome.storage.local.get(
      ['minutes', 'break', 'totalCycles', 'autoStart', 'notificationSound'],
      (storage) => {
        // Timer settings
        if (storage.minutes !== undefined) {
          this.settings.cycleTime =
            storage.minutes * 60000 - this.settings.cycleDevOffset;
        }
        if (storage.break !== undefined) {
          this.settings.breakTime =
            storage.break * 60000 - this.settings.breakDevOffset;
        }
        if (storage.totalCycles !== undefined) {
          this.settings.totalCycles = storage.totalCycles;
          this.settings.totalBreaks = storage.totalCycles - 1;
        }
        if (storage.autoStart !== undefined) {
          this.settings.autoStart = storage.autoStart;
        }

        // Initial value for remaining
        this.remaining = this.settings.cycleTime;

        debug(
          `Init`,
          `\n\ntimer: ${this.settings.cycleTime}`,
          `\nbreak: ${this.settings.breakTime}`,
          `\ntotal cycles: ${this.settings.totalCycles}`,
          `\nauto-start: ${this.settings.autoStart}`
        );
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
        if (this.state === 'running') {
          // this.remaining = this.targetCycles[this.cycle - 1] - Date.now();
          // this.countdown();
        } else if (this.state === 'break') {
          // this.remaining = this.targetBreaks[this.break - 1] - Date.now();
          // this.countdown();
        } else {
          this.postStatus();
        }
        break;
    }
  }

  buildTimeline() {
    debug('Build timeline');
    const periods = this.settings.totalCycles + this.settings.totalBreaks;
    let newTimeline = [...this.timeline];

    debug('Before timeline operations:');
    debug(newTimeline);

    for (let i = this.period; i < periods; i += 1) {
      if (i === this.period) {
        newTimeline[i] = Date.now() + this.time;
      } else if (i % 2 === 0) {
        newTimeline[i] = newTimeline[i - 1] + this.settings.cycleTime;
      } else if (i % 2 !== 0) {
        newTimeline[i] = newTimeline[i - 1] + this.settings.breakTime;
      }
    }

    debug('After timeline operations:');
    debug(newTimeline);

    debug('---------------');
    this.timeline = [...newTimeline];
  }

  runSubtractor() {
    debug('Run subtractor');
    debug('---------------');

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
    debug('Stop subtractor');
    debug('---------------');

    clearTimeout(this.subtractor);
  }

  next() {
    // Timer is on 'break'
    if (this.state === 'break') {
      this.endBreak();
      return;
    }

    // Timer is 'running'
    if (this.state === 'running') {
      const periods = this.settings.totalCycles + this.settings.totalBreaks;

      if (this.period < periods) {
        this.endCycle();
        return;
      }
      if (this.period === periods) {
        this.endTimer();
        return;
      }
    }
  }

  startCycle() {
    debug('Start Cycle');
    debug('---------------');

    this.state = 'running';
    this.buildTimeline();
    this.runSubtractor();
  }

  endCycle() {
    debug('End Cycle');
    debug('---------------');
    // Diagnostics.compareTargets();
    // Notifications.sendNotification('cycle-complete');
    this.period += 1;
    this.time = this.settings.breakTime;
    this.startBreak();
  }

  endTimer() {
    debug('End Timer');
    debug('---------------');
    // Diagnostics.compareTargets();
    this.state = 'complete';
    this.postStatus();
    // Notifications.sendNotification('timer-complete');
  }

  startBreak() {
    debug('Start Break');
    debug('---------------');

    this.state = 'break';
    this.buildTimeline();
    this.runSubtractor();
  }

  endBreak() {
    // Diagnostics.compareTargets();
    // Notifications.sendNotification('break-complete');
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
    this.stopSubtractor();

    // if (this.state === 'initial' && this.cycle > 1) {
    //   this.cycle -= 1;
    //   this.break -= 1;
    // } else if (this.state === 'complete') {
    //   this.cycle = this.settings.totalCycles;
    //   this.break = this.cycle;
    // }

    // this.clearNotifications(false);

    // // this.state = 'initial';
    // // this.remaining = this.settings.cycleTime;

    // debug(`Cycle reset - Cycle: '${this.cycle}' Break: '${this.break}'.`);

    // this.state = 'initial';
    // this.remaining = this.settings.cycleTime;

    // this.postStatus();
  }

  resetAll() {
    this.stopSubtractor();

    // this.targetCycles = [];
    // this.targetBreaks = [];
    // this.cycle = 1;
    // this.break = 1;

    // this.clearNotifications(true);

    // // this.state = 'initial';
    // // this.remaining = this.settings.cycleTime;

    // debug(`Timer reset - Cycle: '${this.cycle}' Break: '${this.break}'.`);

    // this.state = 'initial';
    // this.remaining = this.settings.cycleTime;

    // this.postStatus();
  }

  // countdown() {
  //   clearTimeout(this.timeouts.count);
  //   if (this.comms.portOpen) {
  //     if (this.state === 'running' || this.state === 'break') {
  //       this.remaining -= 1000;
  //       this.postStatus();

  //       if (!(this.remaining < 1000)) {
  //         this.timeouts.count = setTimeout(() => {
  //           this.countdown();
  //         }, 1000);
  //       }
  //     }
  //   }
  // }

  milliseconds(milliseconds) {
    // Use a time library for better ms-to-minutes-seconds in the future
    let min = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    let sec = Math.floor((milliseconds % (1000 * 60)) / 1000);

    // Temporary fix for -1 at the end of timer
    if (min < 1) {
      min = 0;
    }
    if (sec < 1) {
      sec = 0;
    }

    let minStr = '';
    let secStr = '';

    // Format processed time; add missing 0s
    if (Math.floor(Math.log10(min)) < 1) {
      minStr = '0' + min;
    } else {
      minStr = min;
    }

    if (Math.floor(Math.log10(sec)) < 1) {
      secStr = '0' + sec;
    } else {
      secStr = sec;
    }

    return minStr + ':' + secStr;
  }

  status() {
    return {
      time: this.milliseconds(this.remaining),
      totalCycles: this.settings.totalCycles,
      cycle: 1,
      state: this.state,
    };
  }

  postStatus() {
    if (this.comms.portOpen) {
      this.comms.port.postMessage(this.status());
    }
  }

  // sync() {
  //   if (
  //     this.targetCycles.length >= 1 &&
  //     this.state !== 'paused' &&
  //     this.state !== 'initial'
  //   ) {
  //     debug(`sync(): Met conditions for main IF statement`);
  //     const reference = Date.now();

  //     if (this.settings.autoStart) {
  //       debug(`sync(): autoStart enabled`);
  //       // Index counters
  //       let cyclesCompleted = 0;
  //       let breaksCompleted = 0;

  //       // Count the number of cycles completed comparing target to current time
  //       let target = 0;
  //       while (target < this.settings.totalCycles) {
  //         if (reference > this.targetCycles[target]) {
  //           cyclesCompleted += 1;
  //         }
  //         target += 1;
  //       }

  //       // Count the number of breaks completed comparing target to current time
  //       target = 0;
  //       while (target < this.settings.totalBreaks) {
  //         if (reference > this.targetBreaks[target]) {
  //           breaksCompleted += 1;
  //         }
  //         target += 1;
  //       }

  //       debug(
  //         `sync():\ncyclesCompleted: '${cyclesCompleted}', breaksCompleted: '${breaksCompleted}'`
  //       );

  //       const locator = cyclesCompleted - breaksCompleted;

  //       if (cyclesCompleted >= this.settings.totalCycles) {
  //         // Adjust timer to: all cycles completed
  //         this.state = 'complete';
  //         this.cycle = this.settings.totalCycles;
  //         this.break = this.settings.totalBreaks;
  //         debug(`sync(): adjusted timer, set to '${this.state}'`);
  //       } else if (locator === 1) {
  //         clearTimeout(this.timeouts.break);
  //         // Adjust timer to: break
  //         this.state = 'break';
  //         this.cycle = cyclesCompleted + 1;
  //         this.break = breaksCompleted + 1;
  //         const newTarget = this.targetBreaks[breaksCompleted] - reference;
  //         this.timeouts.break = setTimeout(() => {
  //           this.endBreak();
  //         }, newTarget);
  //         debug(
  //           `sync(): adjusted timer, break will end in '${
  //             newTarget / 60000
  //           }' minutes`
  //         );
  //       } else if (locator === 0) {
  //         clearTimeout(this.timeouts.cycle);
  //         // Adjust timer to: running
  //         this.state = 'running';
  //         this.cycle = cyclesCompleted + 1;
  //         this.break = breaksCompleted + 1;
  //         const newTarget = this.targetCycles[cyclesCompleted] - reference;
  //         this.timeouts.cycle = setTimeout(() => {
  //           this.endCycle();
  //         }, newTarget);
  //         debug(
  //           `sync(): adjusted timer, cycle will end in '${
  //             newTarget / 60000
  //           }' minutes`
  //         );
  //       }
  //     } else {
  //       debug(`sync(): autoStart disabled`);
  //       // Figure out if last cycle or last break has ended (normal)
  //       if (this.state === 'running') {
  //         clearTimeout(this.timeouts.cycle);
  //         const difference = this.targetCycles[this.cycle - 1] - reference;
  //         if (difference < 0) {
  //           this.endCycle();
  //           debug(`sync(): adjusted timer; cycle ended`);
  //         } else {
  //           this.timeouts.cycle = setTimeout(() => {
  //             this.endCycle();
  //           }, difference);
  //           debug(
  //             `sync(): adjusted timer; cycle will end in ${
  //               difference / 60000
  //             } minutes`
  //           );
  //         }
  //       } else if (this.state === 'break') {
  //         clearTimeout(this.timeouts.break);
  //         const difference = this.targetBreaks[this.break - 1] - reference;
  //         if (difference < 0) {
  //           this.endBreak();
  //           debug(`sync(): adjusted timer; break ended`);
  //         } else {
  //           this.timeouts.break = setTimeout(() => {
  //             this.endBreak();
  //           }, difference);
  //           debug(
  //             `sync(): adjusted timer; break will end in ${
  //               difference / 60000
  //             } minutes`
  //           );
  //         }
  //       }

  //       // // Fixes a bug where the displayed value would change from 'complete' to '00:00'
  //       // if (this.state !== 'complete') {
  //       //   this.postStatus();
  //       // }
  //     }
  //     // Reset UI countdown
  //     if (this.comms.portOpen) {
  //       this.input('preload');
  //     }
  //   } else {
  //     debug(
  //       `sync(): Conditions not met; state is '${this.state}'; array length could also be 0`
  //     );
  //   }
  // }
}
