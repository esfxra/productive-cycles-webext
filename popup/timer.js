"use strict";

// timer.js globals
let port = chrome.runtime.connect({ name: "port-from-popup" });

// Handle inputs
document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection });

  // Switch buttons based on input
  if (selection === "start") {
    switchButtons("#start", "#pause")
  }
  else if (selection === "pause") {
    switchButtons("#pause", "#start")
  }
});

// Register the UI has been loaded and let the background script know
window.addEventListener("DOMContentLoaded", (event) => {
  console.log(event);
  port.postMessage({ command: "preload" });
});

// Make UI changes based on Timer details messaged by the background script
port.onMessage.addListener((message) => {

  // Change the text in the #time element with the updated time coming from the background script
  document.querySelector("#time").textContent = message.time;

  // Check if the timer is complete, and disable start and pause (temporary)
  if (message.status === "complete") {
    document.querySelector("#time").textContent = "complete"
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
  console.log("current cycle:", message.cycle, "status:", message.status);
  while (i <= message.totalCycles) {
    if (i === message.cycle) {
      if (message.status === "initial") {
        html += '<span id="cycle-' + i + '" class="dot pending"></span>';
      }
      else {
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