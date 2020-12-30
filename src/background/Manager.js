'use strict';

import { Timer } from './Timer.js';
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
chrome.idle.onStateChanged.addListener((state) => {
  const status = timer.periods.current.status;
  if (!(status === 'running')) {
    console.log(`State ${state} - Timer status is ${status}. No need to sync.`);
    return;
  }
  console.log(
    `State ${state} - Timer status is ${status}. Making adjustments.`
  );
  const reference = Date.now();
  timer.sync(reference);
});

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

function handleStorageChanges(changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    const oldValue = storageChange.oldValue;
    const newValue = storageChange.newValue;

    if (oldValue === undefined || newValue === undefined) return;

    console.log(`Key '${key}' in '${namespace}' changed
    \nOld value: '${oldValue}'
    \nNew value: '${newValue}'`);

    // Update Settings
    switch (key) {
      case 'notificationsEnabled':
        break;
      case 'notificationsSound':
        break;
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
        // timer.adjustTotalPeriods(storageChange.newValue * 2 - 1);
        break;
    }
  }
}
