'use strict';

/*
    Declarations and init() call

    - Properties of Settings and Timer are declared as null
    - True assignments follow in init() call ... Which accesses chrome.storage

    Future: Include part or all of the consts in 'Defaults' into Settings
*/

// Globals
let port = null;
let popUpOpen = false;
let uiInterval = null;
let cycleTimeout = null;
let breakTimeout = null;

// Defaults
const defaultTime = 25 * 60000;
const defaultBreak = 5 * 60000;
const defaultCycles = 4;
const defaultAutoStart = true;
const cycleNotification = 'cycle-complete-notification';
const breakNotification = 'break-complete-notification';

// Developer
const devOffset = 50000;

// Settings object
let Settings = {
  time: null,
  breakTime: null,
  totalCycles: null,
  totalBreaks: null - 1,
  autoStart: null,
};

// // Timer object
// let Timer = {
//   targetCycles: [],
//   targetBreaks: [],
//   remaining: null,
//   cycle: null,
//   break: null,
//   status: null,
//   // reset: function (time) {
//   //   this.targetCycles = [];
//   //   this.targetBreaks = [];
//   //   this.remaining = time;
//   //   this.cycle = 1;
//   //   this.break = 1;
//   //   this.status = 'initial';
//   //   console.log('Timer reset - Cycle: 1, Break: 1');
//   // },
// };

// Timer.reset = function (time) {
//   this.targetCycles = [];
//   this.targetBreaks = [];
//   this.remaining = time;
//   this.cycle = 1;
//   this.break = 1;
//   this.status = 'initial';
//   console.log('Timer reset - Cycle: 1, Break: 1');
// };

// Initialize the program; see below for init() description
init();

/*  
    Register all listeners

    - runtime.onInstalled
    - runtime.onConnect
    - idle.onStateChanged
    - storage.onChanged

*/

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener(install);

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener(connect);

// Listen for the system changing states, and update time
chrome.idle.onStateChanged.addListener(syncTimer);

// Listen for changes in the options, report and reload
chrome.storage.onChanged.addListener(newSettings);

/* 
    Function definitions

    These are organized based on a predetermined canonical user
    Rough definition of the actions taken by such caninocal user: User installs the extension, opens the popup, and starts a cycle

    - init
    - install
    - connect
    - disconnect
    - handleMessage
    - start
    - endCycle
    - startBreak
    - endBreak
    - uiTime
    - translateTime
    - syncTimer
    - messageUI
    - notify
    - clearNotifications
    - newSettings

*/

// Initialize the Settings object from chrome.storage and call Timer.reset
function init() {
  chrome.storage.local.get(
    ['minutes', 'totalCycles', 'break', 'autoStart'],
    (storage) => {
      if (storage.minutes === undefined) {
        Settings.time = defaultTime;
      } else {
        Settings.time = storage.minutes * 60000;
      }
      if (storage.break === undefined) {
        Settings.breakTime = defaultBreak;
      } else {
        Settings.breakTime = storage.break * 60000;
      }
      if (storage.totalCycles === undefined) {
        Settings.totalCycles = defaultCycles;
        Settings.totalBreaks = defaultCycles - 1;
      } else {
        Settings.totalCycles = storage.totalCycles;
        Settings.totalBreaks = storage.totalCycles - 1;
      }
      if (storage.autoStart === undefined) {
        Settings.autoStart = defaultAutoStart;
      } else {
        Settings.autoStart = storage.autoStart;
      }
      Settings.time = Settings.time - devOffset; // developer
      Settings.breakTime = Settings.breakTime - devOffset; // developer
      console.log(
        `Init`,
        `\n\ntimer: ${Settings.time}`,
        `\nbreak: ${Settings.breakTime}`,
        `\ntotal cycles: ${Settings.totalCycles}`,
        `\nauto-start: ${Settings.autoStart}`
      );
      Timer.reset(Settings.time);
    }
  );
}

// Handle install and reload/update events for onInstalled
function install(details) {
  if (details.reason === 'install') {
    console.log('Extension installed');
  } else if (details.reason === 'update') {
    // Future release: Open new tab with changes for this version
    console.log('Extension updated or reloaded');
    clearNotifications(true);
  }
}

// Handle port connection to PopUp view for onConnect
function connect(portFromPopUp) {
  port = portFromPopUp;
  popUpOpen = true;
  port.onDisconnect.addListener(disconnect);
  port.onMessage.addListener(handleMessage);
  console.log(`Connected - popUpOpen: ${popUpOpen}`);
}

// Handle port disconnection from PopUp view for onDisconnect
function disconnect() {
  popUpOpen = false;
  clearInterval(uiInterval);
  console.log(`Disconnected - popUpOpen: ${popUpOpen} - uiInterval cleared`);
}

// Handle messages sent through the port from PopUp view for onMessage
function handleMessage(message) {
  console.log(`Input received: ${message.command}`);
  switch (message.command) {
    case 'start':
      Timer.start();
      break;
    case 'pause':
      clearInterval(uiInterval);
      clearTimeout(cycleTimeout);
      Timer.status = 'paused';
      break;
    case 'reset-cycle':
      clearInterval(uiInterval);
      clearTimeout(cycleTimeout);
      // clearTimeout(breakTimeout);
      // Go back to the previous cycle and clear relevant notification
      if (Timer.status === 'initial' && Timer.cycle > 1) {
        Timer.cycle--;
        Timer.break--;
        console.debug(
          `Cycle reset - Cycle: '${Timer.cycle}' Break: '${Timer.break}'`
        );
        clearNotifications(false); // false = clear notifications for current cycle only
      } else if (Timer.status === 'complete') {
        Timer.cycle = Settings.totalCycles;
        Timer.break = Timer.cycle;
        console.debug(
          `Cycle reset - Cycle: '${Timer.cycle}' Break: '${Timer.break}'`
        );
        clearNotifications(false); // false = clear notifications for current cycle only
      }
      Timer.status = 'initial';
      Timer.remaining = Settings.time;
      messageUI();
      break;
    case 'reset-all':
      clearInterval(uiInterval);
      clearTimeout(cycleTimeout);
      // clearTimeout(breakTimeout);
      Timer.reset(Settings.time);
      clearNotifications(true);
      messageUI();
      break;
    case 'preload':
      if (Timer.status === 'running') {
        Timer.remaining = Timer.targetCycles[Timer.cycle - 1] - Date.now();
        console.debug(
          `Preload - targetCycles[${Timer.cycle - 1}: '${
            Timer.targetCycles[Timer.cycle - 1]
          }'`
        );
        console.debug(`Timer.remaining: '${Timer.remaining}'`);
        uiTime();
      } else if (Timer.status === 'break') {
        Timer.remaining = Timer.targetBreaks[Timer.break - 1] - Date.now();
        console.debug(
          `Preload - targetBreaks[${Timer.break - 1}]: '${
            Timer.targetBreaks[Timer.break - 1]
          }'`
        );
        console.debug(`Timer.remaining: '${Timer.remaining}'`);
        uiTime();
      } else {
        messageUI();
      }
      break;
    case 'skip':
      clearInterval(uiInterval);
      clearTimeout(breakTimeout);
      console.debug(
        `Break skipped - Cycle: '${Timer.cycle}' Break: '${Timer.break}'`
      );

      // Timeline correction for syncTimer()
      console.debug(`Target was - ${Timer.targetBreaks[Timer.break - 1]}`);
      Timer.targetBreaks[Timer.break - 1] = Date.now();
      console.debug(`Target now is - ${Timer.targetBreaks[Timer.break - 1]}`);

      Timer.endBreak();
      break;
    default:
      console.log(message, 'is not a known input');
  }
}

// Starts uiInterval, and decreases Timer.remaining by 1000ms every second
// The function process() is called as an IIFE (Immediately Invoked Function Expression)
function uiTime() {
  clearInterval(uiInterval);
  // uiInterval runs as an IIFE (the code executes right away, and then intervals):
  uiInterval = setInterval(
    (function process() {
      Timer.remaining = Timer.remaining - 1000;
      messageUI();
      if (Timer.remaining < 1000) {
        console.log(
          `uiTime(): Clearing interval - Timer.remaining:',
          ${Timer.remaining}`
        );
        clearInterval(uiInterval);
      }
      return process;
    })(),
    1000
  );
}

// Translate milliseconds to a formatted string "minutes:seconds"
function translateTime(milliseconds) {
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

// Locate expected cycle or break, and make adjustments to the timeline arrays
function syncTimer(state) {
  console.debug(`syncTimer() - New state is ${state}`);

  // Sync time only if the timer has started
  // ... Consider replacing these conditions by simply checking for 'running'
  if (
    Timer.targetCycles.length >= 1 &&
    Timer.status !== 'paused' &&
    Timer.status !== 'initial'
  ) {
    const reference = Date.now();

    // Index counters
    let cyclesCompleted = 0;
    let breaksCompleted = 0;

    // Count the number of cycles completed comparing target to current time
    let target = 0;
    while (target < Settings.totalCycles) {
      if (reference > Timer.targetCycles[target]) {
        cyclesCompleted++;
      }
      target++;
    }

    // Count the number of breaks completed comparing target to current time
    target = 0;
    while (target < Settings.totalBreaks) {
      if (reference > Timer.targetBreaks[target]) {
        breaksCompleted++;
      }
      target++;
    }

    const locator = cyclesCompleted - breaksCompleted;

    clearTimeout(cycleTimeout);
    clearTimeout(breakTimeout);
    // clearInterval(uiInterval); - Not used because the interval is cleared by preload ...

    /* 

      Description for the code below

      If autoStart is enabled: Correct the following ...

      - status
      - cycle
      - break
      - timeline arrays

      If not: Simply end the current break or current cycle

    */

    if (Settings.autoStart) {
      if (cyclesCompleted >= Settings.totalCycles) {
        // Timer has completed all cycles
        console.debug(
          'Timer complete - Setting Timer.status, Timer.cycle, Timer.break '
        );
        Timer.status = 'complete';
        Timer.cycle = Settings.totalCycles;
        Timer.break = Settings.totalBreaks;
      } else if (locator === 1) {
        // Timer is on break
        console.debug(`locator: 1 -> on break ...`);
        console.debug(
          `Identified cycle: ${cyclesCompleted + 1}, Identified break: ${
            breaksCompleted + 1
          }`
        );

        Timer.status = 'break';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;

        const newTarget = Timer.targetBreaks[breaksCompleted] - Date.now();
        breakTimeout = setTimeout(endBreak, newTarget);

        console.debug(
          'On Break - endBreak() will run at:',
          Timer.targetBreaks[breaksCompleted]
        );
      } else if (locator === 0) {
        // Timer is running
        console.debug(`locator: 0 -> running ...`);
        console.debug(
          `Identified cycle: ${cyclesCompleted + 1}, Identified break: ${
            breaksCompleted + 1
          }`
        );

        Timer.status = 'running';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;

        const newTarget = Timer.targetCycles[cyclesCompleted] - Date.now();
        cycleTimeout = setTimeout(endCycle, newTarget);

        console.debug(
          'Running - endCycle() will run at:',
          Timer.targetCycles[cyclesCompleted]
        );
      }
    } else {
      if (Timer.status === 'running') {
        console.debug(
          `Adjusting current cycle - Timer.status: '${Timer.status}'`
        );
        const difference = Timer.targetCycles[Timer.cycle - 1] - reference;
        if (difference < 0) {
          // End cycle right away
          const newTarget = Settings.breakTime + Date.now();
          Timer.targetBreaks[Timer.break - 1] = newTarget; // For autostart = false
          clearInterval(uiInterval);
          endCycle();
        } else {
          // End cycle after the ms defined in 'difference'
          if (popUpOpen) {
            uiTime();
          }
          console.debug(`Ending cycle '${Timer.cycle}'  in: '${difference}'`);
          cycleTimeout = setTimeout(endCycle, difference);
        }
      } else if (Timer.status === 'break') {
        console.debug(
          `Adjusting current break - Timer.status: '${Timer.status}'`
        );
        const difference = Timer.targetBreaks[Timer.break - 1] - reference;
        if (difference < 0) {
          // End break right away
          clearInterval(uiInterval);
          endBreak();
        } else {
          // End break after the ms defined in 'difference'
          if (popUpOpen) {
            uiTime();
          }
          console.debug(`Ending break '${Timer.break}' in: '${difference}'`);
          breakTimeout = setTimeout(endBreak, difference);
        }
      }
    }
  } else {
    console.debug(
      'syncTimer() - No adjustments, timer has not been started or is paused'
    );
  }
}

// Message the PopUp view (when open) through the port connection
function messageUI() {
  if (popUpOpen) {
    port.postMessage({
      time: translateTime(Timer.remaining),
      totalCycles: Settings.totalCycles,
      cycle: Timer.cycle,
      status: Timer.status,
    });
  }
}

// Notify the user (cycle complete or break started)
function notify(type) {
  let id = '';
  let title = '';
  let message = '';
  switch (type) {
    case 'cycle-complete':
      id = `${cycleNotification}-${Timer.cycle}`;
      title = `cycle ${Timer.cycle} complete!`;
      message = `great job. everyone, take ${Settings.breakTime / 60000}`;
      break;
    case 'timer-complete':
      id = `${cycleNotification}-${Timer.cycle}`;
      title = 'all cycles complete!';
      message = 'take a long break :)';
      break;
    case 'autostart':
      id = `${breakNotification}-${Timer.break - 1}`;
      title = `cycle ${Timer.cycle} starting`;
      message = 'time to grind';
      break;
    case 'break-complete':
      id = `${breakNotification}-${Timer.break - 1}`;
      title = `don't forget to start cycle ${Timer.cycle}`;
      message = 'time to grind';
      break;
  }

  console.log(`notify(type: ${type})`);
  // console.debug(`id: '${id}' created`);

  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/progress-512.png'),
    title: title,
    message: message,
  });
}

// Clear all notifications or just a pair of cycle-break notification
function clearNotifications(clearAll) {
  console.log(`clearNotifications(clearAll: ${clearAll})`);
  let id = '';
  if (clearAll) {
    let i = 1;
    while (i <= Settings.totalCycles) {
      id = `${cycleNotification}-${i}`;
      chrome.notifications.clear(id);
      i++;
    }
    console.log(`All cycle-complete notifications cleared`);
    i = 1;
    while (i <= Settings.totalBreaks) {
      id = `${breakNotification}-${i}`;
      chrome.notifications.clear(id);
      i++;
    }
    console.log(`All break-complete notifications cleared`);
  } else {
    // Clear notifications for the current cycle and current break only
    id = `${cycleNotification}-${Timer.cycle}`;
    chrome.notifications.clear(id);
    id = `${breakNotification}-${Timer.break}`;
    chrome.notifications.clear(id);
  }
}

// Identify changes in the user settings through storage.onChanged listener
function newSettings(changes, namespace) {
  console.log(`newSettings():`);
  let settingsChanged = false;
  for (let key in changes) {
    let storageChange = changes[key];
    console.log(
      `Key '${key}' in '${namespace} changed\nOld value: '${storageChange.oldValue}', New value: '${storageChange.newValue}'`
    );
    // console.log(
    //   'Storage key "%s" in namespace "%s" changed. ' +
    //     'Old value was "%s", new value is "%s".',
    //   key,
    //   namespace,
    //   storageChange.oldValue,
    //   storageChange.newValue
    // );

    // Update Settings
    switch (key) {
      case 'minutes':
        Settings.time = storageChange.newValue * 60000;
        settingsChanged = true;
        break;
      case 'break':
        Settings.breakTime = storageChange.newValue * 60000;
        settingsChanged = true;
        break;
      case 'totalCycles':
        Settings.totalCycles = storageChange.newValue;
        Settings.totalBreaks = storageChange.newValue - 1;
        settingsChanged = true;
        break;
      case 'autoStart':
        Settings.autoStart = storageChange.newValue;
        settingsChanged = true;
        break;
    }
  }
  if (settingsChanged) {
    // Clear all intervals and Timeouts
    clearInterval(uiInterval);
    clearTimeout(cycleTimeout);
    clearTimeout(breakTimeout);
    // Clear all notifications
    clearNotifications(true);
    // Set runtime properties to defaults
    Timer.reset(Settings.time);
    // Message PopUp to update timer UI with new changes
    messageUI(Timer.remaining, Settings.totalCycles, Timer.cycle, Timer.status);
  }
}

// Debug purposes: Compare target times
function compareTargets() {
  console.debug(`compareTargets()`);
  let targetTime = null;
  if (Timer.status === 'running') {
    targetTime = Timer.targetCycles[Timer.cycle - 1];
  } else if (Timer.status === 'break') {
    targetTime = Timer.targetBreaks[Timer.break - 1];
  }

  const testTime = new Date(Date.now());
  const difference = testTime - targetTime;

  if (Math.abs(difference) > 1000) {
    console.debug(`Expected time: ${testTime}`);
    console.debug(`Target time: ${targetTime}`);
    console.debug(
      `Potential issue with target time, difference is: ${difference} ms`
    );
  } else {
    console.debug(`Expected time: ${testTime}`);
    console.debug(`Target time: ${targetTime}`);
    console.debug(`Target did great, difference is: ${difference} ms`);
  }
}
