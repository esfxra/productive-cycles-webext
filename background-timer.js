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
};

function handleInput(message) {
  switch (message.command) {
    case "start":
      if (Timer.status === "initial") {
        console.log("Command:", message.command, "Status:", Timer.status)

        let startTime = Date.now(); // The current time + what the timer is set up to count as a cycle
        updateTarget(startTime + defaultTime);
        Timer.remaining = Timer.target - startTime; // This is the same amount as defaultTime
        updateStatus("running");

        // Set an alarm
        // chrome.alarms.create( ... );
      }
      else if (Timer.status === "paused") {
        // This code will run when the timer is resumed ...
        // No need to update the target ... or the status
        updateTarget(Date.now() + Timer.remaining);
        console.log("Command:", message.command, "Status:", Timer.status)
        updateStatus("running");
      }
      uiUpdater = setInterval(updateUI, 1000);
      break;
    case "pause":
      console.log("Command:", message.command, "Status:", Timer.status)
      clearInterval(uiUpdater);
      updateStatus("paused");
      break;
    case "preload":
      if (Timer.status === "initial" || Timer.status === "paused") {
        console.log("Command:", message.command, "Status:", Timer.status)
        port.postMessage(Timer.remainingStr());
      }
      else if (Timer.status === "running") {
        console.log("Command:", message.command, "Status:", Timer.status)
        // Start an interval after recalculating remaining time
        Timer.remaining = Timer.target - Date.now();
        console.log("Time left (ms)", Timer.remaining)
        port.postMessage(Timer.remainingStr());

        uiUpdater = setInterval(updateUI, 1000);
      }
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
    port.postMessage(time);
  }

  if (time === "00:00" || !popUpOpen) {
    clearInterval(uiUpdater);
  }
}

function updateTarget(target) {
  Timer.target = target;
  chrome.storage.local.set({ target: Timer.target }, () => console.log("Timer target saved:", Timer.target));
}

function updateStatus(status) {
  // Consider making this a method of Timer
  Timer.status = status;
  chrome.storage.local.set({ status: Timer.status }, () => console.log("Timer status saved:", Timer.status));
}

// Listen for "install" or "update" event
chrome.runtime.onInstalled.addListener((details) => {
  // if (details.reason === "install") {

  // }
  // else if (details.reason === "update") {

  // }

  chrome.storage.local.set({
    target: null,
    status: "initial"
  }, () => console.log("OnInstalled config for target and status"));
});

// Listen for communications from PopUp
chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  popUpOpen = true;

  // Experimental: This seems to be the best place to ...
  // update target after the popup has gone inactive ...
  // IF this does not work ... move it to preload ... case === "running" ...
  // OR move it to the initialization of the Object ... and specifiy default value too
  chrome.storage.local.get(["target", "status"], (result) => {
    Timer.target = result.target;
    Timer.status = result.status;
    console.log(Timer.target);
  });

  port.onDisconnect.addListener(() => {
    popUpOpen = false;
    clearInterval(uiUpdater);
    console.log("PopUp port disconnected; interval cleared");
  })

  port.onMessage.addListener(handleInput);
});

// chrome.alarms.onAlarm.addListener(() => {
//   Timer.status = "complete";

//   // Clear the interval from here ... Need to test this ... Since the interval is started by another listener
//   // Also, this code will only run if the popup view is open ??
//   clearInterval(uiUpdater);

//   // Notify the user
//   let notificationID = "cycle-complete-alarm";
//   chrome.notifications.create(notificationID, {
//     "type": "basic",
//     "iconUrl": chrome.runtime.getURL("icons/time-512.png"),
//     "title": "cycle complete!",
//     "message": "everyone, take 5"
//   });
// });