"use strict";

// timer.js globals
var port = chrome.runtime.connect({ name: "port-from-popup" });

// Handle inputs
document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection });

  // Switch buttons based on input
  if (selection === "start") {
    switchButtons("#start", "#pause")
  }
  else if (selection === "pause" || selection === "reset-cycle" || selection === "reset-all") {
    switchButtons("#pause", "#start")
  }
  else if (selection === "options") {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('../options/options.html'));
    }
  }
});

// Register the UI has been loaded and let the background script know
window.addEventListener("DOMContentLoaded", (event) => {
  port.postMessage({ command: "preload" });
});

// Make UI changes based on Timer details messaged by the background script
port.onMessage.addListener((message) => {
  console.log(message);

  // Change the text in the #time element with the updated time coming from the background script
  document.querySelector("#time").textContent = message.time;

  // Check if the timer is complete, and change time text to "complete"
  // if (message.status === "complete" || message.cycle > message.totalCycles) {
    if (message.status === "complete") {

    document.querySelector("#time").textContent = "complete";

    // Hide "start" and "pause"
    let elt = document.querySelector("#pause");
    if (!elt.classList.contains("hidden")) {
      elt.classList.add("hidden")
    }

    elt = document.querySelector("#start");
    if (!elt.classList.contains("hidden")) {
      elt.classList.add("hidden")
    }

    // Change CSS justify-content to space-around for .control
    document.querySelector(".control").style.justifyContent = "space-around";
  }
  else {
    // Change CSS justify-content to space-around for .control
    document.querySelector(".control").style.justifyContent = "space-between";
  }

  // Switch buttons based on status of the Timer
  if (message.status === "initial" || message.status === "paused") {
    switchButtons("#pause", "#start");
  }
  else if (message.status === "running") {
    switchButtons("#start", "#pause");
  }

  // Tracker
  // Compute the number of cycles to display, which one is running, and which are complete
  let html = '';
  let i = 1;
  while (i <= message.totalCycles) {
    if (i === message.cycle) {
      if (message.status === "initial") {
        html += '<span id="cycle-' + i + '" class="dot pending"></span>';
      }
      else if (message.status === "running" || message.status === "paused") {
        html += '<span id="cycle-' + i + '" class="dot running"></span>';
      }
    }
    else if (i < message.cycle) {
      html += '<span id="cycle-' + i + '" class="dot complete"></span>';
    }
    else {
      // This should affect all cycles that are past the current (i.e. i > message.cycle)
      html += '<span id="cycle-' + i + '" class="dot pending"></span>';
    }
    i++;
  }

  document.querySelector(".cycles").innerHTML = html;
});

function switchButtons(hide, show) {
  let elt = document.querySelector(hide);
  elt.classList.add("hidden");

  elt = document.querySelector(show);
  elt.classList.remove("hidden");
}