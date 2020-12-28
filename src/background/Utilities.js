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

  static buildTimeline(settings) {
    const { totalPeriods, cycleTime, breakTime } = { ...settings };

    let timeline = [totalPeriods];
    for (let i = 0; i < totalPeriods; i += 1) {
      if (i % 2 === 0) {
        timeline[i] = new Cycle(i, cycleTime, 0);
      } else {
        timeline[i] = new Break(i, breakTime, 0);
      }
    }
    return [...timeline];
  }

  static updateTimeline(current, timeline, reference, settings) {
    const { totalPeriods, cycleTime, breakTime, autoStart } = { ...settings };
    const buffer = 1000;

    let newTimeline = [...timeline];
    for (let i = current; i < totalPeriods; i += 1) {
      const period = newTimeline[i];

      if (i === current) {
        // Current period
        period.target = reference + period.remaining;
        period.enable();
      } else {
        // Consecutive periods
        const previousPeriod = timeline[i - 1];
        const offset = period.isCycle ? cycleTime + buffer : breakTime + buffer;
        period.target = previousPeriod.target + offset;

        // Enable or disable per autoStart settings
        if (previousPeriod.enabled) {
          period.enabled = period.isCycle ? autoStart.cycles : autoStart.breaks;
        } else {
          period.disable();
        }
      }
    }

    return [...newTimeline];
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
