"use strict";

import { Manager } from "../../src/background/Manager.js";
import { chrome } from "jest-chrome";

const settings = {
  autoStart: {
    cycles: true,
    breaks: true,
  },
  cycleTime: 25 * 60000,
  breakTime: 5 * 60000,
  totalPeriods: 7,
};

describe("Manager", () => {
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

  describe("Init", () => {
    test("A single listener for each event is registered on initialization", () => {
      expect(chrome.runtime.onInstalled.hasListeners()).toBe(true);
      expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
      expect(chrome.storage.onChanged.hasListeners()).toBe(true);
      expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);

      expect(manager.listeners.idle).not.toBe(null);
    });
  });

  describe("Manager / Timer integration", () => {
    describe("Correct function calls", () => {
      test.each([
        ["start", "start"],
        ["pause", "pause"],
        ["reset-cycle", "reset"],
        ["reset-all", "resetAll"],
        ["skip", "skip"],
      ])(
        'Command "%s" calls the appropriate timer function once',
        (command, expected) => {
          chrome.runtime.onMessage.clearListeners();
          chrome.runtime.onMessage.addListener(manager.onMessage.bind(manager));

          if (command === "skip") manager.timer.periods.index = 1;

          const spy = jest.spyOn(manager.timer, expected);

          const message = { command: command };
          chrome.runtime.onMessage.callListeners(message);

          expect(spy).toHaveBeenCalledTimes(1);
        }
      );

      test.each([
        ["autoStartCycles", "updateAutoStart"],
        ["autoStartBreaks", "updateAutoStart"],
        ["cycleMinutes", "updateTime"],
        ["breakMinutes", "updateTime"],
        ["totalCycles", "updateTotalPeriods"],
      ])(
        'Update to "%s" calls the appropriate timer function once',
        (change, expected) => {
          const spy = jest.spyOn(manager.timer, expected);

          let changes = {};
          if (change === "autoStartCycles" || change === "autoStartBreaks") {
            changes[change] = { oldValue: false, newValue: true };
          } else {
            changes[change] = { oldValue: 10, newValue: 5 };
          }

          chrome.storage.onChanged.callListeners(changes);

          expect(spy).toHaveBeenCalledTimes(1);
        }
      );
    });

    describe("Adjustments and queues", () => {
      describe("When the timer is not running", () => {
        test("State change listener stays registered", async () => {
          jest.advanceTimersByTime(5000);

          manager.onStateChange("idle");
          jest.runOnlyPendingTimers();
          await Promise.resolve();

          expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
        });
      });

      describe("When the timer is running", () => {
        beforeEach(() => {
          chrome.runtime.onMessage.clearListeners();

          // Simulate 'start' command, and run for 5 seconds
          const message = { command: "start" };
          chrome.runtime.onMessage.addListener(manager.onMessage.bind(manager));
          chrome.runtime.onMessage.callListeners(message);
          jest.advanceTimersByTime(5000);
        });

        test("State change listener is unregistered before adjusting", async () => {
          expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);

          chrome.idle.onStateChanged.callListeners("idle");

          expect(chrome.idle.onStateChanged.hasListeners()).toBe(false);

          jest.runOnlyPendingTimers();
          await Promise.resolve();
        });

        test("State change listener is registered after adjusting", async () => {
          chrome.idle.onStateChanged.callListeners("idle");

          expect(chrome.idle.onStateChanged.hasListeners()).toBe(false);

          jest.runOnlyPendingTimers();
          await Promise.resolve();

          expect(chrome.idle.onStateChanged.hasListeners()).toBe(true);
        });

        describe("Queued operations", () => {
          const testQueue = async () => {
            // Confirm there is an operation queued
            expect(manager.operations.wait).toBe(true);
            expect(manager.operations.queue.length).toBe(1);

            // Mock and spy
            manager.operations.queue[0] = jest.fn();
            const spy = manager.operations.queue[0];
            expect(spy).toHaveBeenCalledTimes(0);

            // Resolve Adjuster.adjust() promise
            jest.runOnlyPendingTimers();
            await Promise.resolve();

            // Confirm that the queue is empty and that the operation has run
            expect(manager.operations.wait).toBe(false);
            expect(manager.operations.queue.length).toBe(0);
            expect(spy).toHaveBeenCalledTimes(1);
          };

          beforeEach(() => {
            chrome.idle.onStateChanged.callListeners("idle");
          });

          test.each(["pause", "reset-cycle", "reset-all", "skip"])(
            'Command "%s" is queued until after the adjustment',
            (command) => {
              // Simulate command
              const message = { command: command };
              chrome.runtime.onMessage.callListeners(message);
              // Run tests
              testQueue();
            }
          );

          test.each([
            "autoStartCycles",
            "autoStartBreaks",
            "cycleMinutes",
            "breakMinutes",
            "totalCycles",
          ])('Update "%s" is queued until after the adjustment', (change) => {
            // Simulate storage change
            let changes = {};
            if (change === "autoStartCycles" || change === "autoStartBreaks") {
              changes[change] = { oldValue: false, newValue: true }; // Arbitrary boolean
            } else {
              changes[change] = { oldValue: 10, newValue: 5 }; // Arbitrary number
            }

            chrome.storage.onChanged.callListeners(changes);
            // Run tests
            testQueue();
          });
        });
      });
    });
  });
});
