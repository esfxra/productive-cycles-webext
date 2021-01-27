'use strict';

import { Manager } from '../../src/background/Manager.js';
import { chrome } from 'jest-chrome';

describe('Manager', () => {
  describe('Init', () => {
    test('Listeners are registered', () => {
      const manager = new Manager();
      manager.registerListeners();

      expect(chrome.runtime.onInstalled.hasListeners()).toBe(true);
      expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
      expect(chrome.storage.onChanged.hasListeners()).toBe(true);
      expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
    });
  });
});
