let port = chrome.runtime.connect({ name: "port-from-popup" });

document.addEventListener("click", (e) => {
  let selection = e.target.id;
  port.postMessage({ command: selection })
});

port.onMessage.addListener((message) => document.querySelector("#time").textContent = message);






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