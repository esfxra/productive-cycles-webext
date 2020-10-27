let lightTheme = false;
let darkTheme = false;

// Handle user clicks
// Register listeners for 'back' button
const back = document.querySelector('#back');

back.addEventListener('click', () => {
  // Navigate to timer view
  window.location.href = '../timer/timer.html';
});

// Register the UI has been loaded and let the background script know
window.addEventListener('DOMContentLoaded', (event) => {
  // Theme operations
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
});
