let port = chrome.runtime.connect({ name: "port-from-popup" });
let interval = null;

document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection })
});

port.onMessage.addListener((message) => document.querySelector("#time").textContent = message);

window.addEventListener("DOMContentLoaded", (event) => {

  let target = null;
  let remaining = null;
  let seconds = null;

  // 1. Request time from storage
  chrome.storage.local.get(["endTime"], (result) => {
    target = result.endTime;
    console.log("target time:", target);

    // 2. Calculate time left (every second)
    // This assumes setInterval() will be cleared once the popup is closed
    // Consider moving the interval to the background script AND just running when there is a live connection
    interval = setInterval(() => {
      remaining = target - Date.now();
      seconds = remaining / 1000;

      if (seconds < 0) {
        seconds = 0;
        clearInterval(interval);
        // alert("hey!"); // for debugging
      }

      // 3. Update the time left in #time
      document.querySelector("#time").textContent = seconds;

    }, 1000);
  });
});






// chrome.storage.sync.set({ startTime: Date.now()}, () => console.log("Current time saved."));

// window.addEventListener("load", () => {
//     // Get time saved in storage, and subtract from current time
//     chrome.storage.sync.get(["startTime"], (result) => {
//         let startTime = result.startTime;
//         let currentTime = Date.now();
//         console.log("start: ", startTime, "current: ", currentTime);
//         console.log("difference: ", startTime - currentTime);

//         document.querySelector("#time").textContent = startTime - currentTime;
//     });
// });