/*
|--------------------------------------------------------------------------
| Notifications Interface
|--------------------------------------------------------------------------
*/

// Future implementation: The notifications API should support sending reminder in case of idle time

class NotificationInterface {
  constructor() {
    this.idTemplate = 'notification-for-period';

    this.soundAudio = new Audio();
    this.soundAudio.src = '../audio/metal-mallet.mp3';

    chrome.storage.local.get(['notificationSound'], (storage) => {
      if (storage.soundEnabled !== undefined) {
        this.soundEnabled = storage.notificationSound;
      } else {
        this.soundEnabled = true;
      }
    });
  }

  notify(state, settings) {
    const notification = this.build(state, settings);
    this.send(notification);
  }

  build({ period, status }, { breakTime, autoStart }) {
    debug('Building notification');
    debug('---------------');

    console.log(breakTime);
    console.log(autoStart);

    let id = `${this.idTemplate}-${period}`;
    let title;
    let message;

    // Cycle complete
    if (status === 'running') {
      const cycle = Utilities.mapCycle(period);
      const breakMinutes = Utilities.msToMin(breakTime);
      title = `Cycle ${cycle} complete!`;
      message = `Great job. Everyone, take ${breakMinutes}.`;
    }

    // Break complete
    if (status === 'break') {
      const _break = Utilities.mapBreak(period);
      title = `Break ${_break} is over.`;

      if (autoStart) message = `Time to grind! Starting next cycle.`;
      else message = `Don't forget to start the next cycle.`;
    }

    // Timer complete
    if (status === 'complete') {
      title = `You did it! All cycles are complete.`;
      message = `Take a long break 🧖`;
    }

    let notification = {
      id: id,
      title: title,
      message: message,
    };

    console.log(notification);

    return notification;
  }

  send(notification) {
    const { id, title, message } = notification;
    debug(`Sending notification: ${title}`);

    // Play sound
    // Play before notifications.create to prevent interference
    if (this.soundEnabled) {
      this.soundAudio
        .play()
        .then(() => {
          // this.soundAudio.load();
          debug('Played sound.');
        })
        .catch((e) => debug(e));
    }

    // Post notification to web browser
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: title,
      message: message,
    });
  }

  clear(period) {
    debug(`Clearing notification for period: ${period}`);
    const clearID = `${this.idTemplate}-${period}`;
    chrome.notifications.clear(clearID);
  }

  clearAll(periods) {
    debug('Clearing all notifications');
    let i = 0;
    while (i < periods) {
      this.clear(i);
      i++;
    }
  }
}

/*
|--------------------------------------------------------------------------
| Stats - Collection of static methods that count completed cycles
|--------------------------------------------------------------------------
*/
class Stats {
  // function initTrackerStorage() {
  //   chrome.storage.local.get(['recentProgress'], (storage) => {
  //     if (storage.recentProgress === undefined) {
  //       let recentProgress = [];
  //       const today = formatDate(new Date());
  //       recentProgress.push({
  //         date: today,
  //         cycles: 0,
  //       });
  //       chrome.storage.local.set({ recentProgress });
  //     }
  //   });
  // }
  // function countCompletedCycle() {
  //   chrome.storage.local.get(['recentProgress'], (storage) => {
  //     // Stats map
  //     let recentProgress = [...storage.recentProgress];
  //     // Retrieve last item
  //     const last_idx = recentProgress.length - 1;
  //     console.log(`Last index: ${last_idx}`);
  //     const latest = recentProgress[last_idx];
  //     console.log(`Latest date: ${latest.date}`);
  //     const today = formatDate(new Date());
  //     // Compare dates
  //     if (sameDay(today, latest.date)) {
  //       recentProgress[last_idx] = {
  //         date: latest.date,
  //         cycles: latest.cycles + 1,
  //       };
  //     } else {
  //       recentProgress.push({
  //         date: today,
  //         cycles: 1,
  //       });
  //     }
  //     chrome.storage.local.set({ recentProgress });
  //   });
  // }
  // // Utility Functions
  // function formatDate(date) {
  //   return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  // }
  // function sameDay(date1, date2) {
  //   console.log(`same day: ${date1 === date2}`);
  //   return date1 === date2;
  // }
}

/*
|--------------------------------------------------------------------------
| Storage - Collection of static methods that handle stored settings
|--------------------------------------------------------------------------
*/
class Storage {
  static handleChanges(changes, namespace) {
    let settingsChanged = false;
    for (let key in changes) {
      let storageChange = changes[key];
      debug(
        `Key '${key}' in '${namespace} changed\nOld value: '${storageChange.oldValue}', New value: '${storageChange.newValue}'`
      );

      // Update Settings
      switch (key) {
        case 'minutes':
          timer.settings.cycleTime =
            storageChange.newValue * 60000 - timer.dev.cycleOffset;
          settingsChanged = true;
          break;
        case 'break':
          timer.settings.breakTime =
            storageChange.newValue * 60000 - timer.dev.breakOffset;
          settingsChanged = true;
          break;
        case 'totalCycles':
          timer.settings.totalCycles = storageChange.newValue;
          timer.settings.totalBreaks = storageChange.newValue - 1;
          settingsChanged = true;
          break;
        case 'autoStart':
          timer.settings.autoStart = storageChange.newValue;
          settingsChanged = true;
          break;
        // Different behavior for notification settings - Timer is not reset
        case 'notificationSound':
          Notifications.soundEnabled = storageChange.newValue;
          break;
      }
    }
    if (settingsChanged) {
      // Clear the subtractor
      timer.stopSubtractor();

      // Set runtime properties to defaults
      // The resetAll() function will clear notifications too
      timer.resetAll();
    }
  }
}

/*
|--------------------------------------------------------------------------
| Utilities - Collection of static methods that parse time and map periods
|--------------------------------------------------------------------------
*/
class Utilities {
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
    const map = {
      0: 1,
      2: 2,
      4: 3,
      6: 4,
    };
    return map[period];
  }

  static mapBreak(period) {
    const map = {
      1: 1,
      3: 2,
      5: 3,
    };
    return map[period];
  }
}

/*
|--------------------------------------------------------------------------
| Diagnostics - Collection of static methods that run timing diagnostics
|--------------------------------------------------------------------------
*/
class Diagnostics {
  static compareTargets(period, timeline) {
    // Need to upgrade to support calculating 'Skip break'

    if (devMode) {
      debug('Diagnostics - compareTargets');
      debug(`Diagnostics - Running diagnostics on period: ${period}`);
      let targetTime = timeline[period];
      const testTime = Date.now();

      if (testTime > targetTime) {
        debug(`Diagnostics - Timer is delayed by ${testTime - targetTime} ms`);
      } else if (testTime < targetTime) {
        debug(`Diagnostics - Timer is ahead by ${targetTime - testTime} ms`);
      } else {
        debug('Diagnostics - Timer is right one time');
      }
    }
  }

  static checkRange(period, timeline) {
    debug('Diagnostics - checkRange');

    let lowerBound = 0;
    if (timeline[period - 1]) lowerBound = timeline[period - 1];

    let upperBound = 0;
    if (timeline[period]) upperBound = timeline[period];

    const testTime = Date.now();

    if (testTime > lowerBound && testTime < upperBound) {
      debug('Diagnostics - Test time is within range. Cool beans.');
    } else {
      debug('Diagnostics - The timer could be out of sync.');
    }
  }
}

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/
function debug(message) {
  if (devMode) {
    console.debug(message);
  }
}
