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
  
  // Get status from local storage and enable either pause or start
  chrome.storage.local.get(["status"], (result) => {
    let status = result.status;
    if (status === "running") {
      switchButtons("#start", "#pause")
    } else if (status === "paused") {
      switchButtons("#pause", "#start")
    }
  });
});

// Change the text in the #time element with the updated time coming from the background script
port.onMessage.addListener( (message) => document.querySelector("#time").textContent = message );

function switchButtons(hide, show) {
  let elt = document.querySelector(hide);
  elt.classList.add("hidden");

  elt = document.querySelector(show);
  elt.classList.remove("hidden");
}