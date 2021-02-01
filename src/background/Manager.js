'use strict';

import { Timer } from './Timer.js';
import { Adjuster } from './Adjuster.js';
import { Utilities } from './Utilities.js';

const defaultSettings = {
  updates: true,
  theme: 'light',
  notificationsEnabled: true,
  notificationsSound: true,
  autoStartCycles: true,
  autoStartBreaks: true,
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
};

const operations = {
  queue: [],

  waitInternal: false,
  waitListener: function (value) {},

  set wait(value) {
    this.waitInternal = value;
    this.waitListener(value);
  },
  get wait() {
    return this.waitInternal;
  },

  registerListener: function (listener) {
    this.waitListener = listener;
  },

  add: function (operation) {
    if (this.waitInternal) this.queue.push(operation);
    else operation();
  },

  onValueChange: function () {
    if (!this.wait) {
      // Run all pending operations
      this.queue.forEach((operation) => operation());

      // Clear all operations
      this.queue = [];
    }
  },
};

const timer = new Timer();

class Manager {
  constructor() {
    this.comms = { port: null, open: false };
    this.listeners = { idle: null };
    this.operations = operations;
    this.timer = timer;
  }

  async init(settings) {
    this.registerListeners();

    // Delay to prevent conflict with install and update events
    await new Promise((resolve) => setTimeout(() => resolve(), 200));

    if (settings) {
      // Check if settings were passed to init (testing purposes)
      this.timer.init(settings);
    } else {
      // Get user settings insterad and initialize timer
      const stored = await Utilities.getStoredSettings();
      this.timer.init(stored);
    }
  }

  registerListeners() {
    chrome.runtime.onInstalled.addListener(this.onInstall.bind(this));
    chrome.runtime.onConnect.addListener(this.onConnect.bind(this));
    chrome.storage.onChanged.addListener(this.onStorageChange.bind(this));
    chrome.idle.onStateChanged.addListener(
      (this.listeners.idle = this.onStateChange.bind(this))
    );
    this.operations.registerListener(
      this.operations.onValueChange.bind(this.operations)
    );
  }

  onInstall(details) {
    switch (details.reason) {
      case 'install':
        // Initialize storage
        chrome.storage.local.set(defaultSettings);
        break;
      case 'update':
        // Make any necessary storage upgrades
        chrome.storage.local.get(null, (stored) => {
          let upgrades = {};

          // Check if there are any default settings that do not exist
          const settings = Object.keys(defaultSettings);
          settings.forEach((setting) => {
            if (typeof stored[setting] === 'undefined') {
              upgrades[setting] = defaultSettings[setting];
            }
          });

          // Set the 'updates' flag to true
          upgrades.updates = true;

          // Save to storage
          chrome.storage.local.set(upgrades);
        });
        break;
    }
  }

  onConnect(portFromPopUp) {
    let port = portFromPopUp;
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
    port.onMessage.addListener(this.onMessage.bind(this));

    this.comms.port = port;
    this.comms.open = true;
    this.timer.updateComms(this.comms.port, this.comms.open);
  }

  onDisconnect() {
    this.comms.open = false;
    this.timer.updateComms(this.comms.port, this.comms.open);
  }

  onMessage(message) {
    // User input cases
    switch (message.command) {
      case 'start':
        this.operations.add(() => this.timer.start());
        break;
      case 'pause':
        this.operations.add(() => this.timer.pause());
        break;
      case 'skip':
        this.operations.add(() => this.timer.skip());
        break;
      case 'reset-cycle':
        this.operations.add(() => this.timer.reset());
        break;
      case 'reset-all':
        this.operations.add(() => this.timer.resetAll());
        break;
      case 'preload':
        this.timer.postState();
        break;
    }
  }

  onStorageChange(changes) {
    for (let key in changes) {
      let storageChange = changes[key];
      const oldValue = storageChange.oldValue;
      const newValue = storageChange.newValue;

      if (oldValue === undefined || newValue === undefined) return;

      // Update settings relevant to timer functionality
      let change;
      switch (key) {
        case 'autoStartCycles':
          change = { cycles: storageChange.newValue };
          this.operations.add(() => this.timer.updateAutoStart(change));
          break;
        case 'autoStartBreaks':
          change = { breaks: storageChange.newValue };
          this.operations.add(() => this.timer.updateAutoStart(change));
          break;
        case 'cycleMinutes':
          change = { cycleTime: storageChange.newValue * 60000 };
          this.operations.add(() => this.timer.updateTime(change));
          break;
        case 'breakMinutes':
          change = { breakTime: storageChange.newValue * 60000 };
          this.operations.add(() => this.timer.updateTime(change));
          break;
        case 'totalCycles':
          change = storageChange.newValue * 2 - 1;
          this.operations.add(() => this.timer.updateTotalPeriods(change));
          break;
      }
    }
  }

  async onStateChange() {
    // Queue user operations and remove the listener
    this.operations.wait = true;
    chrome.idle.onStateChanged.removeListener(this.listeners.idle);

    // Adjust the timer
    const status = this.timer.periods.current.status;
    if (status === 'running') await Adjuster.adjust(this.timer, Date.now());

    // Safe to:
    // - Add the listener
    // - Resume running operations directly
    this.listeners.idle = this.onStateChange.bind(this);
    chrome.idle.onStateChanged.addListener(this.listeners.idle);
    this.operations.wait = false;
  }
}

export { Manager };
