'use strict';

import { registerNavigation } from '../common-navigation.js';
import { loadTheme } from '../common-utils.js';

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Restore current settings
  restoreOptions();

  // Register listeners for menu
  registerNavigation('settings');

  registerNotificationCheckmarks();

  registerBehaviorCheckmarks();

  registerTimerOptions();

  // Theme operations
  loadTheme();
  registerThemeToggles();
});

// Retrieve timer options from storage
const restoreOptions = () => {
  chrome.storage.local.get(
    {
      notificationsEnabled: true,
      notificationsSound: true,
      autoStartCycles: true,
      autoStartBreaks: true,
      cycleMinutes: 25,
      breakMinutes: 5,
      totalCycles: 4,
    },
    (storage) => {
      // Notifications
      document.querySelector('#notifications-enabled').checked =
        storage.notificationsEnabled;
      document.querySelector('#notifications-sound').checked =
        storage.notificationsSound;

      // Behavior
      document.querySelector('#autostart-cycles').checked =
        storage.autoStartCycles;
      document.querySelector('#autostart-breaks').checked =
        storage.autoStartBreaks;

      // Timer settings
      document.querySelector('#cycle-minutes').value = storage.cycleMinutes;
      document.querySelector('#break-minutes').value = storage.breakMinutes;
      document.querySelector('#total-cycles').value = storage.totalCycles;
    }
  );
};

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

// Register an 'on change' event listener for sound checkmark, and save changes
const registerNotificationCheckmarks = () => {
  const notificationsEnabled = document.querySelector('#notifications-enabled');
  notificationsEnabled.addEventListener('change', (e) => {
    chrome.storage.local.set({ notificationsEnabled: e.target.checked });
  });

  const notificationsSound = document.querySelector('#notifications-sound');
  notificationsSound.addEventListener('change', (e) => {
    chrome.storage.local.set({ notificationsSound: e.target.checked });
  });
};

const registerBehaviorCheckmarks = () => {
  const autoStartCycles = document.querySelector('#autostart-cycles');
  autoStartCycles.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoStartCycles: e.target.checked });
  });

  const autoStartBreaks = document.querySelector('#autostart-breaks');
  autoStartBreaks.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoStartBreaks: e.target.checked });
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
      chrome.storage.local.set({ cycleMinutes: value });
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
      chrome.storage.local.set({ breakMinutes: value });
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
