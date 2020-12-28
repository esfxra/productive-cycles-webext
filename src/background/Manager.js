'use strict';

import { Timer } from './Timer.js';

// Defaults
const defaultValues = {
  cycleMinutes: 1,
  breakMinutes: 1,
  totalCycles: 4,
  autoStart: {
    cycles: true,
    breaks: true,
  },
};

let comms = {
  port: null,
  open: false,
};

let update = false;

// Initialiaze timer
const timer = new Timer(defaultValues);
// timer.init();

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
  const status = timer.period.status;
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

  const newSettings = {
    theme: 'light',
    notificationsEnabled: true,
    notificationsSound: true,
    autoStartCycles: true,
    autoStartBreaks: true,
    cycleMinutes: 25,
    breakMinutes: 5,
    totalCycles: 4,
  };

  // Initialize storage
  chrome.storage.local.set(newSettings);
}

function runUpdate() {
  // Set update flag to true
  update = true;

  const newSettings = {
    theme: 'light',
    notificationsEnabled: true,
    notificationsSound: true,
    autoStartCycles: true,
    autoStartBreaks: true,
    cycleMinutes: 25,
    breakMinutes: 5,
    totalCycles: 4,
  };

  // Upgrade storage
  chrome.storage.local.clear();
  chrome.storage.local.set(newSettings);
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
    console.log(
      `Key '${key}' in '${namespace} changed\nOld value: '${storageChange.oldValue}', New value: '${storageChange.newValue}'`
    );

    // Update Settings
    switch (key) {
      case 'notificationsEnabled':
        break;
      case 'notificationsSound':
        break;
      case 'autoStartCycles':
        break;
      case 'autoStartBreaks':
        break;
      case 'cycleMinutes':
        timer.settings.cycleTime = storageChange.newValue * 60000;
        break;
      case 'breakMinutes':
        timer.settings.breakTime = storageChange.newValue * 60000;
        break;
      case 'totalCycles':
        break;
    }
  }
}
