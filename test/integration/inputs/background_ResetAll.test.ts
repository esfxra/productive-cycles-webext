import PubSub from 'pubsub-js';
import Bridge from '../../../src/background/Bridge';
import Timeline from '../../../src/background/Timeline';
import { DEFAULT_SETTINGS } from '../../../src/shared-constants';
import { Status } from '../../../src/shared-types';
import {
  runBackground,
  simulatePause,
  simulateResetAll,
  simulateStart,
} from '../test-utils';

let bridge: Bridge;
let timeline: Timeline;

describe('Reset all', () => {
  describe('When the period is in its initial state', () => {
    // Tests
    describe('First period', () => {
      beforeAll(() => {
        jest.useFakeTimers();
        [bridge, timeline] = runBackground(DEFAULT_SETTINGS);
        simulateResetAll(bridge);
      });

      afterAll(() => {
        PubSub.clearAllSubscriptions();
        jest.clearAllTimers();
      });

      test('The status remains as initial', () => {
        expect(timeline.current.status).toBe(Status.Initial);
      });
      test('The index does not change', () => {
        expect(timeline.current.id).toBe(0);
      });
    });
    describe('All other periods', () => {
      beforeAll(() => {
        jest.useFakeTimers();
        [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

        // Advance 2 periods (arbitrary number)
        timeline.current.end();
        timeline.current.end();

        simulateResetAll(bridge);
      });

      afterAll(() => {
        PubSub.clearAllSubscriptions();
        jest.clearAllTimers();
      });

      test('The status remains as initial', () => {
        expect(timeline.current.status).toBe(Status.Initial);
      });
      test('The index points to the first period', () => {
        expect(timeline.current.id).toBe(0);
      });
    });
  });

  describe('When the period is running', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

      // Advance 2 periods (arbitrary number)
      timeline.current.end();
      timeline.current.end();

      simulateStart(bridge);
      simulateResetAll(bridge);
    });

    afterAll(() => {
      PubSub.clearAllSubscriptions();
      jest.clearAllTimers();
    });

    test('The status is set to initial', () => {
      expect(timeline.current.status).toBe(Status.Initial);
    });

    test("The remaining time is set to the period's duration", () => {
      const cycleMillis = DEFAULT_SETTINGS.cycleMinutes * 60000;
      const breakMillis = DEFAULT_SETTINGS.breakMinutes * 60000;

      timeline.periods.forEach((period) => {
        expect(period.remaining).toBe(
          period.id % 2 === 0 ? cycleMillis : breakMillis
        );
      });
    });

    test('The index is set to the first period', () => {
      expect(timeline.current.id).toBe(0);
    });
  });

  describe('When the period is paused', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

      // Advance 2 periods (arbitrary number)
      timeline.current.end();
      timeline.current.end();

      simulateStart(bridge);
      jest.advanceTimersByTime(4000);
      simulatePause(bridge);
      simulateResetAll(bridge);
    });

    afterAll(() => {
      PubSub.clearAllSubscriptions();
      jest.clearAllTimers();
    });

    test('The status is set to initial', () => {
      expect(timeline.current.status).toBe(Status.Initial);
    });

    test("The remaining time is set to the period's duration", () => {
      const cycleMillis = DEFAULT_SETTINGS.cycleMinutes * 60000;
      const breakMillis = DEFAULT_SETTINGS.breakMinutes * 60000;

      timeline.periods.forEach((period) => {
        expect(period.remaining).toBe(
          period.id % 2 === 0 ? cycleMillis : breakMillis
        );
      });
    });

    test('The index is set to the first period', () => {
      expect(timeline.current.id).toBe(0);
    });
  });

  describe('When the period is a break', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

      // Advance 3 periods (arbitrary number)
      timeline.current.end();
      timeline.current.end();
      timeline.current.end();

      simulateStart(bridge);
      jest.advanceTimersByTime(4000);
      simulateResetAll(bridge);
    });

    afterAll(() => {
      PubSub.clearAllSubscriptions();
      jest.clearAllTimers();
    });

    test('The status is set to initial', () => {
      expect(timeline.current.status).toBe(Status.Initial);
    });

    test("The remaining time is set to the period's duration", () => {
      const cycleMillis = DEFAULT_SETTINGS.cycleMinutes * 60000;
      const breakMillis = DEFAULT_SETTINGS.breakMinutes * 60000;

      timeline.periods.forEach((period) => {
        expect(period.remaining).toBe(
          period.id % 2 === 0 ? cycleMillis : breakMillis
        );
      });
    });

    test('The index is set to the first period', () => {
      expect(timeline.current.id).toBe(0);
    });
  });
});
