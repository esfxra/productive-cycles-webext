'use strict';

// Defaults
const defaultValues = {
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
  autoStart: true,
};

const devMode = true;

let port = 0;
let popUpOpen = false;
let uiInterval = 0;
let update = false;

const timer = new Timer(defaultValues);
timer.init();

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
chrome.idle.onStateChanged.addListener((state) => {
  debug(`System is '${state}'`);
  timer.sync();
});
chrome.storage.onChanged.addListener(handleStorageChange);

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
  debug('Install');
  debug('---------------');
  // Initialize storage
  // Set update flag to true
  update = true;
}

function runUpdate() {
  debug('Update');
  debug('---------------');
  // Upgrade storage
  // Storage.upgrade()
  // Set update flag to true
  update = true;
}

/*
|--------------------------------------------------------------------------
| Port communications
|--------------------------------------------------------------------------
*/
function handleOnConnect(portFromPopUp) {
  debug('Port connected');
  debug('---------------');
  port = portFromPopUp;
  port.onDisconnect.addListener(handleOnDisconnect);
  port.onMessage.addListener(handleMessage);

  popUpOpen = true;

  timer.updatePort(port, popUpOpen);
}

function handleOnDisconnect() {
  debug('Port disconnected');
  debug('---------------');
  popUpOpen = false;
  timer.updatePort(port, popUpOpen);
}

function handleMessage(message) {
  debug(`Message received: ${message.command}`);
  debug('---------------');
  if (message.command === 'preload' && update === true) {
    // Disable flag until next update
    update = false;

    // Communicate with PopUp to open update view
    let message = timer.status();
    message.update = true;
    port.postMessage(message);
  } else {
    /*
    |--------------------------------------------------------------------------
    | Forward all other commands to timer
    |--------------------------------------------------------------------------
    |
    | - 'preload'
    | - 'start'
    | - 'pause'
    | - 'reset-cycle'
    | - 'reset-all'
    | - 'skip'
    |
    */
    timer.input(message.command);
  }
}

/*
|--------------------------------------------------------------------------
| Storage changes
|--------------------------------------------------------------------------
*/
function handleStorageChange(changes, namespace) {
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

/*
|--------------------------------------------------------------------------
| Additional utilities
|--------------------------------------------------------------------------
*/
function debug(message) {
  if (devMode) {
    console.debug(message);
  }
}
