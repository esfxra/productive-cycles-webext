"use strict";

// timer.js globals
var port = chrome.runtime.connect({ name: "port-from-popup" });
var statusChanged = false;
var previousStatus = null;
var resetRequested = false;

// Handle inputs
document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection });

  // Switch buttons based on input
  if (selection === "start") {
    switchButtons("#start", "#pause");
  }
  else if (selection === "pause") {
    switchButtons("#pause", "#start");
  }
  else if (selection === "reset-cycle" || selection === "reset-all") {
    switchButtons("#pause", "#start");
    resetRequested = true;
  }
  else if (selection === "options") {
    // if (chrome.runtime.openOptionsPage) {
    //   chrome.runtime.openOptionsPage();
    // } else {
    //   window.open(chrome.runtime.getURL('../options/options.html'));
    // }
    restoreOptions();

    let ui = document.querySelector(".timer-ui");
    ui.classList.add("hidden");

    ui = document.querySelector(".options-ui");
    ui.classList.remove("hidden");
  }
  // Options-related handlers
  else if (selection === "back") {
      let ui = document.querySelector(".options-ui");
      ui.classList.add("hidden");
  
      ui = document.querySelector(".timer-ui");
      ui.classList.remove("hidden");
  }
  else if (selection === "save") {
    saveOptions();
    resetRequested = true;
  }
});

// Register the UI has been loaded and let the background script know
window.addEventListener("DOMContentLoaded", (event) => {
  port.postMessage({ command: "preload" });
});

// Make UI changes based on Timer details messaged by the background script
port.onMessage.addListener((message) => {
  console.log(message);

  // Check if there is a change in status
  // Note: case "pause" does not send updated "paused" status to timer.js until after UI is opened again
  // That is when preload command runs again
  if (previousStatus !== message.status) { 
    statusChanged = true;
    previousStatus = message.status;
  }
  else { statusChanged = false; }

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
  if (statusChanged || resetRequested) {
    console.log("Rebuilding the tracker ...")
    console.log(previousStatus);
    let cyclesNode = document.querySelector(".cycles");

    // Reset cyclesNode
    let node = cyclesNode.lastElementChild;
    while (node) {
      cyclesNode.removeChild(node);
      node = cyclesNode.lastElementChild;
    }

    // Adjust CSS for < 4 cycles
    if (message.totalCycles < 4) {
      cyclesNode.style.gridTemplateColumns = "repeat(" + message.totalCycles + ", auto)";
    }
    else {
      cyclesNode.style.gridTemplateColumns = "repeat(4, auto)";
    }

    // Build cyclesNode
    let dotNode = null;
    let i = 1;
    while (i <= message.totalCycles) {
      dotNode = document.createElement("span");
      dotNode.id = "cycle-" + i;
      dotNode.setAttribute("title", "cycle " + i);
      dotNode.classList.add("dot");
      if (i === message.cycle) {
        if (message.status === "initial") {
          dotNode.classList.add("pending");
          // html += '<span id="cycle-' + i + '" class="dot pending"></span>';
        }
        else if (message.status === "running" || message.status === "paused") {
          dotNode.classList.add("running");
          // html += '<span id="cycle-' + i + '" class="dot running"></span>';
        }
      }
      else if (i < message.cycle) {
        dotNode.classList.add("complete");
        // html += '<span id="cycle-' + i + '" class="dot complete"></span>';
      }
      else {
        // This should affect all cycles that are past the current (i.e. i > message.cycle)
        dotNode.classList.add("pending");
        // html += '<span id="cycle-' + i + '" class="dot pending"></span>';
      }
      cyclesNode.appendChild(dotNode);
      i++;
    }
    // document.querySelector(".cycles").innerHTML = html;
    resetRequested = false;
  }
});

function switchButtons(hide, show) {
  let elt = document.querySelector(hide);
  elt.classList.add("hidden");

  elt = document.querySelector(show);
  elt.classList.remove("hidden");
}

function saveOptions() {
  var time = parseInt(document.querySelector("#minutes").value);
  var cycleNumber = parseInt(document.querySelector("#cycles").value);
  chrome.storage.local.set({
    minutes: time,
    totalCycles: cycleNumber
  }, function () {
    // Update status to let user know options were saved.
    var status = document.querySelector("#status");
    status.textContent = "saved 🎉";
    setTimeout(function () {
      status.textContent = "";
    }, 5000);
  });
}

function restoreOptions() {
  chrome.storage.local.get(["minutes", "totalCycles"], function (items) {
    document.querySelector("#minutes").value = items.minutes;
    document.querySelector("#cycles").value = items.totalCycles;
  });
}