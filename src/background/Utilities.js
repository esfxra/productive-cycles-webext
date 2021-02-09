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
          'badgeTimer',
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
            badgeTimer: storage.badgeTimer,
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

  static mapCycle(period) {
    return period / 2 + 1;
  }

  static mapBreak(period) {
    return period / 2 + 1 / 2;
  }

  static updateBadgeColor(isCycle) {
    const setBadgeColor = (color) => {
      chrome.browserAction.setBadgeBackgroundColor({ color: color }, () => {});
    };

    if (isCycle) setBadgeColor('#3c50fa');
    else setBadgeColor('#747980');
  }

  static updateBadgeTime(isFirst, status, remaining) {
    const setBadgeText = (text) => {
      chrome.browserAction.setBadgeText({ text: text }, () => {});
    };

    switch (status) {
      case 'initial':
        setBadgeText('...');
        // if (!isFirst) setBadgeText('...');
        // else setBadgeText(''); // Empty string clears the badge
        break;
      case 'running':
      case 'paused':
        let text;

        if (remaining < 60000) text = `${Utilities.msToSec(remaining)}s`;
        else text = `${Utilities.msToMin(remaining)}m`;

        setBadgeText(text);
        break;
      case 'complete':
        setBadgeText('DONE'); // Empty string clears the badge
        break;
    }
  }
}

export { Utilities };
