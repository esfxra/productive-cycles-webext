let lightTheme = false;
let darkTheme = false;

// Handle user clicks
// Register listeners for 'back' button
const back = document.querySelector('#back');

back.addEventListener('click', () => {
  // Navigate to timer view
  window.location.href = '../timer/timer.html';
});

// Register listeners for 'save' button in Notification Options
const saveNotificationButton = document.querySelector('#save-notification');

saveNotificationButton.addEventListener('click', () => {
  saveNotificationOptions();
});

// Register listeners for 'save' button in Timer Options
const saveTimerButton = document.querySelector('#save-timer');

saveTimerButton.addEventListener('click', () => {
  saveTimerOptions();
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

// Notification Options
function saveNotificationOptions() {
  // const notificationCycle = document.querySelector('#notification-cycle');
  // const notificationBreak = document.querySelector('#notification-break');
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

// Timer Options
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

function restoreOptions() {
  chrome.storage.local.get(
    {
      // notificationCycle: true,
      // notificationBreak: true,
      notificationSound: true,
      minutes: 25,
      break: 5,
      totalCycles: 4,
      autoStart: true,
    },
    function (items) {
      // Notification settings
      // document.querySelector('#notification-cycle').checked =
      //   items.notificationCycle;
      // document.querySelector('#notification-break').checked =
      //   items.notificationBreak;
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
