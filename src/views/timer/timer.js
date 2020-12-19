'use strict';

import { registerNavigation } from '../common-navigation.js';
import { hideElement, showElement, loadTheme } from '../common-utils.js';

let port = null;

let state = {
  status: null,
  period: null,
  changed: false,
};

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

  // Ask for timer settings with 'preload' command
  port.postMessage({ command: 'preload' });

  // Register listeners for menu
  registerNavigation('timer', port);

  // Register listeners for timer control
  registerButtons();

  // Internationalize
  internationalize();

  // Theme operations
  loadTheme();
});

// Make UI changes based on Timer details messaged by the background script
function handleMessage(message) {
  debug(message);

  // Check whether the update view should be displayed
  if (message.update) {
    port.disconnect();
    window.location.href = '../updates/updates.html';
  }

  // Check if the state has changed
  if (state.status !== message.status || state.period !== message.period) {
    state.changed = true;
    state.status = message.status;
    state.period = message.period;
  } else {
    state.changed = false;
  }

  // Change the text in the #time element with the updated time coming from the background script
  updateTime(message.time);

  if (state.changed) {
    // UI changes for control buttons and time styles - Based on status
    adjustControlAndTime(state.status);

    // Tracker
    adjustCycleTracker(state.period, state.status, message.totalPeriods);
  }
}

function registerButtons() {
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

function updateTime(newTime) {
  const time = document.querySelector('#time');
  time.textContent = newTime;
}

function adjustControlAndTime(status) {
  switch (status) {
    case 'initial': {
      // Remove 'break' styles
      const time = document.querySelector('.time-container');
      if (time.classList.contains('break')) {
        time.classList.remove('break');
      }

      // Adjust .control spacing to 'space-between'
      const control = document.querySelector('.control');
      control.style.justifyContent = 'space-between';

      // Hide necessary elements
      hideElement('#skip');
      hideElement('#pause');

      // Show necessary elements
      showElement('#start');
      showElement('#reset-cycle');
      showElement('#reset-all');
      return;
    }

    case 'running': {
      // Remove 'break' styles
      const time = document.querySelector('.time-container');
      if (time.classList.contains('break')) {
        time.classList.remove('break');
      }

      // Adjust .control spacing to 'space-between'
      const control = document.querySelector('.control');
      control.style.justifyContent = 'space-between';

      // Hide necessary elements
      hideElement('#skip');
      hideElement('#start');

      // Show necessary elements
      showElement('#pause');
      showElement('#reset-cycle');
      showElement('#reset-all');
      return;
    }
    case 'paused': {
      // Hide necessary elements
      hideElement('#pause');

      // Show necessary elements
      showElement('#start');
      return;
    }
    case 'complete': {
      // Hide necessary elements
      hideElement('.time-container');
      hideElement('.control');

      // Show necessary elements
      showElement('.timer-complete-message');
      showElement('.timer-complete-button');

      // Register listener for new timer button
      const newTimer = document.querySelector('.timer-complete-button');
      newTimer.addEventListener('click', () => {
        port.postMessage({ command: 'reset-all' });

        // Hide necessary elements
        hideElement('.timer-complete-message');
        hideElement('.timer-complete-button');

        // Show necessary elements
        showElement('.time-container');
        showElement('.control');
      });

      return;
    }
    case 'break': {
      // Add 'break' styles
      const time = document.querySelector('.time-container');
      if (!time.classList.contains('break')) {
        time.classList.add('break');
      }

      // Adjust .control spacing to 'center'
      const control = document.querySelector('.control');
      control.style.justifyContent = 'center';

      // Hide necessary elements
      hideElement('#pause');
      hideElement('#start');
      hideElement('#reset-cycle');
      hideElement('#reset-all');

      // Show necessary elements
      showElement('#skip');

      return;
    }
  }
}

function adjustCycleTracker(period, status, totalPeriods) {
  const totalCycles = Math.ceil(totalPeriods / 2);

  debug('Rebuilding the tracker ...');
  debug(`totalPeriods: ${totalPeriods}`);
  debug(`totalCycles: ${totalCycles}`);

  const cyclesNode = document.querySelector('.cycles');

  // Reset cyclesNode
  let node = cyclesNode.lastElementChild;
  while (node) {
    cyclesNode.removeChild(node);
    node = cyclesNode.lastElementChild;
  }

  // Adjust CSS for < 4 cycles
  if (totalCycles < 4) {
    cyclesNode.style.gridTemplateColumns = 'repeat(' + totalCycles + ', auto)';
  } else {
    cyclesNode.style.gridTemplateColumns = 'repeat(4, auto)';
  }

  // Adjust CSS for < 3 cycles
  if (totalCycles < 3) {
    cyclesNode.style.justifyContent = 'space-evenly';
  } else {
    cyclesNode.style.justifyContent = 'space-between';
  }

  // Build cyclesNode
  const cycleTitleString = chrome.i18n.getMessage('cycle');
  let dotNode = null;
  let i = 0;
  while (i < totalPeriods) {
    // Consider cycles only (even values)
    if (i % 2 === 0) {
      // Setup cycle node template
      dotNode = document.createElement('span');
      dotNode.id = 'cycle-' + i;
      dotNode.setAttribute('title', `${cycleTitleString} ${i / 2 + 1}`);
      dotNode.classList.add('dot');

      if (i === period) {
        // Decide on styles for current period with 'status'
        if (status === 'initial' || status === 'break') {
          dotNode.classList.add('pending');
        } else if (status === 'running' || status === 'paused') {
          dotNode.classList.add('running');
        } else if (status === 'complete') {
          dotNode.classList.add('complete');
        }
      } else if (i < period) {
        // All previous periods
        dotNode.classList.add('complete');
      } else if (i > period) {
        // All periods that have not started
        dotNode.classList.add('pending');
      }
      // Append node to cyclesNode group
      cyclesNode.appendChild(dotNode);
    }
    i += 1;
  }
}
