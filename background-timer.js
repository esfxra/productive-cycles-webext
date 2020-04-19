let port = null;
let defaultTime = 1 * 60000;
let timerRunning = false;

chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  port.onMessage.addListener(handleInput);
});

function handleInput(message) {
  if (message.command === "start") {
    // port.postMessage(Date.now());

    // Start the counter
    // 1. Get current time
    let time = Date.now();
    let target = time + defaultTime;

    // 2. Save the time in the browser's local storage
    chrome.storage.local.set({endTime: target}, function() {
      console.log("Stored endTime:", target);
      // console.log('Remaining:', target - time);
    });

    // 3. Set an alarm to notify the user in "defaultTime"
    // chrome.alarms.create("cycleAlarm", {when: target});

    // 4. Set a flag that the timer has started
    timerRunning = true;
  }
  else if (message.command === "unload") {
    console.log("unloaded")
  }
}

// chrome.alarms.onAlarm.addListener( () => alert("hey! 1 minute passed"));

// chrome.storage.local.get(['key'], function(result) {
//   console.log('Value currently is ' + result.key);
// });