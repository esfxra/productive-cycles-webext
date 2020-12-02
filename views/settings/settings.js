'use strict';

import { registerNavigation } from '../common-navigation.js';
import { loadTheme } from '../common-utils.js';

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Restore current settings
  restoreOptions();

  // Register listeners for menu
  registerNavigation('settings');

  registerSoundCheckmark();

  registerTimerOptions();

  // Theme operations
  loadTheme();
  registerThemeToggles();
});

// Retrieve timer options from storage
const restoreOptions = () => {
  chrome.storage.local.get(
    {
      notificationSound: true,
      minutes: 25,
      break: 5,
      totalCycles: 4,
      autoStart: true,
    },
    (storage) => {
      document.querySelector('#notification-sound').checked =
        storage.notificationSound;

      // Timer settings
      document.querySelector('#cycle-minutes').value = storage.minutes;
      document.querySelector('#break-minutes').value = storage.break;
      document.querySelector('#total-cycles').value = storage.totalCycles;
      document.querySelector('#auto-start').checked = storage.autoStart;
    }
  );
};

// Register an 'on change' event listener for sound checkmark, and save changes
const registerSoundCheckmark = () => {
  const soundCheckmark = document.querySelector('#notification-sound');
  soundCheckmark.addEventListener('change', (e) => {
    chrome.storage.local.set({ notificationSound: e.target.checked });
  });
};

const registerTimerOptions = () => {
  // Cycle minutes
  const cycleMinutes = document.querySelector('#cycle-minutes');
  cycleMinutes.addEventListener('change', (e) => {
    // Validation
    const numberValue = validateNumberType(e.target.value);
    const rangedValue = validateRangeAndCorrect(
      cycleMinutes,
      numberValue,
      1,
      59
    );

    // Save to storage
    chrome.storage.local.set({ minutes: rangedValue });
  });

  // Break minutes
  const breakMinutes = document.querySelector('#break-minutes');
  breakMinutes.addEventListener('change', (e) => {
    // Validation
    const numberValue = validateNumberType(e.target.value);
    const rangedValue = validateRangeAndCorrect(
      breakMinutes,
      numberValue,
      1,
      59
    );

    // Save to storage
    chrome.storage.local.set({ break: rangedValue });
  });

  // Total cycles
  const totalCycles = document.querySelector('#total-cycles');
  totalCycles.addEventListener('change', (e) => {
    // Validation
    const numberValue = validateNumberType(e.target.value);
    const rangedValue = validateRangeAndCorrect(
      totalCycles,
      numberValue,
      1,
      12
    );

    // Save to storage
    chrome.storage.local.set({ totalCycles: rangedValue });
  });

  // Auto-start
  const autoStartCheckmark = document.querySelector('#auto-start');
  autoStartCheckmark.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoStart: e.target.checked });
  });
};

// Load theme and register theme toggles (toggles only in settings page)
const registerThemeToggles = () => {
  let stylesheet = document.querySelector('#theme');

  // Theme toggle (light / dark)
  const light = document.querySelector('.option-light');
  const dark = document.querySelector('.option-dark');
  light.addEventListener('click', () => {
    if (!stylesheet.href.includes('light')) {
      stylesheet.href = 'light.css';

      chrome.storage.local.set({
        theme: 'light',
      });
    }
  });
  dark.addEventListener('click', () => {
    if (!stylesheet.href.includes('dark')) {
      stylesheet.href = 'dark.css';

      chrome.storage.local.set({
        theme: 'dark',
      });
    }
  });
};

const validateNumberType = (value) => {
  if (typeof value !== 'number') {
    return parseInt(value);
  } else {
    return value;
  }
};

const validateRangeAndCorrect = (inputNode, value, min, max) => {
  let inRange = value;
  if (value < min) {
    inputNode.value = min;
    inRange = min;
  } else if (value > max) {
    inputNode.value = max;
    inRange = max;
  }

  return inRange;
};
