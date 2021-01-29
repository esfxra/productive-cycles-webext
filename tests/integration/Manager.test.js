'use strict';

import { Manager } from '../../src/background/Manager.js';
import { chrome } from 'jest-chrome';

const settings = {
  autoStart: {
    cycles: true,
    breaks: true,
  },
  cycleTime: 25 * 60000,
  breakTime: 5 * 60000,
  totalPeriods: 7,
};

describe('Manager', () => {
  let manager;
  beforeEach(async () => {
    jest.useFakeTimers();

    chrome.runtime.onInstalled.clearListeners();
    chrome.runtime.onConnect.clearListeners();
    chrome.storage.onChanged.clearListeners();
    chrome.idle.onStateChanged.clearListeners();

    manager = new Manager();
    manager.init(settings);
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  });

  describe('General', () => {
    test('Listeners are registered on initialization', () => {
      expect(chrome.runtime.onInstalled.hasListeners()).toBe(true);
      expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
      expect(chrome.storage.onChanged.hasListeners()).toBe(true);
      expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
    });
  });

  describe.skip('Communications', () => {});

  describe.skip('Storage', () => {});

  describe('Idle and Adjustments', () => {
    describe('When the timer is not running', () => {
      test('State change listener stays registered', async () => {
        jest.advanceTimersByTime(5000);

        manager.onStateChange('idle');
        jest.runOnlyPendingTimers();
        await Promise.resolve();

        expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
      });
    });

    describe('When the timer is running', () => {
      beforeEach(() => {
        // Simulate 'start' command, and run for 5 seconds
        const message = { command: 'start' };
        chrome.runtime.onMessage.addListener(manager.onMessage.bind(manager));
        chrome.runtime.onMessage.callListeners(message);
        jest.advanceTimersByTime(5000);
      });

      test('State change listener is unregistered before adjusting', async () => {
        expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);

        manager.onStateChange('idle');

        expect(chrome.idle.onStateChanged.hasListeners()).toBe(false);

        jest.runOnlyPendingTimers();
        await Promise.resolve();
      });

      test('State change listener is registered after adjusting', async () => {
        manager.onStateChange('idle');

        expect(chrome.idle.onStateChanged.hasListeners()).toBe(false);

        jest.runOnlyPendingTimers();
        await Promise.resolve();

        expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
      });

      test.only('Wait flag to stop operations is set accordingly before and after adjustment', async () => {
        manager.onStateChange('idle');

        expect(manager.operations.wait).toBe(true);

        jest.runOnlyPendingTimers();
        await Promise.resolve();

        expect(manager.operations.wait).toBe(false);
      });
    });
  });
});
