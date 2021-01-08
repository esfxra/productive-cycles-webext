'use strict';

import { Adjuster } from '../../src/background/Adjuster.js';
import { Timer } from '../../src/background/Timer.js';

describe('Adjuster', () => {
  let timer;
  const settings = {
    autoStart: { cycles: false, breaks: false },
    cycleTime: 10 * 60000,
    breakTime: 5 * 60000,
    totalPeriods: 7,
  };
  beforeEach(() => {
    timer = new Timer();
    timer.init(settings);
  });

  describe('When the target for the current period has not passed yet', () => {
    test('Determines the correct time adjustment', () => {
      timer.start();
      const offset = 5000;
      const reference = timer.periods.current.target - offset;

      Adjuster.adjust(timer, reference);

      expect(timer.periods.current.remaining).toBe(5000);
    });
    test('Handles surplus milliseconds with a timeout', () => {
      jest.useFakeTimers();
      timer.start();
      const offset = 5000;
      const surplus = 500;
      const reference = timer.periods.current.target - offset - surplus;

      Adjuster.adjust(timer, reference);

      expect(timer.periods.current.remaining).toBe(5000);

      jest.advanceTimersByTime(surplus);

      expect(timer.periods.current.remaining).toBe(5000);
    });
  });

  describe('When the target for the current period has already passed', () => {
    describe('When autoStart is { cycles: false, breaks: false }', () => {
      test('Ends the 1st cycle', () => {
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);

        expect(timer.periods.timeline[0].status).toBe('complete');
        expect(timer.periods.timeline[0].remaining).toBe(0);
      });

      test('Does not start the 1st break', () => {
        jest.useFakeTimers();
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.advanceTimersByTime(1000);

        expect(timer.periods.timeline[1].status).toBe('initial');
        expect(timer.periods.timeline[1].remaining).toBe(settings.breakTime);
      });

      test('Ends the timer if the period is the last cycle', () => {
        jest.useFakeTimers();
        timer.periods.index = 6;
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.runAllTimers();

        expect(timer.periods.current.status).toBe('complete');
        expect(timer.periods.current.remaining).toBe(0);
      });
    });

    describe('When autoStart is { cycles: false, breaks: true }', () => {
      test('Ends the 1st cycle', () => {
        timer.settings.autoStart = { cycles: false, breaks: true };
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);

        expect(timer.periods.timeline[0].status).toBe('complete');
        expect(timer.periods.timeline[0].remaining).toBe(0);
      });

      test('Starts the 1st break', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: false, breaks: true };
        timer.start();
        const offset = 1000;
        const delay = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.advanceTimersByTime(1000);

        expect(timer.periods.timeline[1].status).toBe('running');
        expect(timer.periods.timeline[1].remaining).toBe(
          settings.breakTime - delay
        );
      });

      test('Ends the timer if the period is the last cycle', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: false, breaks: true };
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.runAllTimers();

        expect(timer.periods.current.status).toBe('complete');
        expect(timer.periods.current.remaining).toBe(0);
      });
    });

    describe('When autoStart is { cycles: true, breaks: false }', () => {
      test('Ends the 1st cycle', () => {
        timer.settings.autoStart = { cycles: true, breaks: false };
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);

        expect(timer.periods.timeline[0].status).toBe('complete');
        expect(timer.periods.timeline[0].remaining).toBe(0);
      });

      test('Does not start the 1st break', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: true, breaks: false };
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.advanceTimersByTime(1000);

        expect(timer.periods.timeline[1].status).toBe('initial');
        expect(timer.periods.timeline[1].remaining).toBe(settings.breakTime);
      });

      test('Starts the 2nd cycle if the timer is running a break', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: true, breaks: false };
        timer.periods.index = 1;
        timer.start();
        const offset = 1000;
        const delay = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.advanceTimersByTime(1000);

        expect(timer.periods.timeline[2].status).toBe('running');
        expect(timer.periods.timeline[2].remaining).toBe(
          settings.cycleTime - delay
        );
      });

      test('Ends the timer if the period is the last cycle', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: true, breaks: false };
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.runAllTimers();

        expect(timer.periods.current.status).toBe('complete');
        expect(timer.periods.current.remaining).toBe(0);
      });
    });

    describe('When autoStart is { cycles: true, breaks: true }', () => {
      test('Ends skipped periods', () => {
        timer.settings.autoStart = { cycles: true, breaks: true };
        timer.start();
        const offset = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference);

        expect(timer.periods.timeline[0].status).toBe('complete');
        expect(timer.periods.timeline[0].remaining).toBe(0);

        expect(timer.periods.timeline[1].status).toBe('complete');
        expect(timer.periods.timeline[1].remaining).toBe(0);

        expect(timer.periods.timeline[2].status).toBe('complete');
        expect(timer.periods.timeline[2].remaining).toBe(0);

        expect(timer.periods.timeline[3].status).toBe('complete');
        expect(timer.periods.timeline[3].remaining).toBe(0);
      });

      test('Adjusts the period properly', () => {
        timer.settings.autoStart = { cycles: true, breaks: true };
        timer.start();
        const offset = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference);

        expect(timer.periods.current.id).toBe(4);
      });

      test('Adjusts the status and time of new period properly', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: true, breaks: true };
        timer.start();
        const offset = 5000;
        const delay = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference);
        jest.advanceTimersByTime(0);

        expect(timer.periods.current.status).toBe('running');
        expect(timer.periods.current.remaining).toBe(
          settings.cycleTime - offset + delay
        );
      });

      test('Ends the timer if the period is the last cycle', () => {
        jest.useFakeTimers();
        timer.settings.autoStart = { cycles: true, breaks: true };
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference);
        jest.runAllTimers();

        expect(timer.periods.current.status).toBe('complete');
        expect(timer.periods.current.remaining).toBe(0);
      });
    });
  });
});
