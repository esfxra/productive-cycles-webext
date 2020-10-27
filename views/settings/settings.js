let lightTheme = false;
let darkTheme = false;

// Handle user clicks
// Register listeners for 'back' button
const back = document.querySelector('#back');

back.addEventListener('click', () => {
  // Navigate to timer view
  window.location.href = '../timer/timer.html';
});

// Register listeners for 'save' button
const saveButton = document.querySelector('#save');

saveButton.addEventListener('click', () => {
  saveOptions();
});

// Register the UI has been loaded and let the background script know
window.addEventListener('DOMContentLoaded', (event) => {
  restoreOptions();

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

  // Register listeners for theme toggle (light / dark)
  const light = document.querySelector('.option-light');
  console.log(light);
  const dark = document.querySelector('.option-dark');
  light.addEventListener('click', () => {
    if (!stylesheet.href.includes('timer-light')) {
      stylesheet.href = 'light.css';
    }

    // Check if it this is the theme saved
    if (!lightTheme) {
      darkTheme = false;
      lightTheme = true;
      chrome.storage.local.set(
        {
          theme: 'light',
        }
        // function () {
        //   console.log('Theme set to light');
        // }
      );
    }
    // } else {
    //   console.log('Theme was already set to light - keeping it');
    // }
  });
  dark.addEventListener('click', () => {
    if (!stylesheet.href.includes('timer-dark')) {
      stylesheet.href = 'dark.css';
    }

    // Check if it this is the theme saved
    if (!darkTheme) {
      darkTheme = true;
      lightTheme = false;
      chrome.storage.local.set(
        {
          theme: 'dark',
        }
        // function () {
        //   console.log('Theme set to dark');
        // }
      );
    }
    // } else {
    //     console.log('Theme was already set to dark - keeping it');
    //   }
  });
});

function saveOptions() {
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
      const status = document.querySelector('#status');
      status.textContent = `${chrome.i18n.getMessage('statusSaved')} 🎉`;
      setTimeout(function () {
        status.textContent = '';
      }, 5000);
    }
  );
}

function restoreOptions() {
  chrome.storage.local.get(
    {
      minutes: 25,
      break: 5,
      totalCycles: 4,
      autoStart: true,
    },
    function (items) {
      document.querySelector('#minutes').value = items.minutes;
      document.querySelector('#break').value = items.break;
      document.querySelector('#cycles').value = items.totalCycles;
      document.querySelector('#auto-start').checked = items.autoStart;
    }
  );
}
