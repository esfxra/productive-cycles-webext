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
    - Timer.start
    - Timer.endCycle
    - Timer.startBreak
    - Timer.endBreak
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
      console.debug(
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
  } else if (details.reason === 'update') {
    // Future release: Open new tab with changes for this version
    clearNotifications(true);
  }
}

// Handle port connection to PopUp view for onConnect
function connect(portFromPopUp) {
  port = portFromPopUp;
  popUpOpen = true;
  port.onDisconnect.addListener(disconnect);
  port.onMessage.addListener(handleMessage);
}

// Handle port disconnection from PopUp view for onDisconnect
function disconnect() {
  popUpOpen = false;
  clearInterval(uiInterval);
}

// Handle messages sent through the port from PopUp view for onMessage
function handleMessage(message) {
  switch (message.command) {
    case 'start':
      Timer.startCycle();
      break;
    case 'pause':
      Timer.pause();
      break;
    case 'reset-cycle':
      clearInterval(uiInterval);
      clearTimeout(cycleTimeout);
      // clearTimeout(breakTimeout);

      // Go back to the previous cycle and clear relevant notification
      if (Timer.status === 'initial' && Timer.cycle > 1) {
        Timer.cycle--;
        Timer.break--;
        clearNotifications(false); // false = clear notifications for current cycle only

        console.debug(
          `Cycle reset - Cycle: '${Timer.cycle}' Break: '${Timer.break}'.`
        );
      } else if (Timer.status === 'complete') {
        Timer.cycle = Settings.totalCycles;
        Timer.break = Timer.cycle;
        clearNotifications(false); // false = clear notifications for current cycle only

        console.debug(
          `Cycle reset - Cycle: '${Timer.cycle}' Break: '${Timer.break}'.`
        );
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
        uiTime();
      } else if (Timer.status === 'break') {
        Timer.remaining = Timer.targetBreaks[Timer.break - 1] - Date.now();
        uiTime();
      } else {
        messageUI();
      }

      console.debug(`Preload. Timer status is '${Timer.status}'.`);

      break;
    case 'skip':
      Timer.skip();
      break;
    default:
      console.debug(`Unknown input: '${message}'.`);
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
        // Adjust timer to: all cycles completed
        Timer.status = 'complete';
        Timer.cycle = Settings.totalCycles;
        Timer.break = Settings.totalBreaks;
      } else if (locator === 1) {
        // Adjust timer to: break
        Timer.status = 'break';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;
        const newTarget = Timer.targetBreaks[breaksCompleted] - Date.now();
        breakTimeout = setTimeout(endBreak, newTarget);
      } else if (locator === 0) {
        // Adjust timer to: running
        Timer.status = 'running';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;
        const newTarget = Timer.targetCycles[cyclesCompleted] - Date.now();
        cycleTimeout = setTimeout(endCycle, newTarget);
      }
    } else {
      if (Timer.status === 'running') {
        const difference = Timer.targetCycles[Timer.cycle - 1] - reference;
        if (difference < 0) {
          // End the cycle right away
          const newTarget = Settings.breakTime + Date.now();
          Timer.targetBreaks[Timer.break - 1] = newTarget;
          clearInterval(uiInterval);
          Timer.endCycle();
        } else {
          // End the cycle after the milliseconds defined in 'difference'
          if (popUpOpen) {
            uiTime();
          }
          cycleTimeout = setTimeout(endCycle, difference);
        }
      } else if (Timer.status === 'break') {
        const difference = Timer.targetBreaks[Timer.break - 1] - reference;
        if (difference < 0) {
          // End break right away
          clearInterval(uiInterval);
          Timer.endBreak();
        } else {
          // End break after the ms defined in 'difference'
          if (popUpOpen) {
            uiTime();
          }
          breakTimeout = setTimeout(endBreak, difference);
        }
      }
    }
    console.debug('Timeline adjustment made.');
  } else {
    console.debug(
      'No timeline adjustments, timer has not been started or is paused.'
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

  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/progress-512.png'),
    title: title,
    message: message,
  });

  console.debug(`Notification sent.`);
}

// Clear all notifications or just a pair of cycle-break notification
function clearNotifications(clearAll) {
  let id = '';
  if (clearAll) {
    let i = 1;
    while (i <= Settings.totalCycles) {
      id = `${cycleNotification}-${i}`;
      chrome.notifications.clear(id);
      i++;
    }
    i = 1;
    while (i <= Settings.totalBreaks) {
      id = `${breakNotification}-${i}`;
      chrome.notifications.clear(id);
      i++;
    }

    console.debug(`Cleared all notifications.`);
  } else {
    // Clear notifications for the current cycle and current break only
    id = `${cycleNotification}-${Timer.cycle}`;
    chrome.notifications.clear(id);
    id = `${breakNotification}-${Timer.break}`;
    chrome.notifications.clear(id);

    console.debug(
      `Cleared notification for cycle '${Timer.cycle}', break '${Timer.break}'.`
    );
  }
}

// Identify changes in the user settings through storage.onChanged listener
function newSettings(changes, namespace) {
  let settingsChanged = false;
  for (let key in changes) {
    let storageChange = changes[key];
    console.debug(
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
