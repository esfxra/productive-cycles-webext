'use strict';

let lightTheme = false;
let darkTheme = false;

// Restore options, register listeners for user input, and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Load stats
  loadStatsMap();
  loadStatsSummary();

  // Register listeners for menu
  registerMenu();

  // Theme operations
  loadTheme();
});

function loadStatsMap() {
  chrome.storage.local.get(['statsMap'], (storage) => {
    console.log(storage.statsMap);
  });
}

function loadStatsSummary() {
  const cycleCount = document.querySelector('#stats-cycle-count');
  const fullTimerCount = document.querySelector('#stats-timer-count');

  const timeTotalHours = document.querySelector('#stats-time-total-hours');
  // const timeTotalMinutes = document.querySelector('#stats-time-total-minutes');

  chrome.storage.local.get(['statsSummary'], (storage) => {
    cycleCount.textContent = storage.statsSummary.cycleCount;
    fullTimerCount.textContent = storage.statsSummary.timerCount;
    timeTotalHours.textContent = (
      storage.statsSummary.timeTotal /
      60000 /
      60
    ).toFixed(2);
    // timeTotalMinutes.textContent = (
    //   storage.statsSummary.timeTotal / 60000
    // ).toFixed(2);
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
