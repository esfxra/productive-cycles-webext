'use strict';

let lightTheme = false;
let darkTheme = false;

// Register menu and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Register listeners for menu
  registerMenu();

  // Theme operations
  loadTheme();
});

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
