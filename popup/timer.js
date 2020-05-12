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
  "skip",
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
      hideElement("#start");
      showElement("#pause");
      break;
    case "pause":
      hideElement("#pause");
      showElement("#start");
      break;
    case "skip":
      break;
    case "reset-cycle":
    case "reset-all":
      hideElement("#pause");
      showElement("#start");
      resetRequested = true;
      break;
    case "options":
      restoreOptions();
      hideElement(".timer-ui");
      showElement(".options-ui");
      break;
    case "back":
      hideElement(".options-ui");
      showElement(".timer-ui");
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
  if (statusChanged || resetRequested) {
    let elt = null;
    switch (message.status) {
      case "initial":
        elt = document.querySelector(".time-container");
        if (elt.classList.contains("break")) {
          elt.classList.remove("break");
        }
        // Adjust .control spacing
        document.querySelector(".control").style.justifyContent =
          "space-between";
        hideElement("#skip");
        // hideElement("#break-text");
        hideElement("#pause");
        showElement("#start");
        showElement("#reset-cycle");
        showElement("#reset-all");
        break;
      case "running":
        elt = document.querySelector(".time-container");
        if (elt.classList.contains("break")) {
          elt.classList.remove("break");
        }
        // Adjust .control spacing
        document.querySelector(".control").style.justifyContent =
          "space-between";
        hideElement("#skip");
        // hideElement("#break-text");
        hideElement("#start");
        showElement("#pause");
        showElement("#reset-cycle");
        showElement("#reset-all");
        break;
      case "paused":
        hideElement("#pause");
        showElement("#start");
        break;
      case "complete":
        // change time text to "complete"
        document.querySelector("#time").textContent = "complete";
        document.querySelector(".control").style.justifyContent =
          "space-around";
        hideElement("#pause");
        hideElement("#start");
        break;
      case "break":
        elt = document.querySelector(".time-container");
        if (!elt.classList.contains("break")) {
          elt.classList.add("break");
        }
        document.querySelector(".control").style.justifyContent = "center";
        hideElement("#pause");
        hideElement("#start");
        hideElement("#reset-cycle");
        hideElement("#reset-all");
        // showElement("#break-text");
        showElement("#skip");

        break;
    }

    // Tracker
    // Compute the number of cycles to display, which one is running, and which are complete
    console.log("Rebuilding the tracker ...");
    console.log(`previousStatus: ${previousStatus}`);
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
        if (message.status === "initial" || message.status === "break") {
          dotNode.classList.add("pending");
          // html += '<span id="cycle-' + i + '" class="dot pending"></span>';
        } else if (
          message.status === "running" ||
          message.status === "paused"
        ) {
          dotNode.classList.add("running");
          // html += '<span id="cycle-' + i + '" class="dot running"></span>';
        } else if (message.status === "complete") {
          dotNode.classList.add("complete");
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

function hideElement(element) {
  console.debug("Hiding element");
  let elt = document.querySelector(element);
  if (!elt.classList.contains("hidden")) {
    elt.classList.add("hidden");
  }
}

function showElement(element) {
  console.debug("Showing element");
  let elt = document.querySelector(element);
  if (elt.classList.contains("hidden")) {
    elt.classList.remove("hidden");
  }
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
