'use strict';

import { Timer } from './Timer.js';
import { Adjuster } from './Adjuster.js';
import { Utilities } from './Utilities.js';

const defaultSettings = {
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
    this.update = false;
    this.comms = { port: null, open: false };
    this.listeners = { idle: null };
    this.operations = operations;
  }

  async init(settings) {
    this.registerListeners();

    // Delay to prevent conflict with install and update events
    await new Promise((resolve) => setTimeout(() => resolve(), 200));

    if (settings) {
      // Check if settings were passed to init (testing purposes)
      timer.init(settings);
    } else {
      // Get user settings insterad and initialize timer
      const stored = await Utilities.getStoredSettings();
      timer.init(stored);
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
        // Set update flag to true
        this.update = true;
        // Initialize storage
        chrome.storage.local.set(defaultSettings);
        break;
      case 'update':
        // Set update flag to true
        this.update = true;
        // Upgrade storage
        chrome.storage.local.clear();
        chrome.storage.local.set(defaultSettings);
        break;
    }
  }

  onConnect(portFromPopUp) {
    let port = portFromPopUp;
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
    port.onMessage.addListener(this.onMessage.bind(this));

    this.comms.port = port;
    this.comms.open = true;
    timer.updateComms(this.comms.port, this.comms.open);
  }

  onDisconnect() {
    this.comms.open = false;
    timer.updateComms(this.comms.port, this.comms.open);
  }

  onMessage(message) {
    if (message.command === 'preload' && this.update === true) {
      // Update view operations
      // Disable flag until next update
      this.update = false;

      // Ask popup to navigate to update view
      let message = timer.formatState();
      message.update = true;
      this.comms.port.postMessage(message);
    } else {
      // User input cases
      switch (message.command) {
        case 'start':
          this.operations.add(() => timer.start());
          break;
        case 'pause':
          this.operations.add(() => timer.pause());
          break;
        case 'skip':
          this.operations.add(() => timer.skip());
          break;
        case 'reset-cycle':
          this.operations.add(() => timer.reset());
          break;
        case 'reset-all':
          this.operations.add(() => timer.resetAll());
          break;
        case 'preload':
          timer.postState();
          break;
      }
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
          this.operations.add(() => timer.updateAutoStart(change));
          break;
        case 'autoStartBreaks':
          change = { breaks: storageChange.newValue };
          this.operations.add(() => timer.updateAutoStart(change));
          break;
        case 'cycleMinutes':
          change = { cycleTime: storageChange.newValue * 60000 };
          this.operations.add(() => timer.updateTime(change));
          break;
        case 'breakMinutes':
          change = { breakTime: storageChange.newValue * 60000 };
          this.operations.add(() => timer.updateTime(change));
          break;
        case 'totalCycles':
          change = storageChange.newValue * 2 - 1;
          this.operations.add(() => timer.updateTotalPeriods(change));
          break;
      }
    }
  }

  async onStateChange() {
    this.operations.wait = true;

    const status = timer.periods.current.status;

    if (status === 'running') {
      chrome.idle.onStateChanged.removeListener(this.listeners.idle);

      await Adjuster.adjust(timer, Date.now());

      chrome.idle.onStateChanged.addListener(
        (this.listeners.idle = this.onStateChange.bind(this))
      );
    }

    this.operations.wait = false;
  }
}

export { Manager };
