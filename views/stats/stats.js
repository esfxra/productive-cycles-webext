'use strict';

let lightTheme = false;
let darkTheme = false;

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Restore current settings
  loadStats();

  // Register listeners for menu
  registerMenu();

  // Theme operations
  loadTheme();
});

function loadStats() {
  const cycleCount = document.querySelector('#stats-cycle-count');
  // const breakCount = document.querySelector('#stats-break-count');
  const fullTimerCount = document.querySelector('#stats-timer-count');

  const timeTotalHours = document.querySelector('#stats-time-total-hours');
  const timeTotalMinutes = document.querySelector('#stats-time-total-minutes');

  chrome.storage.local.get(['stats'], (storage) => {
    cycleCount.textContent = storage.stats.cycleCount;
    // breakCount.textContent = storage.stats.breakCount;
    fullTimerCount.textContent = storage.stats.timerCount;

    timeTotalHours.textContent = (storage.stats.timeTotal / 60000 / 60).toFixed(
      2
    );
    timeTotalMinutes.textContent = (storage.stats.timeTotal / 60000).toFixed(2);
  });
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
