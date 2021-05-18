"use strict";

function registerListeners() {
  chrome.runtime.onInstalled.addListener(onInstall);
  chrome.runtime.onConnect.addListener(onConnect);
  // chrome.storage.onChanged.addListener(onStorageChange);
  // chrome.idle.onStateChanged.addListener(
  //   (this.listeners.idle = this.onStateChange.bind(this))
  // );
  // this.operations.registerListener(
  //   this.operations.onValueChange.bind(this.operations)
  // );
}

function onInstall() {}

function onConnect(port: chrome.runtime.Port) {
  port.onDisconnect.addListener(onDisconnect);
  port.onMessage.addListener(onMessage);

  // manager.comms = { port, open: true };

  // this.comms.port = port;
  // this.comms.open = true;
  // this.timer.updateComms(this.comms.port, this.comms.open);
}

function onDisconnect() {
  // Remove disconnect listener?
  // manager.comms.open = false;
}

function onMessage(message: string) {
  console.log(`message: ${message}`);
}

export { registerListeners };
