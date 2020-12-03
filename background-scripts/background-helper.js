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
    this.idTemplate = 'notification-for-period-';
    this.soundAudio = new Audio('../audio/metal-mallet.mp3');

    this.soundEnabled = false;
    chrome.storage.local.get(
      ['notificationSound'],
      (storage) => (this.soundEnabled = storage.notificationSound)
    );

    // Add listener for changes to notification settings
  }

  notify(status) {
    const notification = this.build(status);
    this.send(notification);
  }

  send(id, title, message) {
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

    debug('---------------');
  }

  build(status) {
    debug('Building notification');
    debug('---------------');

    let id = this.idTemplate;
    let title = `Timer finished ${status.state}`;
    let message = 'Test notification';

    // switch (type) {
    //   case 'cycle-complete':
    //     id = `${this.comms.cycleNotification}-${this.cycle}`;
    //     title = `${chrome.i18n.getMessage('cycleCompleteTitle_Fragment_1')} ${
    //       this.cycle
    //     } ${chrome.i18n.getMessage('cycleCompleteTitle_Fragment_2')}`;
    //     message = chrome.i18n.getMessage('cycleCompleteMessage');
    //     message += ` ${this.settings.breakTime / 60000}`;
    //     break;
    //   case 'timer-complete':
    //     id = `${this.comms.cycleNotification}-${this.cycle}`;
    //     title = chrome.i18n.getMessage('timerCompleteTitle');
    //     message = chrome.i18n.getMessage('timerCompleteMessage');
    //     break;
    //   case 'autostart':
    //     id = `${this.comms.breakNotification}-${this.break - 1}`;
    //     title = chrome.i18n.getMessage('autoStartTitle');
    //     title += ` ${this.cycle}`;
    //     message = chrome.i18n.getMessage('autoStartMessage');
    //     break;
    //   case 'break-complete':
    //     id = `${this.comms.breakNotification}-${this.break - 1}`;
    //     title = chrome.i18n.getMessage('breakCompleteTitle');
    //     title += ` ${this.cycle}`;
    //     message = chrome.i18n.getMessage('breakCompleteMessage');
    //     break;
    // }
  }

  clear(id) {
    chrome.notifications.clear(id);
  }

  clearAll() {
    // let i = 1;
    // while (i <= this.settings.totalCycles) {
    //   id = `${this.comms.cycleNotification}-${i}`;
    //   chrome.notifications.clear(id);
    //   i++;
    // }
    // i = 1;
    // while (i <= this.settings.totalBreaks) {
    //   id = `${this.comms.breakNotification}-${i}`;
    //   chrome.notifications.clear(id);
    //   i++;
    // }
    // debug(`Cleared all notifications.`);
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
  static compareTargets(status, timeline) {} // Debug purposes: Compare target times
  // if (devMode) {
  //   let targetTime = null;
  //   if (this.state === 'running') {
  //     targetTime = this.targetCycles[this.cycle - 1];
  //   } else if (this.state === 'break') {
  //     targetTime = this.targetBreaks[this.break - 1];
  //   }
  //   const testTime = new Date(Date.now());
  //   const difference = testTime - targetTime;
  //   if (Math.abs(difference) > 1000) {
  //     debug(`Expected time: '${testTime}'.`);
  //     debug(`Target time: '${targetTime}'.`);
  //     debug(
  //       `Potential issue with target time, difference is: '${difference}' ms.`
  //     );
  //   } else {
  //     debug(`Expected time: '${testTime}'.`);
  //     debug(`Target time: '${targetTime}'.`);
  //     debug(`Target did great, difference is: '${difference}' ms.`);
  //   }
  // }
}
