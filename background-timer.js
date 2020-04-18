let port = null;

chrome.runtime.onConnect.addListener((portFromPopUp) => {
  port = portFromPopUp;
  port.onMessage.addListener(handleInput);
});

function handleInput(message) {
  if (message.command === "start") {
    port.postMessage(Date.now());
  }
}