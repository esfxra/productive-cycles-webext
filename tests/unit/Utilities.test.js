'use strict';

import { Utilities } from '../../src/background/Utilities';
import { Cycle, Break } from '../../src/background/Period';

describe('Timeline', () => {
  test.each([[0], [1], [2], [3], [4], [5], [6]])(
    'Timeline gets built with the correct cycle-break alternation',
    (index) => {
      const settings = { totalPeriods: 7, cycleTime: 10000, breaktime: 5000 };
      const timeline = Utilities.buildTimeline(settings);

      const period = timeline[index];

      index % 2 === 0
        ? expect(period).toBeInstanceOf(Cycle)
        : expect(period).toBeInstanceOf(Break);
    }
  );

  test.each([
    [false, false, [true, false, false, false, false]],
    [false, true, [true, true, false, false, false]],
    [true, false, [true, false, false, false, false]],
    [true, true, [true, true, true, true, true]],
  ])(
    'Timeline gets updated with the correct periods enabled when timer first starts',
    (cycleAutoStart, breakAutoStart, expected) => {
      const autoStart = {
        cycles: cycleAutoStart,
        breaks: breakAutoStart,
      };

      const settings = {
        totalPeriods: 5,
        cycleTime: 10000,
        breaktime: 5000,
        autoStart: autoStart,
      };

      const timeline = Utilities.buildTimeline(settings);

      const current = 0;
      const reference = Date.now();

      const result = Utilities.updateTimeline(
        current,
        timeline,
        reference,
        settings
      );

      let enabledArray = [];
      result.forEach((period) => enabledArray.push(period.enabled));

      expect(enabledArray).toEqual(expected);
    }
  );

  test.each([
    [false, false, [true, false, false]],
    [false, true, [true, true, false]],
    [true, false, [true, false, false]],
    [true, true, [true, true, true]],
  ])(
    'Timeline gets updated with the correct periods enabled when timer is at a cycle',
    (cycleAutoStart, breakAutoStart, expected) => {
      const autoStart = {
        cycles: cycleAutoStart,
        breaks: breakAutoStart,
      };

      const settings = {
        totalPeriods: 5,
        cycleTime: 10000,
        breaktime: 5000,
        autoStart: autoStart,
      };

      const timeline = Utilities.buildTimeline(settings);

      const current = 2;
      const reference = Date.now();

      const result = Utilities.updateTimeline(
        current,
        timeline,
        reference,
        settings
      );

      let enabledArray = [];
      result.forEach((period) => enabledArray.push(period.enabled));

      expect(enabledArray[2]).toBe(expected[0]);
      expect(enabledArray[3]).toBe(expected[1]);
      expect(enabledArray[4]).toBe(expected[2]);
    }
  );

  test.each([
    [false, false, [true, false]],
    [false, true, [true, false]],
    [true, false, [true, true]],
    [true, true, [true, true]],
  ])(
    'Timeline gets updated with the correct periods enabled when timer is at a break',
    (cycleAutoStart, breakAutoStart, expected) => {
      const autoStart = {
        cycles: cycleAutoStart,
        breaks: breakAutoStart,
      };

      const settings = {
        totalPeriods: 5,
        cycleTime: 10000,
        breaktime: 5000,
        autoStart: autoStart,
      };

      const timeline = Utilities.buildTimeline(settings);

      const current = 3;
      const reference = Date.now();

      const result = Utilities.updateTimeline(
        current,
        timeline,
        reference,
        settings
      );

      let enabledArray = [];
      result.forEach((period) => enabledArray.push(period.enabled));

      expect(enabledArray[3]).toBe(expected[0]);
      expect(enabledArray[4]).toBe(expected[1]);
    }
  );
});

describe('Adjuster', () => {
  test.each([
    [2001, 1],
    [3000, 1],
    [4000, 1],
    [5000, 2],
    [6100, 3],
    [8100, 4],
    [11000, 4],
  ])(
    'Determines the correct period when the whole timeline is enabled',
    (reference, expected) => {
      const timeline = [
        { target: 2000, enabled: true },
        { target: 4000, enabled: true },
        { target: 6000, enabled: true },
        { target: 8000, enabled: true },
        { target: 10000, enabled: true },
      ];

      const current = 0;
      const period = Utilities.determinePeriod(current, timeline, reference);

      expect(period).toBe(expected);
    }
  );

  test.each([
    [2001, 1],
    [3000, 1],
    [4000, 1],
    [5000, 2],
    [6001, 2],
    [9000, 2],
  ])(
    'Determines the correct period when the timeline is partially enabled',
    (reference, expected) => {
      const timeline = [
        { target: 2000, enabled: false },
        { target: 4000, enabled: true },
        { target: 6000, enabled: true },
        { target: 8000, enabled: false },
        { target: 10000, enabled: false },
      ];

      const current = 1;
      const period = Utilities.determinePeriod(current, timeline, reference);

      expect(period).toBe(expected);
    }
  );

  test.each([
    [6500, 3],
    [8000, 3],
    [8100, 4],
    [9000, 4],
    [10000, 4],
    [11000, 4],
  ])(
    'Determines the correct period when the timeline is partially enabled for the last 2 periods',
    (reference, expected) => {
      const timeline = [
        { target: 2000, enabled: false },
        { target: 4000, enabled: false },
        { target: 6000, enabled: false },
        { target: 8000, enabled: true },
        { target: 10000, enabled: true },
      ];

      const current = 3;
      const period = Utilities.determinePeriod(current, timeline, reference);

      expect(period).toBe(expected);
    }
  );
});
