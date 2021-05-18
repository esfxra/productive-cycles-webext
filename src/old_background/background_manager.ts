"use strict";

import { Timer } from "./Timer";

// import { Timer } from "./Timer";
// import { Adjuster } from "./Adjuster.js";
// import { Utilities } from "./Utilities.js";

// const defaultSettings = {
//   updates: true,
//   theme: "light",
//   notificationsEnabled: true,
//   notificationsSound: true,
//   autoStartCycles: true,
//   autoStartBreaks: true,
//   cycleMinutes: 25,
//   breakMinutes: 5,
//   totalCycles: 4,
//   badgeTimer: true,
// };

// let timer: Timer | null;

interface manager {
  comms: {
    port: chrome.runtime.Port;
    open: boolean;
  };
}

const manager: manager = {
  comms: { port: undefined, open: false },
};

const timer = new Timer();

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

  manager.comms = { port, open: true };

  // this.comms.port = port;
  // this.comms.open = true;
  // this.timer.updateComms(this.comms.port, this.comms.open);
}

function onDisconnect() {
  // Remove disconnect listener?
  manager.comms.open = false;
}

function onMessage(message: string) {}

export { registerListeners };
