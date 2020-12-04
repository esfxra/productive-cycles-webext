/*
|--------------------------------------------------------------------------
| Notifications Interface
|--------------------------------------------------------------------------
*/

// IMPORTANT: The notifications API will receive the period that just ended -always-
// And send a notification based on that
// Also: The notifications API should support sending reminder in case of idle time

class NotificationInterface {
  constructor() {
    this.idTemplate = 'notification-for-period';
    this.soundAudio = new Audio('../audio/metal-mallet.mp3');

    this.soundEnabled = false;
    chrome.storage.local.get(
      ['notificationSound'],
      (storage) => (this.soundEnabled = storage.notificationSound)
    );

    // Add listener for changes to notification settings
  }

  notify(status, settings) {
    const notification = this.build(status, settings);
    this.send(notification);
  }

  build(status, settings) {
    debug('Building notification');
    debug('---------------');

    debug(status);

    const { period, state } = status;
    const { breakTime, autoStart } = settings;

    console.log(breakTime);
    console.log(autoStart);

    let id = `${this.idTemplate}-${period}`;
    let title;
    let message;

    // Cycle complete
    if (state === 'running') {
      const cycle = Utilities.mapCycle(period);
      const breakMinutes = Utilities.msToMin(breakTime);
      title = `Cycle ${cycle} complete!`;
      message = `Great job. Everyone, take ${breakMinutes}.`;
    }

    // Break complete
    if (state === 'break') {
      const _break = Utilities.mapBreak(period);
      title = `Break ${_break} is over.`;

      if (autoStart) message = `Time to grind! Starting next cycle.`;
      else message = `Don't forget to start the next cycle.`;
    }

    // Timer complete
    if (state === 'complete') {
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

    // Post notification to web browser
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: title,
      message: message,
    });

    // Play sound
    if (this.soundEnabled) {
      this.soundAudio
        .play()
        .then(() => console.log('Played sound'))
        .catch((e) => console.log(e));
    }
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
class Storage {}

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
    if (devMode) {
      debug('Diagnostics - compareTargets');
      let targetTime = timeline[period];

      const testTime = new Date();
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

  static checkRange(period, timeline) {
    debug('Diagnostics - checkRange');

    let lowerBound = 0;
    if (timeline[period - 1]) lowerBound = timeline[period - 1];

    let upperBound = 0;
    if (timeline[period]) upperBound = timeline[period];

    const testTime = new Date();

    if (testTime > lowerBound && testTime < upperBound) {
      debug('Test time is within range. Cool beans.');
    } else {
      debug('The timer could be out of sync.');
    }

    debug(`Duration from Upper Bound: ${upperBound - testTime}`);
    debug(`Duration from Lower Bound: ${testTime - lowerBound}`);
  }
}
