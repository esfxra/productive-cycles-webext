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
  cycleMinutes.addEventListener('input', (e) => {
    const [valid, value] = validate(e.target.value, 1, 59);

    if (!valid) {
      cycleMinutes.classList.add('input-error-outline');
      return;
    } else {
      cycleMinutes.classList.remove('input-error-outline');
      chrome.storage.local.set({ minutes: value });
      return;
    }
  });

  // Break minutes
  const breakMinutes = document.querySelector('#break-minutes');
  breakMinutes.addEventListener('input', (e) => {
    const [valid, value] = validate(e.target.value, 1, 59);

    if (!valid) {
      breakMinutes.classList.add('input-error-outline');
      return;
    } else {
      breakMinutes.classList.remove('input-error-outline');
      chrome.storage.local.set({ break: value });
      return;
    }
  });

  // Total cycles
  const totalCycles = document.querySelector('#total-cycles');
  totalCycles.addEventListener('input', (e) => {
    const [valid, value] = validate(e.target.value, 1, 12);

    if (!valid) {
      totalCycles.classList.add('input-error-outline');
      return;
    } else {
      totalCycles.classList.remove('input-error-outline');
      chrome.storage.local.set({ totalCycles: value });
      return;
    }
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

const validate = (value, min, max) => {
  let parsed = typeof value === 'number' ? value : parseInt(value);

  if (isNaN(parsed)) {
    return [false, parsed];
  }

  if (parsed < min || parsed > max) {
    return [false, parsed];
  } else {
    return [true, parsed];
  }
};
