'use strict';

// Dev mode and debug messages
// Debug function is defined in background-manager.js

class Timer {
  constructor(cycleTime, breakTime, cycles, auto) {
    this.remaining = 0;
    this.state = 'initial';
    this.cycle = 1;
    this.break = 1;

    this.targetCycles = [];
    this.targetBreaks = [];

    this.timeouts = {
      cycle: 0,
      break: 0,
      count: 0,
    };

    this.comms = {
      port: null,
      portOpen: false,
      cycleNotification: 'cycle-complete-notification',
      breakNotification: 'break-complete-notification',
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

    this.notification = {
      sound: true,
      audio: null,
    };
  }

  init() {
    initTrackerStorage();

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

        // Notification settings
        if (storage.notificationSound !== undefined) {
          this.notification.sound = storage.notificationSound;
        }

        // Initial value for remaining
        this.remaining = this.settings.cycleTime;

        // Register sound
        this.notification.audio = new Audio('../audio/metal-mallet.mp3');

        debug(
          `Init`,
          `\n\ntimer: ${this.settings.cycleTime}`,
          `\nbreak: ${this.settings.breakTime}`,
          `\ntotal cycles: ${this.settings.totalCycles}`,
          `\nauto-start: ${this.settings.autoStart}`,
          `\n----------------------`,
          `\nnotification sound: ${this.notification.sound}`
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
        this.reset('cycle');
        break;
      case 'reset-all':
        this.reset('all');
        break;
      case 'preload':
        if (this.state === 'running') {
          this.remaining = this.targetCycles[this.cycle - 1] - Date.now();
          this.countdown();
        } else if (this.state === 'break') {
          this.remaining = this.targetBreaks[this.break - 1] - Date.now();
          this.countdown();
        } else {
          this.postStatus();
        }
        break;
    }
  }

  buildTimeline() {
    const reference = Date.now();

    // Fill targetCycles[] array
    let i = this.cycle - 1;
    let j = 0;
    while (i < this.settings.totalCycles) {
      this.targetCycles[i] = new Date(
        reference + this.remaining * (j + 1) + this.settings.breakTime * j
      );
      i += 1;
      j += 1;
    }

    // Fill targetBreaks[] array
    i = this.break - 1;
    j = 0;
    while (i < this.settings.totalBreaks) {
      this.targetBreaks[i] = new Date(
        reference + this.remaining * (j + 1) + this.settings.breakTime * (j + 1)
      );
      i += 1;
      j += 1;
    }
  }

  startCycle() {
    this.timeouts.cycle = setTimeout(() => {
      this.endCycle();
    }, this.remaining);

    this.state = 'running';

    this.buildTimeline();

    this.countdown();
  }

  endCycle() {
    this.compareTargets();
    if (this.cycle < this.settings.totalCycles) {
      // countCompletedCycle();

      this.notify('cycle-complete');
      this.cycle += 1;
      this.startBreak();
    } else {
      // countCompletedCycle();

      this.state = 'complete';
      this.postStatus();
      this.notify('timer-complete');
    }
  }

  startBreak() {
    debug(`startBreak`);
    this.timeouts.break = setTimeout(() => {
      this.endBreak();
    }, this.settings.breakTime);

    this.state = 'break';
    this.remaining = this.settings.breakTime;

    this.countdown();
  }

  endBreak() {
    this.compareTargets();
    this.break += 1;
    this.next();
  }

  next() {
    debug('next()');
    this.state = 'initial';
    this.remaining = this.settings.cycleTime;
    this.postStatus();

    if (this.settings.autoStart) {
      this.notify('autostart');
      this.startCycle();
    } else {
      this.notify('break-complete');
    }
  }

  pauseCycle() {
    clearTimeout(this.timeouts.cycle);

    this.state = 'paused';
    // this.postStatus();
  }

  skipBreak() {
    clearTimeout(this.timeouts.break);

    this.break += 1;
    this.next();
  }

  reset(type) {
    clearTimeout(this.timeouts.count);
    clearTimeout(this.timeouts.cycle);
    if (type === 'cycle') {
      if (this.state === 'initial' && this.cycle > 1) {
        this.cycle -= 1;
        this.break -= 1;
      } else if (this.state === 'complete') {
        this.cycle = this.settings.totalCycles;
        this.break = this.cycle;
      }

      this.clearNotifications(false);

      // this.state = 'initial';
      // this.remaining = this.settings.cycleTime;

      debug(`Cycle reset - Cycle: '${this.cycle}' Break: '${this.break}'.`);
    } else if (type === 'all') {
      this.targetCycles = [];
      this.targetBreaks = [];
      this.cycle = 1;
      this.break = 1;

      this.clearNotifications(true);

      // this.state = 'initial';
      // this.remaining = this.settings.cycleTime;

      debug(`Timer reset - Cycle: '${this.cycle}' Break: '${this.break}'.`);
    }

    this.state = 'initial';
    this.remaining = this.settings.cycleTime;

    this.postStatus();
  }

  countdown() {
    clearTimeout(this.timeouts.count);
    if (this.comms.portOpen) {
      if (this.state === 'running' || this.state === 'break') {
        this.remaining -= 1000;
        this.postStatus();

        if (!(this.remaining < 1000)) {
          this.timeouts.count = setTimeout(() => {
            this.countdown();
          }, 1000);
        }
      }
    }
  }

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
      cycle: this.cycle,
      state: this.state,
    };
  }

  postStatus() {
    if (this.comms.portOpen) {
      this.comms.port.postMessage(this.status());
    }
  }

  sync() {
    if (
      this.targetCycles.length >= 1 &&
      this.state !== 'paused' &&
      this.state !== 'initial'
    ) {
      debug(`sync(): Met conditions for main IF statement`);
      const reference = Date.now();

      if (this.settings.autoStart) {
        debug(`sync(): autoStart enabled`);
        // Index counters
        let cyclesCompleted = 0;
        let breaksCompleted = 0;

        // Count the number of cycles completed comparing target to current time
        let target = 0;
        while (target < this.settings.totalCycles) {
          if (reference > this.targetCycles[target]) {
            cyclesCompleted += 1;
          }
          target += 1;
        }

        // Count the number of breaks completed comparing target to current time
        target = 0;
        while (target < this.settings.totalBreaks) {
          if (reference > this.targetBreaks[target]) {
            breaksCompleted += 1;
          }
          target += 1;
        }

        debug(
          `sync():\ncyclesCompleted: '${cyclesCompleted}', breaksCompleted: '${breaksCompleted}'`
        );

        const locator = cyclesCompleted - breaksCompleted;

        if (cyclesCompleted >= this.settings.totalCycles) {
          // Adjust timer to: all cycles completed
          this.state = 'complete';
          this.cycle = this.settings.totalCycles;
          this.break = this.settings.totalBreaks;
          debug(`sync(): adjusted timer, set to '${this.state}'`);
        } else if (locator === 1) {
          clearTimeout(this.timeouts.break);
          // Adjust timer to: break
          this.state = 'break';
          this.cycle = cyclesCompleted + 1;
          this.break = breaksCompleted + 1;
          const newTarget = this.targetBreaks[breaksCompleted] - reference;
          this.timeouts.break = setTimeout(() => {
            this.endBreak();
          }, newTarget);
          debug(
            `sync(): adjusted timer, break will end in '${
              newTarget / 60000
            }' minutes`
          );
        } else if (locator === 0) {
          clearTimeout(this.timeouts.cycle);
          // Adjust timer to: running
          this.state = 'running';
          this.cycle = cyclesCompleted + 1;
          this.break = breaksCompleted + 1;
          const newTarget = this.targetCycles[cyclesCompleted] - reference;
          this.timeouts.cycle = setTimeout(() => {
            this.endCycle();
          }, newTarget);
          debug(
            `sync(): adjusted timer, cycle will end in '${
              newTarget / 60000
            }' minutes`
          );
        }
      } else {
        debug(`sync(): autoStart disabled`);
        // Figure out if last cycle or last break has ended (normal)
        if (this.state === 'running') {
          clearTimeout(this.timeouts.cycle);
          const difference = this.targetCycles[this.cycle - 1] - reference;
          if (difference < 0) {
            this.endCycle();
            debug(`sync(): adjusted timer; cycle ended`);
          } else {
            this.timeouts.cycle = setTimeout(() => {
              this.endCycle();
            }, difference);
            debug(
              `sync(): adjusted timer; cycle will end in ${
                difference / 60000
              } minutes`
            );
          }
        } else if (this.state === 'break') {
          clearTimeout(this.timeouts.break);
          const difference = this.targetBreaks[this.break - 1] - reference;
          if (difference < 0) {
            this.endBreak();
            debug(`sync(): adjusted timer; break ended`);
          } else {
            this.timeouts.break = setTimeout(() => {
              this.endBreak();
            }, difference);
            debug(
              `sync(): adjusted timer; break will end in ${
                difference / 60000
              } minutes`
            );
          }
        }

        // // Fixes a bug where the displayed value would change from 'complete' to '00:00'
        // if (this.state !== 'complete') {
        //   this.postStatus();
        // }
      }
      // Reset UI countdown
      if (this.comms.portOpen) {
        this.input('preload');
      }
    } else {
      debug(
        `sync(): Conditions not met; state is '${this.state}'; array length could also be 0`
      );
    }
  }

  // Notify the user (cycle complete or break started)
  notify(type) {
    let id = '';
    let title = '';
    let message = '';
    switch (type) {
      case 'cycle-complete':
        id = `${this.comms.cycleNotification}-${this.cycle}`;
        title = `${chrome.i18n.getMessage('cycleCompleteTitle_Fragment_1')} ${
          this.cycle
        } ${chrome.i18n.getMessage('cycleCompleteTitle_Fragment_2')}`;
        message = chrome.i18n.getMessage('cycleCompleteMessage');
        message += ` ${this.settings.breakTime / 60000}`;
        break;
      case 'timer-complete':
        id = `${this.comms.cycleNotification}-${this.cycle}`;
        title = chrome.i18n.getMessage('timerCompleteTitle');
        message = chrome.i18n.getMessage('timerCompleteMessage');
        break;
      case 'autostart':
        id = `${this.comms.breakNotification}-${this.break - 1}`;
        title = chrome.i18n.getMessage('autoStartTitle');
        title += ` ${this.cycle}`;
        message = chrome.i18n.getMessage('autoStartMessage');
        break;
      case 'break-complete':
        id = `${this.comms.breakNotification}-${this.break - 1}`;
        title = chrome.i18n.getMessage('breakCompleteTitle');
        title += ` ${this.cycle}`;
        message = chrome.i18n.getMessage('breakCompleteMessage');
        break;
    }

    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: title,
      message: message,
    });

    debug(`Notification sent.`);

    if (this.notification.sound) {
      this.notification.audio.play();

      debug(`Audio played.`);
    }
  }

  // Clear all notifications or just a pair of cycle-break notification
  clearNotifications(clearAll) {
    let id = '';
    if (clearAll) {
      let i = 1;
      while (i <= this.settings.totalCycles) {
        id = `${this.comms.cycleNotification}-${i}`;
        chrome.notifications.clear(id);
        i++;
      }
      i = 1;
      while (i <= this.settings.totalBreaks) {
        id = `${this.comms.breakNotification}-${i}`;
        chrome.notifications.clear(id);
        i++;
      }

      debug(`Cleared all notifications.`);
    } else {
      // Clear notifications for the current cycle and current break only
      id = `${this.comms.cycleNotification}-${this.cycle}`;
      chrome.notifications.clear(id);
      id = `${this.comms.breakNotification}-${this.break}`;
      chrome.notifications.clear(id);

      debug(
        `Cleared notification for cycle '${this.cycle}', break '${this.break}'.`
      );
    }
  }

  // Debug purposes: Compare target times
  compareTargets() {
    if (devMode) {
      let targetTime = null;
      if (this.state === 'running') {
        targetTime = this.targetCycles[this.cycle - 1];
      } else if (this.state === 'break') {
        targetTime = this.targetBreaks[this.break - 1];
      }

      const testTime = new Date(Date.now());
      const difference = testTime - targetTime;

      if (Math.abs(difference) > 1000) {
        debug(`Expected time: '${testTime}'.`);
        debug(`Target time: '${targetTime}'.`);
        debug(
          `Potential issue with target time, difference is: '${difference}' ms.`
        );
      } else {
        debug(`Expected time: '${testTime}'.`);
        debug(`Target time: '${targetTime}'.`);
        debug(`Target did great, difference is: '${difference}' ms.`);
      }
    }
  }
}
