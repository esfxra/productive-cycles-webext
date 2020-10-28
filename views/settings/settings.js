'use strict';

let lightTheme = false;
let darkTheme = false;

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Restore current settings
  restoreOptions();

  // Register listeners for 'back' button
  const back = document.querySelector('#back');
  back.addEventListener('click', () => {
    // Navigate to timer view
    window.location.href = '../timer/timer.html';
  });

  // Register listeners for 'save-notification' button
  const saveNotificationButton = document.querySelector('#save-notification');
  saveNotificationButton.addEventListener('click', saveNotificationOptions);

  // Register listeners for 'save-timer' button
  const saveTimerButton = document.querySelector('#save-timer');
  saveTimerButton.addEventListener('click', saveTimerOptions);

  // Theme operations
  loadThemeAndRegisterToggles();
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
function loadThemeAndRegisterToggles() {
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

  // Theme toggle (light / dark)
  const light = document.querySelector('.option-light');
  const dark = document.querySelector('.option-dark');
  light.addEventListener('click', () => {
    if (!stylesheet.href.includes('timer-light')) {
      stylesheet.href = 'light.css';
    }

    // Check if it this is the theme saved
    if (!lightTheme) {
      darkTheme = false;
      lightTheme = true;
      chrome.storage.local.set({
        theme: 'light',
      });
    }
  });
  dark.addEventListener('click', () => {
    if (!stylesheet.href.includes('timer-dark')) {
      stylesheet.href = 'dark.css';
    }

    // Check if it this is the theme saved
    if (!darkTheme) {
      darkTheme = true;
      lightTheme = false;
      chrome.storage.local.set({
        theme: 'dark',
      });
    }
  });
}
