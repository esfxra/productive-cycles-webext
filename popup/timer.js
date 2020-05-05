"use strict";

// timer.js globals
var port = chrome.runtime.connect({ name: "port-from-popup" });
var statusChanged = false;
var previousStatus = null;
var resetRequested = false;
var backgroundCommands = [
  "start",
  "pause",
  "reset-cycle",
  "reset-all",
  "preload",
];

// Handle inputs
document.addEventListener("click", (e) => {
  let selection = e.target.id;
  for (let command of backgroundCommands) {
    if (selection === command) {
      port.postMessage({ command: selection });
    } else {
      // For testing purposes
      console.log(`command - ${selection} - not posted to background script`);
    }
  }

  // Input actions... including switching buttons immediately
  let ui = null;
  switch (selection) {
    case "start":
      switchButtons("#start", "#pause");
      break;
    case "pause":
      switchButtons("#pause", "#start");
      break;
    case "reset-cycle":
    case "reset-all":
      switchButtons("#pause", "#start");
      resetRequested = true;
      break;
    case "options":
      restoreOptions();
      // hide .timer-ui
      ui = document.querySelector(".timer-ui");
      ui.classList.add("hidden");
      // show .options-ui
      ui = document.querySelector(".options-ui");
      ui.classList.remove("hidden");
      break;
    case "back":
      // hide .options-ui
      ui = document.querySelector(".options-ui");
      ui.classList.add("hidden");
      // show .timer-ui
      ui = document.querySelector(".timer-ui");
      ui.classList.remove("hidden");
      break;
    case "save":
      saveOptions();
      resetRequested = true;
      break;
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
  } else {
    statusChanged = false;
  }

  // Change the text in the #time element with the updated time coming from the background script
  document.querySelector("#time").textContent = message.time;

  // Change UI based on message.status
  let elt = null;
  switch (message.status) {
    case "initial":
      switchButtons("#pause", "#start");
      document.querySelector(".control").style.justifyContent = "space-between";
      break;
    case "running":
      switchButtons("#start", "#pause");
      break;
    case "paused":
      switchButtons("#pause", "#start");
      break;
    case "complete":
      // change time text to "complete"
      document.querySelector("#time").textContent = "complete";

      // hide "pause"
      elt = document.querySelector("#pause");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }

      // hide "start"
      elt = document.querySelector("#start");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }

      document.querySelector(".control").style.justifyContent = "space-around";

      break;
    case "break":
      elt = document.querySelector("#time");
      elt.textContent = "on break";
      if (!elt.classList.contains("break")) {
        elt.classList.add("break");
      }

      // hide "pause"
      elt = document.querySelector("#pause");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }
      // hide "start"
      elt = document.querySelector("#start");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }
      // hide "reset-cycle"
      elt = document.querySelector("#reset-cycle");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }
      // hide "reset-all"
      elt = document.querySelector("#reset-all");
      if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
      }
      // show "skip"
      elt = document.querySelector("#skip");
      if (elt.classList.contains("hidden")) {
        elt.classList.remove("hidden");
      }

      document.querySelector(".control").style.justifyContent = "center";

      break;
  }

  // Tracker
  // Compute the number of cycles to display, which one is running, and which are complete
  if (statusChanged || resetRequested) {
    console.log("Rebuilding the tracker ...");
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
      cyclesNode.style.gridTemplateColumns =
        "repeat(" + message.totalCycles + ", auto)";
    } else {
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
        } else if (
          message.status === "running" ||
          message.status === "paused"
        ) {
          dotNode.classList.add("running");
          // html += '<span id="cycle-' + i + '" class="dot running"></span>';
        }
      } else if (i < message.cycle) {
        dotNode.classList.add("complete");
        // html += '<span id="cycle-' + i + '" class="dot complete"></span>';
      } else {
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
  var breakTime = parseInt(document.querySelector("#break").value);
  var cycleNumber = parseInt(document.querySelector("#cycles").value);
  var autoStartBox = document.querySelector("#auto-start").checked;
  chrome.storage.local.set(
    {
      minutes: time,
      break: breakTime,
      totalCycles: cycleNumber,
      autoStart: autoStartBox,
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.querySelector("#status");
      status.textContent = "saved 🎉";
      setTimeout(function () {
        status.textContent = "";
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
      document.querySelector("#minutes").value = items.minutes;
      document.querySelector("#break").value = items.break;
      document.querySelector("#cycles").value = items.totalCycles;
      document.querySelector("#auto-start").checked = items.autoStart;
    }
  );
}
