'use strict';

import { Timeline } from '../../src/background/Timeline';
import { Cycle, Break } from '../../src/background/Period';

describe('Timeline', () => {
  let periods;
  const settings = { totalPeriods: 7, cycleTime: 10000, breaktime: 5000 };
  const newSettings = { totalPeriods: 7, cycleTime: 8000, breakTime: 2000 };
  beforeEach(() => {
    periods = new Timeline();
    periods.build(settings);
  });

  describe('Initialization', () => {
    test.each([[0], [1], [2], [3], [4], [5], [6]])(
      'Timeline gets built with the correct cycle-break alternation',
      (index) => {
        const period = periods.timeline[index];

        index % 2 === 0
          ? expect(period).toBeInstanceOf(Cycle)
          : expect(period).toBeInstanceOf(Break);
      }
    );
  });

  describe('Time updates', () => {
    test.each([[0], [2], [4], [6]])(
      'Cycle %i can be updated if it has not been started yet',
      (index) => {
        const period = periods.timeline[index];

        periods.updateTime(
          period,
          newSettings.cycleTime,
          newSettings.breakTime
        );

        expect(period.duration).toBe(newSettings.cycleTime);
        expect(period.remaining).toBe(newSettings.cycleTime);
      }
    );

    test.each([[1], [3], [5]])(
      'Break %i can be updated if it has not been started yet',
      (index) => {
        const period = periods.timeline[index];

        periods.updateTime(
          period,
          newSettings.cycleTime,
          newSettings.breakTime
        );

        expect(period.duration).toBe(newSettings.breakTime);
        expect(period.remaining).toBe(newSettings.breakTime);
      }
    );

    test('A period is not updated if it is running', () => {
      const period = periods.timeline[0];
      period.status = 'running';

      periods.updateTime(period, newSettings.cycleTime, newSettings.breakTime);

      expect(period.duration).toBe(settings.cycleTime);
      expect(period.remaining).toBe(settings.cycleTime);
    });

    test('Periods get updated duration and remaining time only', () => {
      const updates = { time: true, targets: false, autoStart: false };

      const updateTime = jest.spyOn(periods, 'updateTime');
      periods.update(updates, Date.now(), newSettings);

      expect(updateTime).toHaveBeenCalledTimes(settings.totalPeriods);
      updateTime.mockRestore();
    });
  });

  describe('Target updates', () => {
    test('The current index period updates the target based on time remaining', () => {
      periods.index = 5;
      const period = periods.current;
      const previous = periods.timeline[periods.index - 1];
      const reference = 10000;
      period.remaining = 6000;

      periods.updateTarget(period, previous, reference);

      expect(period.target).not.toBe(
        previous.duration + previous.target + reference
      );
      expect(period.target).toBe(reference + 6000);
    });

    test('The target for other periods gets updated with total duration', () => {
      periods.index = 2;
      const period = periods.current;
      const previous = periods.timeline[1];
      const reference = 3000;
      period.duration = 4000;
      previous.target = 8000;

      periods.updateTarget(period, previous, reference);

      expect(period.target).toBe(period.duration + previous.target + 1000);
    });
  });

  describe('AutoStart updates', () => {
    test('The current index period gets enabled by default', () => {
      periods.index = 1;
      const period = periods.current;
      const previous = periods.timeline[periods.index - 1];
      const autoStart = { cycles: false, breaks: false };
      period.enabled = false;

      periods.updateEnabled(period, previous, autoStart);

      expect(period.enabled).toBe(true);
    });

    test('Consecutive periods get an autoStart assignment if the previous is enabled', () => {
      periods.index = 4;
      const period = periods.timeline[periods.index + 1];
      const previous = periods.timeline[periods.index];
      const autoStart = { cycles: true, breaks: true };
      previous.enabled = true;
      period.enabled = false;

      periods.updateEnabled(period, previous, autoStart);

      expect(period.enabled).toBe(true);
    });

    test('Other periods get disabled if the previous is disabled', () => {
      periods.index = 4;
      const period = periods.timeline[periods.index + 1];
      const previous = periods.timeline[periods.index];
      const autoStart = { cycles: true, breaks: true };
      previous.enabled = false;
      period.enabled = false;

      periods.updateEnabled(period, previous, autoStart);

      expect(period.enabled).toBe(false);
    });
  });

  describe('Size updates', () => {
    describe('Shorten timeline', () => {
      const settings = { totalPeriods: 3 };

      test('The timeline gets sliced to a shorter length defined by the new periods total', () => {
        periods.shorten(settings);

        expect(periods.timeline.length).toBe(3);
      });

      test('The current index does not get affected if it has not occurred yet', () => {
        periods.index = 1;
        periods.shorten(settings);

        expect(periods.index).toBe(1);
      });

      test('The current index does not get affected if it is the last one', () => {
        periods.index = 2;
        periods.shorten(settings);

        expect(periods.index).toBe(2);
      });
    });

    describe('Lengthen timeline', () => {
      const settings = {
        totalPeriods: 9,
        cycleTime: 3000,
        breakTime: 2000,
        autoStart: { cycles: true, breaks: true },
      };

      test('By the proper amount of periods', () => {
        expect(periods.timeline.length).toBe(7);

        periods.lengthen(settings);

        expect(periods.timeline.length).toBe(9);
      });

      test('With the new periods instantiated and configured', () => {
        periods.timeline[6].enabled = true;
        periods.lengthen(settings);

        expect(periods.timeline[7].duration).toBe(settings.breakTime);
        expect(periods.timeline[7].enabled).toBe(settings.autoStart.breaks);

        expect(periods.timeline[8].duration).toBe(settings.cycleTime);
        expect(periods.timeline[8].enabled).toBe(settings.autoStart.cycles);
      });

      test('With the correct index if it is lengthened after completing the timer', () => {
        periods.timeline.forEach((period) => period.end());
        periods.index = periods.timeline.length - 1;

        periods.lengthen(settings);

        expect(periods.index).toBe(8);
      });
    });
  });
});
