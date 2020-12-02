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

// Register an 'on change' event listener for sound checkmark, and save changes
const registerSoundCheckmark = () => {
  const soundCheckmark = document.querySelector('#notification-sound');
  soundCheckmark.addEventListener('change', (e) => {
    chrome.storage.local.set({ notificationSound: e.target.checked });
  });
};

// Submit timer options to storage
function saveTimerOptions() {
  const time = parseInt(document.querySelector('#minutes').value);
  const breakTime = parseInt(document.querySelector('#break').value);
  const cycleNumber = parseInt(document.querySelector('#cycles').value);
  const autoStartBox = document.querySelector('#auto-start').checked;
  chrome.storage.local.set(
    {
      minutes: time,
      break: breakTime,
      totalCycles: cycleNumber,
      autoStart: autoStartBox,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.querySelector('#status-timer');
      status.textContent = `${chrome.i18n.getMessage('statusSaved')} 🕗`;
      setTimeout(function () {
        status.textContent = '';
      }, 5000);
    }
  );
}

const registerTimerOptions = () => {
  // Cycle minutes
  const cycleMinutes = document.querySelector('#cycle-minutes');
  cycleMinutes.addEventListener('change', (e) => {
    // Add validation step: check number, and only in range from 1 to 60

    // Save to storage
    chrome.storage.local.set({ minutes: parseInt(e.target.value) });
  });

  // Break minutes
  const breakMinutes = document.querySelector('#break-minutes');
  breakMinutes.addEventListener('change', (e) => {
    // Add validation step: check number, and only in range from 1 to 60

    // Save to storage
    chrome.storage.local.set({ break: parseInt(e.target.value) });
  });

  // Total cycles
  const totalCycles = document.querySelector('#total-cycles');
  totalCycles.addEventListener('change', (e) => {
    // Add validation step: check number, and only in range from 1 to 10

    // Save to storage
    chrome.storage.local.set({ totalCycles: parseInt(e.target.value) });
  });

  // Auto-start
  const autoStartCheckmark = document.querySelector('#auto-start');
  autoStartCheckmark.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoStart: e.target.checked });
  });
};

// Retrieve timer options from storage
function restoreOptions() {
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
}

// Load theme and register theme toggles (toggles only in settings page)
function registerThemeToggles() {
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
}
