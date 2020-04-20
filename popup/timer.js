"use strict";

// timer.js globals
let port = chrome.runtime.connect({ name: "port-from-popup" });
let status = null;

// Handle inputs
document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection });

  if (selection === "start") {
    let elt = document.querySelector("#start");
    elt.classList.add("hidden");

    elt = document.querySelector("#pause");
    elt.classList.remove("hidden");
  }
  else if (selection === "pause") {
    let elt = document.querySelector("#pause");
    elt.classList.add("hidden");

    elt = document.querySelector("#start");
    elt.classList.remove("hidden");
  }
});

// Register the UI has been loaded and let the background script know
window.addEventListener("DOMContentLoaded", (event) => {
  console.log(event);
  port.postMessage({ command: "preload" });
});

// Change the text in the #time element with the updated time coming from the background script
port.onMessage.addListener( (message) => document.querySelector("#time").textContent = message );