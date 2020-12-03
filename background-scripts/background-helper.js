/*
|--------------------------------------------------------------------------
| Notifications API
|--------------------------------------------------------------------------
*/

// IMPORTANT: The notifications API will receive the period that just ended -always-
// And send a notification based on that
// Also: The notifications API should support sending reminder in case of idle time

const Notifications = {
  idTemplate: 'notification-for-period-',
  soundEnabled: false,
  soundAudio: new Audio('../audio/metal-mallet.mp3'),
};

Notifications.init = () => {
  // Get stored configuration: 'notificationSound' so far
  debug('Initialize notifications');
  debug('---------------');

  chrome.storage.local.get(
    ['notificationSound'],
    (storage) => (this.soundEnabled = storage.notificationSound)
  );
};

Notifications.send = (id, title, message) => {
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
};

Notifications.build = (status) => {
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
};

Notifications.clear = (id) => {
  chrome.notifications.clear(id);
};

Notifications.clearAll = () => {
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
};

/*
|--------------------------------------------------------------------------
| Diagnostics API
|--------------------------------------------------------------------------
*/
const Diagnostics = {};

Diagnostics.compareTargets = (status) => {
  // Debug purposes: Compare target times
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
};

/*
|--------------------------------------------------------------------------
| TimeParser API - Might use Luxon here
|--------------------------------------------------------------------------
*/
