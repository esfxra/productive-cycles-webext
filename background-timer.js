"use strict";

// background-timer.js globals
let port = null;
let uiUpdater = null;
let popUpOpen = false;

// Defaults
let defaultTime = 1 * 60000;
let defaultCycles = 4;

// Timer object
var Timer = {
  target: null,
  remaining: defaultTime, // Time remaining
  cycle: 1,
  totalCycles: defaultCycles, // Will replace with a number read from file / storage / etc
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
        Timer.updateRemaining(defaultTime, true);
      }
      else if (Timer.status === "paused") {
        // What other code should go here?
        // This runs when the user requests the time to start ... and the timer was previously paused
      }

      Timer.updateTarget(Timer.remaining + Date.now(), true);
      Timer.updateStatus("running", true);

      // Set an alarm ... but first clear a previous (commented since we are clearing when pause, reset, reset all is pressed)
      // chrome.alarms.clear("cycle-complete-alarm")
      chrome.alarms.create("cycle-complete-alarm", { when: Timer.target });

      uiUpdater = setInterval(updateUI, 1000);

      break;
    case "pause":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);
      chrome.alarms.clear("cycle-complete-alarm");

      Timer.updateRemaining(Timer.remaining, true);
      Timer.updateStatus("paused", true);

      // Timer.target is not updated ... since that is updated when the timer is resumed

      break;
    case "reset-cycle":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);
      chrome.alarms.clear("cycle-complete-alarm");

      if (Timer.status === "complete") {
        Timer.cycle--;
        Timer.updateCycle(Timer.cycle, true);
      }

      Timer.updateRemaining(defaultTime, true);
      Timer.updateStatus("initial", true);

      // Post message ... so that the UI updates
      port.postMessage({
        time: Timer.remainingStr(),
        totalCycles: Timer.totalCycles,
        cycle: Timer.cycle,
        status: Timer.status
      });

      break;
    case "reset-all":
      console.log("Command:", message.command, "Status:", Timer.status);

      clearInterval(uiUpdater);

      // Clear the alarm
      chrome.alarms.clear("cycle-complete-alarm");

      // Clear all notifications
      // Could update in the future to clear up until current cycle only ...
      // Or up until current cycle (non-inclusive)
      let i = 1;
      while (i <= Timer.totalCycles) {
        let id = "cycle-complete-alarm" + i;
        chrome.notifications.clear(id);
        i++;
      }
      console.log("OnInstalled - all notifications cleared")

      Timer.updateRemaining(defaultTime, true);
      Timer.updateStatus("initial", true);
      Timer.updateCycle(1, true);

      // Post message ... so that the UI updates
      port.postMessage({
        time: Timer.remainingStr(),
        totalCycles: Timer.totalCycles,
        cycle: Timer.cycle,
        status: Timer.status
      });

      break;
    case "preload":
      chrome.storage.local.get(["target", "status", "remaining", "cycle"], (result) => {
        // Get timer values from storage during preload (for idle background)
        Timer.updateTarget(result.target, false);
        Timer.updateStatus(result.status, false);
        Timer.updateRemaining(result.remaining, false);
        Timer.updateCycle(result.cycle, false);

        console.log("Command:", message.command, "Status:", Timer.status);

        if (Timer.status === "running") {
          Timer.updateRemaining(Timer.target - Date.now(), false); // Consider using a conditional to either do this OR the one above
          port.postMessage({
            time: Timer.remainingStr(),
            totalCycles: Timer.totalCycles,
            cycle: Timer.cycle,
            status: Timer.status
          });

          uiUpdater = setInterval(updateUI, 1000);
        }
        else if (Timer.status === "initial" || Timer.status === "paused" || Timer.status === "complete") {
          port.postMessage({
            time: Timer.remainingStr(),
            totalCycles: Timer.totalCycles,
            cycle: Timer.cycle,
            status: Timer.status
          });
        }
      });
      break;
    default:
      console.log(message, "is not a known input");
  }
}

function updateUI() {
  // Make calculations to find remaining time (ms to minutes-seconds)
  Timer.remaining = Timer.remaining - 1000;
  let time = Timer.remainingStr();

  if (popUpOpen) {
    console.log("Time posted:", time);
    port.postMessage({
      time: Timer.remainingStr(),
      totalCycles: Timer.totalCycles,
      cycle: Timer.cycle,
      status: Timer.status
    });
  }

  if (time === "00:00" || !popUpOpen) {
    if (time === "00:00") {
      Timer.cycle++;

      if (Timer.cycle > Timer.totalCycles) {
        Timer.updateStatus("complete", true);
      }
      else {
        Timer.updateStatus("initial", true);
        Timer.updateRemaining(defaultTime, true);
      }

      Timer.updateCycle(Timer.cycle, true);

      port.postMessage({
        time: Timer.remainingStr(),
        totalCycles: Timer.totalCycles,
        cycle: Timer.cycle,
        status: Timer.status
      });
    }
    clearInterval(uiUpdater);
  }
}

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  popUpOpen = true;

  port.onDisconnect.addListener(() => {
    popUpOpen = false;
    Timer.updateRemaining(Timer.remaining, true);
    // Timer.updateTarget(Timer.target, true);
    clearInterval(uiUpdater);
    console.log("PopUp port disconnected; interval cleared");
  })

  port.onMessage.addListener(handleInput); // Input includes the pre-load command
});

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener((details) => {
  // if (details.reason === "install") {

  // }
  // else if (details.reason === "update") {

  // }

  chrome.storage.local.set({
    target: null,
    status: "initial",
    remaining: defaultTime, // experimental,
    cycle: 1,
    cyclesTotal: defaultCycles
  }, () => console.log("OnInstalled - config for target, status, remaining, cycle, and cycleTotal (in storage)"));

  chrome.alarms.clearAll(() => console.log("OnInstalled - all alarms cleared"));

  let i = 1;
  while (i <= Timer.totalCycles) {
    let id = "cycle-complete-alarm" + i;
    chrome.notifications.clear(id);
    i++;
  }
  console.log("OnInstalled - all notifications cleared")
});

chrome.alarms.onAlarm.addListener(() => {
  // Add Timer.cycle++ and Timer.cycleUpdate(...) here in the future
  chrome.storage.local.get(["cycle"], (result) => {
    let cycle = result.cycle;

    // Notify the user
    let notificationID = "cycle-complete-alarm" + cycle;
    chrome.notifications.create(notificationID, {
      "type": "basic",
      "iconUrl": chrome.runtime.getURL("icons/time-512.png"),
      "title": "cycle " + cycle + " complete!",
      "message": "great job. take a break :)"
    });
  });
});