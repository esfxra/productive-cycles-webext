import PubSub from "pubsub-js";
import { Manager } from "./Manager";
import { ExtensionSettings, Comms } from "./types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  showWelcome: false,
  showUpdates: false,
  showBadge: true,
  notificationsEnabled: true,
  notificationsSound: true,
  cycleAutoStart: true,
  breakAutoStart: true,
  cycleMinutes: 25,
  breakMinutes: 5,
  totalPeriods: 7,
};

const TOPIC_COMMS = "PORT OPEN";
const TOPIC_INPUT = "UI INPUT";

runBackground();

async function runBackground() {
  // Register runtime and other browser event listeners
  registerListeners();

  // Get stored settings needed to set up functionality
  const settings = await initSettings();

  // TODO: Revise the order of these calls per pending logic at init()
  const manager = new Manager();
  manager.registerSubscribers(TOPIC_COMMS, TOPIC_INPUT);
  manager.init(settings);
}

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

function onInstall(details: { reason: string }) {
  switch (details.reason) {
    case "install":
      chrome.storage.local.set({ showWelcome: true });
      chrome.storage.local.set({ showUpdates: false });
      break;
    case "update":
      chrome.storage.local.set({ showWelcome: false });
      chrome.storage.local.set({ showUpdates: true });
      break;
  }
}

function onConnect(port: chrome.runtime.Port) {
  port.onDisconnect.addListener(onDisconnect);
  port.onMessage.addListener(onMessage);

  // Publish port and indicator for open connection
  const data: Comms = { port: port, open: true };
  PubSub.publish(TOPIC_COMMS, data);
}

function onDisconnect() {
  // Publish nulled port and indicator for closed connection
  const data: Comms = { port: null, open: false };
  PubSub.publish(TOPIC_COMMS, data);
}

function onMessage(message: { command: string }) {
  // Publish incoming command
  const data: string = message.command;
  PubSub.publish(TOPIC_INPUT, data);
}

function initSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (stored) => {
      // Check if all default setttings are defined in storage
      // const settings: ExtensionSettings = { ...DEFAULT_SETTINGS };
      const settings = {} as ExtensionSettings;
      const expected = Object.keys(DEFAULT_SETTINGS);

      expected.forEach((setting) => {
        if (typeof stored[setting] === "undefined") {
          // If undefined (i.e. new settings introduced in an update), use default settign
          settings[setting] = DEFAULT_SETTINGS[setting];
        } else {
          // If it does exist, use stored setting
          settings[setting] = stored[setting];
        }
      });

      // Save all settings again
      // - The re-save will maintain settings customized by the user per the conditions above
      chrome.storage.local.set(settings);

      // Resolve promise
      // TODO: Should reject if there is some sort of runtime error (future implementation)
      resolve(settings);
    });
  });
}
