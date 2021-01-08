'use strict';

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
