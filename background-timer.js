"use strict";

// background-timer.js globals
var port = null;
let uiUpdater = null;
let popUpOpen = false;

// Defaults
let defaultTime = 25 * 60000;
let defaultCycles = 4;
let alarmID = "cycle-complete-alarm";
let notificationID = "cycle-complete-noti";

// Default overrides
let userMinutes = null;
let userCycles = null;

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set({
      // User options
      minutes: defaultTime / 60000,
      totalCycles: defaultCycles,
      // Timer properties
      target: null,
      remaining: defaultTime,
      cycle: 1,
      status: "initial"
    }, () => console.log("Extension installed - stored initial config for all variables"));
  }
  else if (details.reason === "update") {
    // Future release: Open new tab with changes for this version

    chrome.alarms.clear(alarmID);
    console.log("Extension updated or reloaded - all previous alarms cleared");

    let i = 1;
    while (i <= Timer.totalCycles) {
      chrome.notifications.clear(notificationID + i);
      i++;
    }
    console.log("Extension updated or reloaded - all notifications cleared")
  }
});

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  popUpOpen = true;

  port.onDisconnect.addListener(() => {
    popUpOpen = false;
    Timer.updateRemaining(Timer.remaining, true);
    clearInterval(uiUpdater);
    console.log("PopUp port disconnected; interval cleared");
  })

  port.onMessage.addListener(handleInput); // Input includes the pre-load command
});

// Listen for cycle complete alarm
chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.local.get(["cycle", "totalCycles"], (result) => {

    console.log("Alarm fired. Cycle completed:", result.cycle);
    console.log("Alarm fired.", "Cycle:", result.cycle, "totalCycles:", result.totalCycles);

    if (result.cycle === result.totalCycles) {
      console.log("Timer completed")
      notify(result.cycle, true);
      Timer.updateStatus("complete", true);
    }
    else if (result.cycle < result.totalCycles) {
      notify(result.cycle, false);
      Timer.updateStatus("initial", true);
      Timer.updateRemaining(userMinutes, true);
    }

    // Increment the cycle counter
    let nextCycle = result.cycle + 1;
    Timer.updateCycle(nextCycle, true);

    // If popUp is open while alarm fires
    // Note: setTimeout() is a temporary fix for waiting until uiUpdater() clears interval
    if (popUpOpen) {
      setTimeout(function () {
        messageUI();
      }, 200);
    }

    // // Future check if needed?
    // if (target - Date.now() < 0) {
    //   // Yes timer has ended ...
    // }
    // else if (intervalComplete) {
    //   // Flag set by updateUI
    //   // Yer timer has ended
    // }
  });
});

// Listen for changes in the options, report and reload
chrome.storage.onChanged.addListener(function (changes, namespace) {
  let optionsChange = false;
  for (var key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);

    if (key === "minutes") {
      userMinutes = storageChange.newValue * 60000;
      optionsChange = true;
    } 
    else if (key === "totalCycles") {
      userCycles = storageChange.newValue;
      optionsChange = true;
    }
  }
  if (optionsChange) {
    Timer.updateRemaining(userMinutes, true);
    Timer.totalCycles = userCycles;
    Timer.updateStatus("initial", true);
    Timer.updateCycle(1, true);

    chrome.alarms.clear(alarmID);

    // Clear all notifications
    let i = 1;
    while (i <= Timer.totalCycles) {
      chrome.notifications.clear(notificationID + i);
      i++;
    }

    if (popUpOpen) {
      messageUI();
    }
  }
});

// Will run in init (once for Firefox, and everytime the script wakes up for Chrome)
chrome.storage.local.get(["minutes", "totalCycles"], function (result) {
  console.log("Init - getting user minutes and cycles:", result.minutes, result.totalCycles);

  if (result.minutes === undefined) { userMinutes = defaultTime; } else { userMinutes = result.minutes * 60000; }
  if (result.totalCycles === undefined) { userCycles = defaultCycles; } else { userCycles = result.totalCycles; }
});

// Timer object
var Timer = {
  target: null,
  remaining: null, // Time remaining
  cycle: 1,
  totalCycles: null, // Will replace with a number read from file / storage / etc
  status: "initial",
  remainingStr: function () {
    // Use a time library for better ms-to-minutes-seconds in the future
    let min = Math.floor((this.remaining) % (1000 * 60 * 60) / (1000 * 60));
    let sec = Math.floor((this.remaining) % (1000 * 60) / 1000);

    // Temporary fix for -1 at the end of timer
    if (min < 1) { min = 0; }
    if (sec < 1) { sec = 0; }

    let minStr = "";
    let secStr = "";

    // Format processed time; add missing 0s
    if (Math.floor(Math.log10(min)) < 1) { minStr = "0" + min; }
    else { minStr = min; }

    if (Math.floor(Math.log10(sec)) < 1) { secStr = "0" + sec; }
    else { secStr = sec; }

    return minStr + ":" + secStr;
  },
  updateTarget: function (target, save) {
    this.target = target;
    if (save) {
      chrome.storage.local.set({ target: this.target }, () => console.log("Timer target saved:", this.target));
    }
  },
  updateStatus: function (status, save) {
    this.status = status;
    if (save) {
      chrome.storage.local.set({ status: this.status }, () => console.log("Timer status saved:", this.status));
    }
  },
  updateRemaining: function (remaining, save) {
    this.remaining = remaining;
    if (save) {
      chrome.storage.local.set({ remaining: this.remaining }, () => console.log("Timer remaining saved:", this.remaining));
    }
  },
  updateCycle: function (cycle, save) {
    this.cycle = cycle;
    if (save) {
      chrome.storage.local.set({ cycle: this.cycle }, () => console.log("Timer cycle saved:", this.cycle));
    }
  }
};

function handleInput(message) {
  switch (message.command) {
    case "start":
      console.log("Command:", message.command, "Status:", Timer.status);

      if (Timer.status === "initial") {
        Timer.updateRemaining(userMinutes, true);
      }
      else if (Timer.status === "paused") {
        // What other code should go here?
        // This runs when the user requests the time to start ... and the timer was previously paused
      }

      Timer.updateTarget(Timer.remaining + Date.now(), true);
      Timer.updateStatus("running", true);

      chrome.alarms.create(alarmID, { when: Timer.target });

      uiUpdater = setInterval(updateUI, 1000);

      break;
    case "pause":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);
      chrome.alarms.clear(alarmID);

      Timer.updateRemaining(Timer.remaining, true);
      Timer.updateStatus("paused", true);

      break;
    case "reset-cycle":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);
      chrome.alarms.clear(alarmID);

      // Go back to the previous cycle
      if (Timer.status === "complete" || Timer.status === "initial" && Timer.cycle > 1) {
        Timer.updateCycle(Timer.cycle - 1, true);
        chrome.notifications.clear(notificationID + Timer.cycle); // Clear notification for this cycle only
      }

      Timer.updateRemaining(userMinutes, true);
      Timer.updateStatus("initial", true);

      messageUI();

      break;
    case "reset-all":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);
      chrome.alarms.clear(alarmID);

      // Clear all notifications
      let i = 1;
      while (i <= Timer.totalCycles) {
        chrome.notifications.clear(notificationID + i);
        i++;
      }

      Timer.updateRemaining(userMinutes, true);
      Timer.updateStatus("initial", true);
      Timer.updateCycle(1, true);

      messageUI();

      break;
    case "preload":
      // Get timer values from storage during preload (for idle background)
      chrome.storage.local.get(["target", "status", "remaining", "cycle", "minutes", "totalCycles"], (result) => {
        console.log("Command:", message.command, "Status:", result.status);

        Timer.updateTarget(result.target, false);
        Timer.updateStatus(result.status, false);
        // Timer.updateRemaining(result.remaining, false);
        Timer.updateCycle(result.cycle, false);
        Timer.totalCycles = result.totalCycles;


        if (Timer.status === "running") {
          Timer.updateRemaining(result.target - Date.now(), false);
          uiUpdater = setInterval(updateUI, 1000);
        }
        else if (Timer.status === "paused") {
          Timer.updateRemaining(result.remaining, true);
        }
        else if (Timer.status === "initial") {
          if (userMinutes !== result.minutes) { userMinutes = result.minutes * 60000; }
          Timer.updateRemaining(userMinutes, true);
        }

        messageUI();

      });
      break;
    default:
      console.log(message, "is not a known input");
  }
}

function updateUI() {
  // Make calculations to find remaining time (ms to minutes-seconds)
  Timer.updateRemaining(Timer.remaining - 1000, false);

  if (popUpOpen) {
    messageUI();
  }

  if (Timer.remainingStr() === "00:00" || !popUpOpen) {
    clearInterval(uiUpdater);

    // The following is handled onAlarm();
    // Timer.updateStatus(...);
    // Timer.updateRemaining(...);
    // Timer.updateCycle(...);
  }
}

function messageUI() {

  port.postMessage({
    time: Timer.remainingStr(),
    totalCycles: Timer.totalCycles,
    cycle: Timer.cycle,
    status: Timer.status
  });
}

function notify(cycle, complete) {
  let message = "";
  if (complete) { message = "take a long break :)"; }
  else { message = "great job. everyone, take 5"; }

  chrome.notifications.create(notificationID + cycle, {
    "type": "basic",
    "iconUrl": chrome.runtime.getURL("icons/time-512.png"),
    "title": "cycle " + cycle + " complete!",
    "message": message
  });
}