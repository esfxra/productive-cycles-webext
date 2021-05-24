import { Bridge } from "./Bridge";
import { Manager } from "./Manager";
import { Timer } from "./Timer";
import { DEFAULT_SETTINGS } from "./utils/constants";
import { ExtensionSettings } from "./utils/types";

runBackground();

async function runBackground() {
  const settings = await initSettings();

  const bridge = new Bridge();
  const manager = new Manager(settings);
  const timer = new Timer();

  // Register browser-related listeners
  registerInstallListeners();
  bridge.registerPortListeners();

  // Register publisher subscriptions
  bridge.registerSubscriptions();
  manager.registerSubscriptions();
  timer.registerSubscriptions();
}

function registerInstallListeners() {
  // Register install and update listeners
  chrome.runtime.onInstalled.addListener((details: { reason: string }) => {
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
  });
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
