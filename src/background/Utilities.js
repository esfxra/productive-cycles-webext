'use strict';

import { Cycle, Break } from './Period.js';

class Utilities {
  static getStoredSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        [
          'autoStartCycles',
          'autoStartBreaks',
          'cycleMinutes',
          'breakMinutes',
          'totalCycles',
        ],
        (storage) => {
          const settings = {
            autoStart: {
              cycles: storage.autoStartCycles,
              breaks: storage.autoStartBreaks,
            },
            cycleTime: storage.cycleMinutes * 60000,
            breakTime: storage.breakMinutes * 60000,
            totalPeriods: storage.totalCycles * 2 - 1,
          };
          resolve(settings);
        }
      );
    });
  }

  static determinePeriod(current, timeline, reference) {
    let period = current;
    for (let i = period; i < timeline.length - 1; i += 1) {
      const target = timeline[i].target;
      const nextIsEnabled = timeline[i + 1].enabled;

      if (reference > target && nextIsEnabled) {
        period = i + 1;
      } else break;
    }
    return period;
  }

  static msToMin(ms) {
    let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (ms >= 60 * 60000) {
      minutes += 60;
    }
    return minutes;
  }

  static msToSec(ms) {
    return Math.floor((ms % (1000 * 60)) / 1000);
  }

  static parseMs(ms) {
    let minutes = this.msToMin(ms).toString();
    let seconds = this.msToSec(ms).toString();

    if (minutes.length === 1) {
      minutes = `0${minutes}`;
    }
    if (seconds.length === 1) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }
}

export { Utilities };
