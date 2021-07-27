import Mediator from './Mediator';
import Bridge from './Bridge';
import Timeline from './Timeline';
import { DEFAULT_SETTINGS } from '../shared-constants';
import { ExtensionSettings } from '../shared-types';

main();

async function main() {
  const settings = await initSettings();

  const mediator = new Mediator();
  const bridge = new Bridge(mediator);
  const timeline = new Timeline(mediator, settings);

  // Register browser-related listeners for install and storage
  registerInstallListeners();

  // Register browser-related listeners for bridge
  bridge.registerPortListeners();

  // Output state to UI
  bridge.mediator.subscribe('MessageRequest', bridge.handleBridgeOutput);

  // Handle input from UI
  timeline.mediator.subscribe('Start', timeline.handleStart);
  timeline.mediator.subscribe('Pause', timeline.handlePause);
  timeline.mediator.subscribe('Skip', timeline.handleSkip);
  timeline.mediator.subscribe('ResetCycle', timeline.handleResetCycle);
  timeline.mediator.subscribe('ResetAll', timeline.handleResetAll);
  timeline.mediator.subscribe('Preload', timeline.handlePreload);

  // Listen to period updates for new state publications
  timeline.mediator.subscribe('PeriodTick', timeline.handlePeriodUpdate);

  // Listen to period end
  timeline.mediator.subscribe('PeriodEnd', timeline.handlePeriodEnd);
}

function registerInstallListeners() {
  // Register install and update listeners
  chrome.runtime.onInstalled.addListener((details: { reason: string }) => {
    switch (details.reason) {
      case 'install':
        chrome.storage.local.set({ showWelcome: true });
        chrome.storage.local.set({ showUpdates: false });
        break;
      case 'update':
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
        if (typeof stored[setting] === 'undefined') {
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
