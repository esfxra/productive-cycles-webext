'use strict';

import { Timer } from './Timer.js';
import { Adjuster } from './Adjuster.js';
import { Utilities } from './Utilities.js';

const defaultSettings = {
  theme: 'light',
  notificationsEnabled: true,
  notificationsSound: true,
  autoStartCycles: true,
  autoStartBreaks: true,
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
};

let comms = {
  port: null,
  open: false,
};

let update = false;

// Initialiaze timer
const timer = new Timer();
// Delay to prevent conflict with install and update events
setTimeout(() => {
  Utilities.getStoredSettings().then((settings) => {
    timer.init(settings);
  });
}, 200);

/*
|--------------------------------------------------------------------------
| Register manager's listeners
|--------------------------------------------------------------------------
|
| - runtime.onInstalled
| - runtime.onConnect
| - idle.onStateChanged
| - storage.onChanged
|
*/

chrome.runtime.onInstalled.addListener(handleOnInstalled);
chrome.runtime.onConnect.addListener(handleOnConnect);
chrome.storage.onChanged.addListener(handleStorageChanges);
chrome.idle.onStateChanged.addListener(handleStateChange);

/*
|--------------------------------------------------------------------------
| Install & Update operations
|--------------------------------------------------------------------------
*/
function handleOnInstalled(details) {
  if (details.reason === 'install') {
    runInstall();
  } else if (details.reason === 'update') {
    runUpdate();
  }
}

function runInstall() {
  // Set update flag to true
  update = true;
  // Initialize storage
  chrome.storage.local.set(defaultSettings);
}

function runUpdate() {
  // Set update flag to true
  update = true;
  // Upgrade storage
  chrome.storage.local.clear();
  chrome.storage.local.set(defaultSettings);
}

/*
|--------------------------------------------------------------------------
| Port communications
|--------------------------------------------------------------------------
*/
function handleOnConnect(portFromPopUp) {
  comms.port = portFromPopUp;
  comms.port.onDisconnect.addListener(handleOnDisconnect);
  comms.port.onMessage.addListener(handleMessage);
  comms.open = true;

  timer.updateComms(comms.port, comms.open);
}

function handleOnDisconnect() {
  comms.open = false;
  timer.updateComms(comms.port, comms.open);
}

function handleMessage(message) {
  if (message.command === 'preload' && update === true) {
    // Disable flag until next update
    update = false;

    // Communicate with PopUp to open update view
    let message = timer.formatState();
    message.update = true;
    comms.port.postMessage(message);
  } else {
    /*
    |--------------------------------------------------------------------------
    | Forward all other commands to timer
    |--------------------------------------------------------------------------
    |
    | - 'start'
    | - 'pause'
    | - 'reset-cycle'
    | - 'reset-all'
    | - 'skip'
    | - 'preload'
    |
    */
    switch (message.command) {
      case 'start':
        timer.start();
        break;
      case 'pause':
        timer.pause();
        break;
      case 'skip':
        timer.skip();
        break;
      case 'reset-cycle':
        timer.reset();
        break;
      case 'reset-all':
        timer.resetAll();
        break;
      case 'preload':
        timer.postState();
        break;
    }
  }
}

/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
*/
function handleStorageChanges(changes) {
  for (let key in changes) {
    let storageChange = changes[key];
    const oldValue = storageChange.oldValue;
    const newValue = storageChange.newValue;

    if (oldValue === undefined || newValue === undefined) return;

    // Update Settings
    switch (key) {
      case 'autoStartCycles':
        timer.updateAutoStart({ cycles: storageChange.newValue });
        break;
      case 'autoStartBreaks':
        timer.updateAutoStart({ breaks: storageChange.newValue });
        break;
      case 'cycleMinutes':
        timer.updateTime({ cycleTime: storageChange.newValue * 60000 });
        break;
      case 'breakMinutes':
        timer.updateTime({ breakTime: storageChange.newValue * 60000 });
        break;
      case 'totalCycles':
        timer.updateTotalPeriods(storageChange.newValue * 2 - 1);
        break;
    }
  }
}

/*
|--------------------------------------------------------------------------
| State changes
|--------------------------------------------------------------------------
*/
async function handleStateChange(state) {
  console.log(`Manager - State is ${state}`);

  const status = timer.periods.current.status;

  if (status === 'running') {
    chrome.idle.onStateChanged.removeListener(handleStateChange);

    await Adjuster.adjust(timer, Date.now());
    console.log('Manager - Timer adjusted');

    chrome.idle.onStateChanged.addListener(handleStateChange);
  }
}
