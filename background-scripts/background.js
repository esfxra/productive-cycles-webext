'use strict';

// Defaults
const defaultTime = 25;
const defaultBreak = 5;
const defaultCycles = 4;
const defaultAutoStart = true;

const cycles = new Timer(
  defaultTime,
  defaultBreak,
  defaultCycles,
  defaultAutoStart
);

cycles.init();

let port = 0;
let popUpOpen = false;
let uiInterval = 0;
let update = false;

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
chrome.idle.onStateChanged.addListener((state) => {
  console.debug(`System is '${state}'`);
  cycles.sync();
});

// Listen for changes in the options, report and reload
chrome.storage.onChanged.addListener(newSettings);

/* 
    Function definitions

    - install
    - connect
    - disconnect
    - handleMessage
    - newSettings

*/

// Handle install and reload/update events for onInstalled
function install(details) {
  if (details.reason === 'install') {
  } else if (details.reason === 'update') {
    // Future release: Open new tab with changes for this version
    update = true;
    console.debug(`update set to ${update}`);
    cycles.clearNotifications(true);
  }
}

function connect(portFromPopUp) {
  port = portFromPopUp;
  port.onDisconnect.addListener(disconnect);
  port.onMessage.addListener(handleMessage);

  popUpOpen = true;

  cycles.updatePort(port, popUpOpen);
}

function disconnect() {
  popUpOpen = false;
  cycles.updatePort(port, popUpOpen);
}

function handleMessage(message) {
  console.log(message);
  console.debug(`update set to ${update}`);
  if (message.command === 'preload' && update === true) {
    update = false;
    let message = cycles.status();
    message.update = true;
    console.debug(message);
    port.postMessage(message);
  } else {
    cycles.input(message.command);
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

    // Update Settings
    switch (key) {
      case 'minutes':
        cycles.settings.cycleTime =
          storageChange.newValue * 60000 - cycles.settings.cycleDevOffset;
        settingsChanged = true;
        break;
      case 'break':
        cycles.settings.breakTime =
          storageChange.newValue * 60000 - cycles.settings.breakDevOffset;
        settingsChanged = true;
        break;
      case 'totalCycles':
        cycles.settings.totalCycles = storageChange.newValue;
        cycles.settings.totalBreaks = storageChange.newValue - 1;
        settingsChanged = true;
        break;
      case 'autoStart':
        cycles.settings.autoStart = storageChange.newValue;
        settingsChanged = true;
        break;
      // Different behavior for notification settings - Timer is not reset
      case 'notificationSound':
        cycles.notification.sound = storageChange.newValue;
        break;
    }
  }
  if (settingsChanged) {
    // Clear all intervals and Timeouts
    clearTimeout(cycles.timeouts.cycle);
    clearTimeout(cycles.timeouts.break);
    clearTimeout(cycles.timeouts.count);

    // Clear all notifications
    cycles.clearNotifications(true);

    // Set runtime properties to defaults
    cycles.reset('all');
  }
}
