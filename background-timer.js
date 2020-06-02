'use strict';

// background-timer.js globals
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
// developer
const devOffset = 0;

let Timer = {
  targetCycles: [],
  targetBreaks: [],
  remaining: null,
  cycle: null,
  break: null,
  status: null,
  settings: {
    time: null,
    breakTime: null,
    totalCycles: null,
    totalBreaks: null - 1,
    autoStart: null,
  },
  reset: function () {
    this.targetCycles = [];
    this.targetBreaks = [];
    this.remaining = this.settings.time;
    this.cycle = 1;
    this.break = 1;
    this.status = 'initial';
    console.log('Timer reset - Cycle: 1, Break: 1');
  },
};

init();

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener(install);

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener(connect);

// Listen for the system changing states, and update time
chrome.idle.onStateChanged.addListener(syncTimer);

// Listen for changes in the options, report and reload
chrome.storage.onChanged.addListener(function (changes, namespace) {
  let optionsChanged = false;
  for (let key in changes) {
    let storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );

    // Update Timer.settings
    switch (key) {
      case 'minutes':
        Timer.settings.time = storageChange.newValue * 60000;
        optionsChanged = true;
        break;
      case 'break':
        Timer.settings.breakTime = storageChange.newValue * 60000;
        optionsChanged = true;
        break;
      case 'totalCycles':
        Timer.settings.totalCycles = storageChange.newValue;
        Timer.settings.totalBreaks = storageChange.newValue - 1;
        optionsChanged = true;
        break;
      case 'autoStart':
        Timer.settings.autoStart = storageChange.newValue;
        optionsChanged = true;
        break;
    }
  }
  if (optionsChanged) {
    // Clear all intervals and Timeouts
    clearInterval(uiInterval);
    clearTimeout(cycleTimeout);
    clearTimeout(breakTimeout);
    // Clear all notifciations
    clearNotifications(true);
    // Set runtime properties to defaults
    Timer.reset();
    // Message PopUp to update timer UI with new changes
    messageUI(
      Timer.remaining,
      Timer.settings.totalCycles,
      Timer.cycle,
      Timer.status
    );
  }
});

function init() {
  chrome.storage.local.get(
    ['minutes', 'totalCycles', 'break', 'autoStart'],
    (storage) => {
      if (storage.minutes === undefined) {
        Timer.settings.time = defaultTime;
      } else {
        Timer.settings.time = storage.minutes * 60000;
      }
      if (storage.break === undefined) {
        Timer.settings.breakTime = defaultBreak;
      } else {
        Timer.settings.breakTime = storage.break * 60000;
      }
      if (storage.totalCycles === undefined) {
        Timer.settings.totalCycles = defaultCycles;
        Timer.settings.totalBreaks = defaultCycles - 1;
      } else {
        Timer.settings.totalCycles = storage.totalCycles;
        Timer.settings.totalBreaks = storage.totalCycles - 1;
      }
      if (storage.autoStart === undefined) {
        Timer.settings.autoStart = defaultAutoStart;
      } else {
        Timer.settings.autoStart = storage.autoStart;
      }
      Timer.settings.time = Timer.settings.time - devOffset; // developer
      Timer.settings.breakTime = Timer.settings.breakTime - devOffset; // developer
      console.log(
        `Init`,
        `\n\ntimer: ${Timer.settings.time}`,
        `\nbreak: ${Timer.settings.breakTime}`,
        `\ntotal cycles: ${Timer.settings.totalCycles}`,
        `\nauto-start: ${Timer.settings.autoStart}`
      );
      Timer.reset();
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

// Handle messages send through the port from PopUp view for onMessage
function handleMessage(message) {
  console.log(`Input received: ${message.command}`);
  switch (message.command) {
    case 'start':
      start();
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
        Timer.cycle = Timer.settings.totalCycles;
        Timer.break = Timer.cycle;
        console.debug(
          `Cycle reset - Cycle: '${Timer.cycle}' Break: '${Timer.break}'`
        );
        clearNotifications(false); // false = clear notifications for current cycle only
      }
      Timer.status = 'initial';
      Timer.remaining = Timer.settings.time;
      messageUI();
      break;
    case 'reset-all':
      clearInterval(uiInterval);
      clearTimeout(cycleTimeout);
      // clearTimeout(breakTimeout);
      Timer.reset();
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
      // The following is done to prevent syncTimer to identify this as
      // a break that has not been completed
      // consider it a timeline correction ...
      console.debug(`Target was - ${Timer.targetBreaks[Timer.break - 1]}`);
      Timer.targetBreaks[Timer.break - 1] = Date.now();
      console.debug(`Target now is - ${Timer.targetBreaks[Timer.break - 1]}`);
      endBreak();
      break;
    default:
      console.log(message, 'is not a known input');
  }
}

function start() {
  console.debug(`start()`);
  console.debug(`Timer.remaining: ${Timer.remaining}`);

  Timer.status = 'running';

  const reference = Date.now();

  // targetCycles[] array
  let i = Timer.cycle - 1;
  let j = 0;
  while (i < Timer.settings.totalCycles) {
    Timer.targetCycles[i] = new Date(
      // reference + Timer.settings.time * (j + 1) + Timer.settings.breakTime * j
      reference + Timer.remaining * (j + 1) + Timer.settings.breakTime * j
    );
    i++;
    j++;
  }
  console.log(
    `Timer.targetCycles[${Timer.cycle - 1}]: ${
      Timer.targetCycles[Timer.cycle - 1]
    }`
  );
  // targetBreaks[] array
  i = Timer.break - 1;
  j = 0;
  while (i < Timer.settings.totalBreaks) {
    // Target for the current cycle
    Timer.targetBreaks[i] = new Date(
      // reference +
      //   Timer.settings.time * (j + 1) +
      //   Timer.settings.breakTime * (j + 1)
      reference + Timer.remaining * (j + 1) + Timer.settings.breakTime * (j + 1)
    );
    i++;
    j++;
  }

  console.log(`Cycle ${Timer.cycle} starting. New status: ${Timer.status}`);
  cycleTimeout = setTimeout(endCycle, Timer.remaining);
  if (popUpOpen) {
    uiTime();
  }
}

function endCycle() {
  // Error reporting if current time does not align with target time in array
  console.debug('endCycle');
  const testTime = new Date(Date.now());
  const difference = testTime - Timer.targetCycles[Timer.cycle - 1];
  if (Math.abs(difference) > 1000) {
    console.debug('Current time:', testTime.valueOf());
    console.debug(
      'Target time:',
      Timer.targetCycles[Timer.cycle - 1].valueOf()
    );
    console.debug(
      'endCycle(): There might be an issue with targetCycles, difference is:',
      difference,
      'ms'
    );
  } else {
    console.debug('Current time:', testTime.valueOf());
    console.debug(
      'Target time:',
      Timer.targetCycles[Timer.cycle - 1].valueOf()
    );
    console.debug(
      'endCycle(): targetCycles did great, difference is:',
      difference,
      'ms'
    );
  }
  // endCycle code
  if (Timer.cycle === Timer.settings.totalCycles) {
    Timer.status = 'complete';
    messageUI();
    notify('timer-complete');
    console.log('Timer complete. New status:', Timer.status);
  } else {
    notify('cycle-complete');
    Timer.cycle++;
    startBreak();
  }
}

function startBreak() {
  console.debug(`startBreak()`);
  Timer.status = 'break';
  Timer.remaining = Timer.settings.breakTime;
  console.debug(`Timer.remaining: ${Timer.remaining}`);
  messageUI();
  console.log(`Break ${Timer.break} starting. New status: ${Timer.status}`);
  breakTimeout = setTimeout(endBreak, Timer.remaining);
  if (popUpOpen) {
    uiTime();
  }
}

function endBreak() {
  // Error reporting if current time does not align with target time in array
  console.debug('endBreak()');
  // Debug
  let testTime = new Date(Date.now());
  let difference = testTime - Timer.targetBreaks[Timer.break - 1];
  if (Math.abs(difference) > 1000) {
    console.debug('Current time:', testTime.valueOf());
    console.debug(
      'Target time:',
      Timer.targetBreaks[Timer.break - 1].valueOf()
    );
    console.debug(
      'endBreak(): There might be an issue with targetBreaks, difference is:',
      difference,
      'ms'
    );
  } else {
    console.debug('Current time:', testTime.valueOf());
    console.debug(
      'Target time:',
      Timer.targetBreaks[Timer.break - 1].valueOf()
    );
    console.debug(
      'endBreak(): targetBreaks did great, difference is:',
      difference,
      'ms'
    );
  }
  // endBreak() code
  clearInterval(uiInterval);
  Timer.status = 'initial';
  Timer.remaining = Timer.settings.time;
  Timer.break++;
  console.debug(`Timer.break incremented: ${Timer.break}`);
  messageUI();
  console.log('Break ended. New status:', Timer.status);
  if (Timer.settings.autoStart) {
    notify('autostart');
    console.log(`Autostart: ${Timer.settings.autoStart}, calling start()`);
    start();
  } else {
    notify('break-complete');
    console.log(`Autostart disabled, nothing to see here`);
  }
}

function uiTime() {
  clearInterval(uiInterval);
  // uiInterval runs as an IIFE (the code executes right away, and then intervals):
  uiInterval = setInterval(
    (function process() {
      Timer.remaining = Timer.remaining - 1000;
      // console.log(Timer.remaining);
      messageUI();
      if (Timer.remaining < 1000) {
        console.log(
          'uiTime(): Clearing interval - Timer.remaining:',
          Timer.remaining
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

function syncTimer(state) {
  console.debug(`syncTimer() - New state is ${state}`);

  if (
    Timer.targetCycles.length >= 1 &&
    Timer.status !== 'paused' &&
    Timer.status !== 'initial'
  ) {
    const reference = Date.now();

    // index counters
    let cyclesCompleted = 0;
    let breaksCompleted = 0;

    let target = 0;
    while (target < Timer.settings.totalCycles) {
      if (reference > Timer.targetCycles[target]) {
        cyclesCompleted++;
      }
      target++;
    }
    // console.debug(`cycle location - ${Timer.targetCycles[cycleIndexSaved]}`);

    target = 0;
    while (target < Timer.settings.totalBreaks) {
      if (reference > Timer.targetBreaks[target]) {
        breaksCompleted++;
      }
      target++;
    }
    // console.debug(`break location - ${Timer.targetBreaks[breakIndexSaved]}`);
    // console.debug(`cyclesCompleted: ${cyclesCompleted}`);
    // console.debug(`breaksCompleted: ${breaksCompleted}`);

    clearTimeout(cycleTimeout);
    clearTimeout(breakTimeout);
    // clearInterval(uiInterval); - Not used because the interval is cleared by preload ...
    const locator = cyclesCompleted - breaksCompleted;
    if (Timer.settings.autoStart) {
      if (cyclesCompleted >= Timer.settings.totalCycles) {
        // Complete
        console.debug(
          'Timer complete - Setting Timer.status, Timer.cycle, Timer.break '
        );
        Timer.status = 'complete';
        Timer.cycle = Timer.settings.totalCycles;
        Timer.break = Timer.settings.totalBreaks;
      } else if (locator === 1) {
        // On Break
        console.debug(`locator: 1 -> on break ...`);
        console.debug(
          `Identified cycle: ${cyclesCompleted + 1}, Identified break: ${
            breaksCompleted + 1
          }`
        );
        Timer.status = 'break';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;
        // Resetting the Timeout for "On Break"
        const newTarget = Timer.targetBreaks[breaksCompleted] - Date.now();
        breakTimeout = setTimeout(endBreak, newTarget);
        console.debug(
          'On Break - endBreak() will run at:',
          Timer.targetBreaks[breaksCompleted]
        );
      } else if (locator === 0) {
        // Running
        console.debug(`locator: 0 -> running ...`);
        console.debug(
          `Identified cycle: ${cyclesCompleted + 1}, Identified break: ${
            breaksCompleted + 1
          }`
        );
        Timer.status = 'running';
        Timer.cycle = cyclesCompleted + 1;
        Timer.break = breaksCompleted + 1;
        // Resetting the Timeout for "Running"
        const newTarget = Timer.targetCycles[cyclesCompleted] - Date.now();
        cycleTimeout = setTimeout(endCycle, newTarget);
        console.debug(
          'Running - endCycle() will run at:',
          Timer.targetCycles[cyclesCompleted]
        );
      }
    } else {
      // Checking if the current cycle or break target has passed
      // for Timer.settings.autostart: 'false'
      let difference = 0;
      if (Timer.status === 'running') {
        console.debug(
          `Adjusting current cycle - Timer.status: '${Timer.status}'`
        );
        difference = Timer.targetCycles[Timer.cycle - 1] - reference; // reference = Date.now
        if (difference < 0) {
          // Next state ... break
          const newTarget = Timer.settings.breakTime + Date.now();
          Timer.targetBreaks[Timer.break - 1] = newTarget; // For autostart = false
          clearInterval(uiInterval);
          endCycle();
        } else {
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
        difference = Timer.targetBreaks[Timer.break - 1] - reference; // reference = Date.now
        if (difference < 0) {
          // Next state ... cycle
          clearInterval(uiInterval);
          endBreak();
        } else {
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
      totalCycles: Timer.settings.totalCycles,
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
      message = `great job. everyone, take ${Timer.settings.breakTime / 60000}`;
      break;
    case 'timer-complete':
      id = `${cycleNotification}-${Timer.cycle}`;
      title = 'all cycles complete!';
      message = 'take a long break :)';
      break;
    case 'autostart':
      id = `${breakNotification}-${Timer.break - 1}`;
      title = `cycle ${Timer.cycle} starting`;
      message = 'time to grind, friend';
      break;
    case 'break-complete':
      id = `${breakNotification}-${Timer.break - 1}`;
      title = `don't forget to start cycle ${Timer.cycle}`;
      message = 'time to grind, friend';
      break;
  }

  console.log(`notify(type: ${type})`);
  // console.debug(`id: '${id}' created`);

  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/time-512.png'),
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
    while (i <= Timer.settings.totalCycles) {
      id = `${cycleNotification}-${i}`;
      chrome.notifications.clear(id);
      // console.debug(`id: '${id}' cleared`);
      i++;
    }
    console.log('All cycle-complete notifications cleared');
    i = 1;
    while (i <= Timer.settings.totalBreaks) {
      id = `${breakNotification}-${i}`;
      chrome.notifications.clear(id);
      // console.debug(`id: '${id}' cleared`);
      i++;
    }
    console.log('All break-complete notifications cleared');
  } else {
    id = `${cycleNotification}-${Timer.cycle}`;
    chrome.notifications.clear(id);
    // console.debug(`id: '${id}' cleared`);
    id = `${breakNotification}-${Timer.break}`;
    chrome.notifications.clear(id);
    // console.debug(`id: '${id}' cleared`);
  }
}
