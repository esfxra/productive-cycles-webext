'use strict';

import { Storage, debug } from './background-helper.js';
import { Timer } from './background-timer.js';

// Defaults
const defaultValues = {
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
  autoStart: true,
};

let port = 0;
let popUpOpen = false;
let update = false;

// Initialiaze timer
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
chrome.storage.onChanged.addListener(Storage.handleChanges);

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
  debug('On Connect - Port connected');
  debug('---------------');
  port = portFromPopUp;
  port.onDisconnect.addListener(handleOnDisconnect);
  port.onMessage.addListener(handleMessage);

  popUpOpen = true;

  timer.updatePort(port, popUpOpen);
}

function handleOnDisconnect() {
  debug('On Disconnect - Port disconnected');
  debug('---------------');
  popUpOpen = false;
  timer.updatePort(port, popUpOpen);
}

function handleMessage(message) {
  debug(`Handle Message - Message received: ${message.command}`);
  debug('---------------');
  if (message.command === 'preload' && update === true) {
    // Disable flag until next update
    update = false;

    // Communicate with PopUp to open update view
    let message = timer.formatState();
    message.update = true;
    port.postMessage(message);
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
        timer.startCycle();
        break;
      case 'pause':
        timer.pauseCycle();
        break;
      case 'skip':
        timer.skipBreak();
        break;
      case 'reset-cycle':
        timer.resetCycle();
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
