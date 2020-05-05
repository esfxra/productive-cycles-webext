"use strict";

// background-timer.js globals
var port = null;
var uiUpdater = null;
var cycleTimer = null;
var breakTimer = null;
var popUpOpen = false;
var autoStartEnabled = true;

// Defaults
const defaultTime = 25 * 60000;
const defaultBreak = (1 / 2) * 60000; // Test purposes
const defaultCycles = 4;
const notificationID = "cycle-complete-notification";

// Default overrides
let userMinutes = null;
let userBreak = null;
let userCycles = null;

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed");
  } else if (details.reason === "update") {
    // Future release: Open new tab with changes for this version
    console.log("Extension updated or reloaded");
    clearAllNotifications(true);
  }
});

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  popUpOpen = true;

  port.onDisconnect.addListener(() => {
    popUpOpen = false;
    clearInterval(uiUpdater);
    console.log("PopUp port disconnected; interval cleared");
  });

  port.onMessage.addListener(handleInput); // Input includes the pre-load command
});

// Listen for changes in the options, report and reload
chrome.storage.onChanged.addListener(function (changes, namespace) {
  let optionsChange = false;
  for (var key in changes) {
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );

    if (key === "minutes") {
      userMinutes = storageChange.newValue * 60000;
      optionsChange = true;
    } else if (key === "break") {
      userBreak = storageChange.newValue * 60000;
      optionsChange = true;
    } else if (key === "totalCycles") {
      userCycles = storageChange.newValue;
      optionsChange = true;
    }
  }
  if (optionsChange) {
    clearInterval(uiUpdater);
    clearTimeout(cycleTimer);
    clearTimeout(breakTimer);
    Timer.remaining = userMinutes;
    Timer.break = userBreak;
    Timer.totalCycles = userCycles;
    Timer.status = "initial";
    Timer.cycle = 1;
    // Clear all notifications
    let i = 1;
    while (i <= Timer.totalCycles) {
      chrome.notifications.clear(notificationID + i);
      i++;
    }
    // Message PopUp to update timer UI with new changes
    messageUI();
  }
});

// Timer object
var Timer = {
  target: null,
  remaining: null, // Time remaining
  break: null,
  cycle: 1,
  totalCycles: null, // Will replace with a number read from file / storage / etc
  status: "initial",
  remainingStr: function () {
    // Use a time library for better ms-to-minutes-seconds in the future
    let min = Math.floor((this.remaining % (1000 * 60 * 60)) / (1000 * 60));
    let sec = Math.floor((this.remaining % (1000 * 60)) / 1000);

    // Temporary fix for -1 at the end of timer
    if (min < 1) {
      min = 0;
    }
    if (sec < 1) {
      sec = 0;
    }

    let minStr = "";
    let secStr = "";

    // Format processed time; add missing 0s
    if (Math.floor(Math.log10(min)) < 1) {
      minStr = "0" + min;
    } else {
      minStr = min;
    }

    if (Math.floor(Math.log10(sec)) < 1) {
      secStr = "0" + sec;
    } else {
      secStr = sec;
    }

    return minStr + ":" + secStr;
  },
};

// Will run in init
chrome.storage.local.get(["minutes", "totalCycles", "break"], function (
  result
) {
  console.log(
    `Init - minutes: ${result.minutes}, cycles: ${result.totalCycles}, break: ${result.break}`
  );

  if (result.minutes === undefined) {
    userMinutes = defaultTime;
  } else {
    userMinutes = result.minutes * 60000;
  }
  if (result.totalCycles === undefined) {
    userCycles = defaultCycles;
  } else {
    userCycles = result.totalCycles;
  }
  if (result.break === undefined) {
    userBreak = defaultBreak;
  } else {
    userBreak = result.break;
  }

  Timer.remaining = userMinutes;
  Timer.totalCycles = userCycles;
  Timer.break = userBreak;
});

function handleInput(message) {
  console.log("Command:", message.command, "Status:", Timer.status);
  switch (message.command) {
    case "start":
      clearTimeout(breakTimer); // In case a user wants to start before userBreak
      if (Timer.status === "initial") {
        Timer.remaining = userMinutes;
      }
      Timer.target = Timer.remaining + Date.now();
      Timer.status = "running";
      cycleTimer = setTimeout(completeCycle, Timer.remaining);
      console.log("completeCycle() will run in:", Timer.remainingStr());
      if (popUpOpen) {
        uiUpdater = setInterval(updateUI, 1000);
        console.log("running updateUI");
      }
      break;
    case "pause":
      clearInterval(uiUpdater);
      clearTimeout(cycleTimer);
      Timer.status = "paused";
      break;
    case "reset-cycle":
      clearInterval(uiUpdater);
      clearTimeout(cycleTimer);
      clearTimeout(breakTimer);
      // Go back to the previous cycle and clear relevant notification
      if (
        Timer.status === "complete" ||
        (Timer.status === "initial" && Timer.cycle > 1)
      ) {
        Timer.cycle = Timer.cycle - 1;
        clearAllNotifications(false); // false = clear notifications for current cycle only
      }
      Timer.remaining = userMinutes;
      Timer.status = "initial";
      messageUI();
      break;
    case "reset-all":
      clearInterval(uiUpdater);
      clearTimeout(cycleTimer);
      clearTimeout(breakTimer);
      clearAllNotifications(true);
      Timer.remaining = userMinutes;
      Timer.status = "initial";
      Timer.cycle = 1;
      messageUI();
      break;
    case "preload":
      if (Timer.status === "running") {
        Timer.remaining = Timer.target - Date.now();
        uiUpdater = setInterval(updateUI, 1000);
      }
      messageUI();
      break;
    default:
      console.log(message, "is not a known input");
  }
}

function completeCycle() {
  console.log(
    `Cycle completed: ${Timer.cycle}, Total cycles: ${Timer.totalCycles}`
  );
  // if (popUpOpen) {
  // }
  // Clear the interval
  clearInterval(uiUpdater);
  if (Timer.cycle === Timer.totalCycles) {
    notify("timer-complete");
    Timer.status = "complete";
  } else if (Timer.cycle < Timer.totalCycles) {
    notify("cycle-complete");
    Timer.status = "initial";
    Timer.remaining = userMinutes;
    // Start the break timer
    breakTimer = setTimeout(completeBreak, Timer.break);
    console.log("completeBreak() will run in:", Timer.break);
  }
  // Increment the cycle counter
  Timer.cycle = Timer.cycle + 1;
  messageUI();
}

function completeBreak() {
  if (autoStartEnabled) {
    console.log("auto-start enabled - next cycle is starting ...");
    notify("autostart");
    handleInput({ command: "start" });
  } else {
    console.log("auto-start disabled - notifying break is over");
    notify("break-complete");
  }
}

function updateUI() {
  // Make calculations to find remaining time (ms to minutes-seconds)
  Timer.remaining = Timer.remaining - 1000;
  messageUI();
  if (Timer.remainingStr() === "00:00") {
    clearInterval(uiUpdater);
    console.log("Interval was cleared");
  }
}

function messageUI() {
  if (popUpOpen) {
    port.postMessage({
      time: Timer.remainingStr(),
      totalCycles: Timer.totalCycles,
      cycle: Timer.cycle,
      status: Timer.status,
    });
  }
}

function notify(type) {
  let id = notificationID;
  let title = "";
  let message = "";
  switch (type) {
    case "cycle-complete":
      id = `${id}-${Timer.cycle}`;
      title = `cycle ${Timer.cycle} complete!`;
      message = "great job. everyone, take 5";
      break;
    case "timer-complete":
      id = `${id}-${Timer.cycle}`;
      title = "all cycles complete!";
      message = "take a long break :)";
      break;
    case "autostart":
      id = `${id}-${Timer.cycle}-break`;
      title = `cycle ${Timer.cycle} starting`;
      message = "time to grind, friend";
      break;
    case "break-complete":
      id = `${id}-${Timer.cycle}-break`;
      title = `don't forget to start cycle ${Timer.cycle}`;
      message = "time to grind, friend";
      break;
  }

  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/time-512.png"),
    title: title,
    message: message,
  });
}

function clearAllNotifications(clearAll) {
  let id = null;
  if (clearAll) {
    let i = 1;
    while (i <= Timer.totalCycles) {
      id = `${notificationID}-${i}`;
      chrome.notifications.clear(id);
      chrome.notifications.clear(id + "-break");
      i++;
    }
    console.log("All notifications cleared");
  } else {
    id = `${notificationID}-${Timer.cycle}`;
    chrome.notifications.clear(id);
    chrome.notifications.clear(id + "-break");
    console.log(`Cycle ${Timer.cycle} notifications cleared`);
  }
}
