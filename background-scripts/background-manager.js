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

const timer = new Timer({ ...defaultValues });
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
const handleOnInstalled = (details) => {
  if (details.reason === 'install') {
    install();
  } else if (details.reason === 'update') {
    update();
  }
};

const install = () => {
  debug('Install');
  debug('---------------');
  // Initialize storage
  // Set update flag to true
  update = true;
};

const update = () => {
  debug('Update');
  debug('---------------');
  // Upgrade storage
  // Set update flag to true
  update = true;
};

/*
|--------------------------------------------------------------------------
| Port communications
|--------------------------------------------------------------------------
*/
const handleOnConnect = (portFromPopUp) => {
  debug('Port connected');
  debug('---------------');
  port = portFromPopUp;
  port.onDisconnect.addListener(handleOnDisconnect);
  port.onMessage.addListener(handleMessage);

  popUpOpen = true;

  timer.updatePort(port, popUpOpen);
};

const handleOnDisconnect = () => {
  debug('Port disconnected');
  debug('---------------');
  popUpOpen = false;
  timer.updatePort(port, popUpOpen);
};

const handleMessage = (message) => {
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
};

/*
|--------------------------------------------------------------------------
| Storage changes
|--------------------------------------------------------------------------
*/
const handleStorageChange = (changes, namespace) => {
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
          storageChange.newValue * 60000 - timer.settings.cycleDevOffset;
        settingsChanged = true;
        break;
      case 'break':
        timer.settings.breakTime =
          storageChange.newValue * 60000 - timer.settings.breakDevOffset;
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
        timer.notification.sound = storageChange.newValue;
        break;
    }
  }
  if (settingsChanged) {
    // Clear all intervals and Timeouts
    clearTimeout(timer.timeouts.cycle);
    clearTimeout(timer.timeouts.break);
    clearTimeout(timer.timeouts.count);

    // Clear all notifications
    timer.clearNotifications(true);

    // Set runtime properties to defaults
    timer.reset('all');
  }
};

/*
|--------------------------------------------------------------------------
| Additional utilities
|--------------------------------------------------------------------------
*/
const debug = (message) => {
  if (devMode) {
    console.debug(message);
  }
};
