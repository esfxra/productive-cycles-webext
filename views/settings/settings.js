'use strict';

import { registerNavigation } from '../common-navigation.js';
import { loadTheme } from '../common-utils.js';

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Restore current settings
  restoreOptions();

  // Register listeners for menu
  registerNavigation('settings');

  // Register listeners for 'save-notification' button
  const saveNotificationButton = document.querySelector('#save-notification');
  saveNotificationButton.addEventListener('click', saveNotificationOptions);

  // Register listeners for 'save-timer' button
  const saveTimerButton = document.querySelector('#save-timer');
  saveTimerButton.addEventListener('click', saveTimerOptions);

  // Theme operations
  loadTheme();
  registerThemeToggles();
});

// Notification Options
function saveNotificationOptions() {
  const notificationSound = document.querySelector('#notification-sound');
  chrome.storage.local.set(
    {
      notificationSound: notificationSound.checked,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.querySelector('#status-notification');
      const emoji = notificationSound.checked ? '🔉' : '🔇';
      status.textContent = `${chrome.i18n.getMessage('statusSaved')} ${emoji}`;
      setTimeout(function () {
        status.textContent = '';
      }, 5000);
    }
  );
}

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
    function (items) {
      document.querySelector('#notification-sound').checked =
        items.notificationSound;

      // Timer settings
      document.querySelector('#minutes').value = items.minutes;
      document.querySelector('#break').value = items.break;
      document.querySelector('#cycles').value = items.totalCycles;
      document.querySelector('#auto-start').checked = items.autoStart;
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
