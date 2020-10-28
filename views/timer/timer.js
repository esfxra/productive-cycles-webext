'use strict';

let port = null;
let previousState = null;
let stateChanged = false;
let lightTheme = false;
let darkTheme = false;

// Dev mode and debug messages
const devMode = false;
function debug(message) {
  if (devMode) {
    console.debug(message);
  }
}

// Register the UI has been loaded and let the background script know
window.addEventListener('DOMContentLoaded', () => {
  // Port operations
  port = chrome.runtime.connect({ name: 'port-from-popup' });
  port.onMessage.addListener(handleMessage);
  // Ask for Timer settings with 'preload' command
  port.postMessage({ command: 'preload' });

  // Register listeners for user input
  registerButtons();

  // Internationalize
  internationalize();

  // Theme operations
  loadTheme();
});

function hideElement(element) {
  debug('Hiding element');
  const elt = document.querySelector(element);
  if (!elt.classList.contains('hidden')) {
    elt.classList.add('hidden');
  }
}

function showElement(element) {
  debug('Showing element');
  const elt = document.querySelector(element);
  if (elt.classList.contains('hidden')) {
    elt.classList.remove('hidden');
  }
}

// Make UI changes based on Timer details messaged by the background script
function handleMessage(message) {
  debug(message);

  // Show update if extension was recently updated
  if (message.update) {
    port.disconnect();
    window.location.href = '../updates/updates.html';
  }

  // Determine whether the state has changed
  if (previousState !== message.state) {
    stateChanged = true;
    previousState = message.state;
  } else {
    stateChanged = false;
  }

  // Change the text in the #time element with the updated time coming from the background script
  document.querySelector('#time').textContent = message.time;

  // Change UI based on message.state
  if (stateChanged) {
    let elt = null;
    switch (message.state) {
      case 'initial':
        elt = document.querySelector('.time-container');
        if (elt.classList.contains('break')) {
          elt.classList.remove('break');
        }
        // Adjust "time"
        document.querySelector('#time').classList.remove('complete-text');
        // Adjust .control spacing
        document.querySelector('.control').style.justifyContent =
          'space-between';
        hideElement('#skip');
        // hideElement("#break-text");
        hideElement('#pause');
        showElement('#start');
        showElement('#reset-cycle');
        showElement('#reset-all');
        break;
      case 'running':
        // Adjust "time"
        document.querySelector('#time').classList.remove('complete-text');
        elt = document.querySelector('.time-container');
        if (elt.classList.contains('break')) {
          elt.classList.remove('break');
        }
        // Adjust .control spacing
        document.querySelector('.control').style.justifyContent =
          'space-between';
        hideElement('#skip');
        // hideElement("#break-text");
        hideElement('#start');
        showElement('#pause');
        showElement('#reset-cycle');
        showElement('#reset-all');
        break;
      case 'paused':
        hideElement('#pause');
        showElement('#start');
        break;
      case 'complete':
        // Adjust "time"
        document.querySelector('#time').textContent = 'complete';
        document.querySelector('#time').classList.add('complete-text');
        document.querySelector('.control').style.justifyContent =
          'space-around';
        hideElement('#pause');
        hideElement('#start');
        break;
      case 'break':
        elt = document.querySelector('.time-container');
        if (!elt.classList.contains('break')) {
          elt.classList.add('break');
        }
        document.querySelector('.control').style.justifyContent = 'center';
        hideElement('#pause');
        hideElement('#start');
        hideElement('#reset-cycle');
        hideElement('#reset-all');
        // showElement("#break-text");
        showElement('#skip');

        break;
    }

    // Tracker
    // Compute the number of cycles to display, which one is running, and which are complete
    debug('Rebuilding the tracker ...');
    debug(`previousState: ${previousState}`);
    const cyclesNode = document.querySelector('.cycles');

    // Reset cyclesNode
    let node = cyclesNode.lastElementChild;
    while (node) {
      cyclesNode.removeChild(node);
      node = cyclesNode.lastElementChild;
    }

    // Adjust CSS for < 4 cycles
    if (message.totalCycles < 4) {
      cyclesNode.style.gridTemplateColumns =
        'repeat(' + message.totalCycles + ', auto)';
    } else {
      cyclesNode.style.gridTemplateColumns = 'repeat(4, auto)';
    }

    if (message.totalCycles < 3) {
      cyclesNode.style.justifyContent = 'space-evenly';
    } else {
      cyclesNode.style.justifyContent = 'space-between';
    }

    // Build cyclesNode
    const cycleTitleString = chrome.i18n.getMessage('cycle');
    let dotNode = null;
    let i = 1;
    while (i <= message.totalCycles) {
      dotNode = document.createElement('span');
      dotNode.id = 'cycle-' + i;
      dotNode.setAttribute('title', `${cycleTitleString} ${i}`);
      dotNode.classList.add('dot');
      if (i === message.cycle) {
        if (message.state === 'initial' || message.state === 'break') {
          dotNode.classList.add('pending');
          // html += '<span id="cycle-' + i + '" class="dot pending"></span>';
        } else if (message.state === 'running' || message.state === 'paused') {
          dotNode.classList.add('running');
          // html += '<span id="cycle-' + i + '" class="dot running"></span>';
        } else if (message.state === 'complete') {
          dotNode.classList.add('complete');
        }
      } else if (i < message.cycle) {
        dotNode.classList.add('complete');
        // html += '<span id="cycle-' + i + '" class="dot complete"></span>';
      } else {
        // This should affect all cycles that are past the current (i.e. i > message.cycle)
        dotNode.classList.add('pending');
        // html += '<span id="cycle-' + i + '" class="dot pending"></span>';
      }
      cyclesNode.appendChild(dotNode);
      i++;
    }
    // document.querySelector(".cycles").innerHTML = html;
  }
}

function registerButtons() {
  // Register listeners for 'settings' button
  const settings = document.querySelector('#options');
  settings.addEventListener('click', () => {
    // Disconnect port
    port.disconnect();
    // Navigate to Settings
    window.location.href = '../settings/settings.html';
  });

  // Register listeners for all buttons
  const startButton = document.querySelector('#start');
  startButton.addEventListener('click', () => {
    // Background Timer actions
    port.postMessage({ command: 'start' });
    // Changes to UI / View
    hideElement('#start');
    showElement('#pause');
  });

  const pauseButton = document.querySelector('#pause');
  pauseButton.addEventListener('click', () => {
    // Background Timer actions
    port.postMessage({ command: 'pause' });
    // Changes to UI / View
    hideElement('#pause');
    showElement('#start');
  });

  const resetCycleButton = document.querySelector('#reset-cycle');
  resetCycleButton.addEventListener('click', () => {
    // Background Timer actions
    port.postMessage({ command: 'reset-cycle' });
    // Changes to UI / View
    hideElement('#pause');
    showElement('#start');
  });

  const resetAllButton = document.querySelector('#reset-all');
  resetAllButton.addEventListener('click', () => {
    // Stop timer in UI and in background
    port.postMessage({ command: 'reset-all' });
    // Changes to UI / View
    hideElement('#pause');
    showElement('#start');
  });

  const skipButton = document.querySelector('#skip');
  skipButton.addEventListener('click', () => {
    // Stop timer in UI and in background
    port.postMessage({ command: 'skip' });
  });
}

function internationalize() {
  // i18n
  // Main UI titles for buttons
  const startButton = document.querySelector('#start');
  startButton.title = chrome.i18n.getMessage('start');

  const pauseButton = document.querySelector('#pause');
  pauseButton.title = chrome.i18n.getMessage('pause');

  const resetCycleButton = document.querySelector('#reset-cycle');
  resetCycleButton.title = chrome.i18n.getMessage('resetCycle');

  const resetAllButton = document.querySelector('#reset-all');
  resetAllButton.title = chrome.i18n.getMessage('resetAll');

  // document.querySelector('#options').title = chrome.i18n.getMessage('options');
  // document.querySelector('#back').title = chrome.i18n.getMessage('back');

  // Title to cycle circles gets added when creating dotNote object

  // Set 'skip break' text
  const skipButton = document.querySelector('#skip');
  skipButton.textContent = chrome.i18n.getMessage('skipBreak');
}

function loadTheme() {
  // Check what is the theme saved in storage
  let stylesheet = document.querySelector('#theme');

  chrome.storage.local.get({ theme: 'light' }, function (items) {
    if (items.theme === 'light') {
      lightTheme = true;
      darkTheme = false;

      if (!stylesheet.href.includes('timer-light')) {
        stylesheet.href = 'light.css';
      }
    } else {
      darkTheme = true;
      lightTheme = false;

      if (!stylesheet.href.includes('timer-dark')) {
        stylesheet.href = 'dark.css';
      }
    }
  });
}
