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

const queue = {
  operations: [],

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
    if (this.waitInternal) this.operations.push(operation);
    else operation();
  },

  onValueChange: function () {
    console.log(`Manager - Input operations should be queued: ${this.wait}`);

    if (!this.wait) {
      // Run all pending operations
      this.operations.forEach((operation) => operation());

      // Clear all operations
      this.operations = [];
    }
  },
};

const timer = new Timer();

class Manager {
  constructor() {
    this.update = false;
    this.comms = { port: null, open: false };
    this.listeners = { idle: null };
  }

  async init() {
    this.registerListeners();

    // Delay to prevent conflict with install and update events
    await new Promise((resolve) => setTimeout(() => resolve(), 200));

    // Get user settings and initialize timer
    const settings = await Utilities.getStoredSettings();
    timer.init(settings);
  }

  registerListeners() {
    chrome.runtime.onInstalled.addListener(this.onInstall.bind(this));
    chrome.runtime.onConnect.addListener(this.onConnect.bind(this));
    chrome.storage.onChanged.addListener(this.onStorageChange.bind(this));
    chrome.idle.onStateChanged.addListener(
      (this.listeners.idle = this.onStateChange.bind(this))
    );
    queue.registerListener(queue.onValueChange.bind(queue));
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
    console.log(message);
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
          queue.add(() => timer.start());
          break;
        case 'pause':
          queue.add(() => timer.pause());
          break;
        case 'skip':
          queue.add(() => timer.skip());
          break;
        case 'reset-cycle':
          queue.add(() => timer.reset());
          break;
        case 'reset-all':
          queue.add(() => timer.resetAll());
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
      switch (key) {
        case 'autoStartCycles':
          timer.updateAutoStart({ cycles: storageChange.newValue });
          break;
        case 'autoStartBreaks':
          timer.updateAutoStart({ breaks: storageChange.newValue });
          break;
        case 'cycleMinutes':
          timer.updateTime({ cycleTime: storageChange.newValue * 60000 });
          break;
        case 'breakMinutes':
          timer.updateTime({ breakTime: storageChange.newValue * 60000 });
          break;
        case 'totalCycles':
          timer.updateTotalPeriods(storageChange.newValue * 2 - 1);
          break;
      }
    }
  }

  async onStateChange(state) {
    queue.wait = true;

    console.log(`Manager - State is ${state}`);

    const status = timer.periods.current.status;

    if (status === 'running') {
      chrome.idle.onStateChanged.removeListener(this.listeners.idle);

      await Adjuster.adjust(timer, Date.now());
      console.log('Manager - Timer adjusted');

      chrome.idle.onStateChanged.addListener(
        (this.listeners.idle = this.onStateChange.bind(this))
      );
    }

    queue.wait = false;
  }
}

export { Manager };
