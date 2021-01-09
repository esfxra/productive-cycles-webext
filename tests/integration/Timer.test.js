'use strict';

import { Timer } from '../../src/background/Timer';

describe('Autostart behavior', () => {
  describe('{ cycles: false, breaks: false }', () => {
    let timer;
    beforeAll(() => {
      timer = new Timer();
      timer.init({
        autoStart: { cycles: false, breaks: false },
        cycleTime: 10 * 60000,
        breakTime: 5 * 60000,
        totalPeriods: 7,
      });
      timer.notify = jest.fn();
    });

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.cycleTime);

      expect(timer.periods.current.id).toBe(0);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('initial');
      expect(timer.periods.current.remaining).toBe(timer.settings.breakTime);
    });

    test('No changes occur after more time passes since next break is disabled', () => {
      jest.useFakeTimers();

      jest.advanceTimersByTime(5000);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('initial');
      expect(timer.periods.current.remaining).toBe(timer.settings.breakTime);
    });

    test('Break is started manually, runs for break time, ends after 1 additional second', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.breakTime);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);

      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(2);
      expect(timer.periods.current.status).toBe('initial');
      expect(timer.periods.current.remaining).toBe(timer.settings.cycleTime);
    });
  });

  describe('{ cycles: false, breaks: true }', () => {
    let timer;
    beforeAll(() => {
      timer = new Timer();
      timer.init({
        autoStart: { cycles: false, breaks: true },
        cycleTime: 10 * 60000,
        breakTime: 5 * 60000,
        totalPeriods: 7,
      });
      timer.notify = jest.fn();
    });

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.cycleTime);

      expect(timer.periods.current.id).toBe(0);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(timer.settings.breakTime);
    });

    test('Break runs for break time', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(timer.settings.breakTime);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(2);
      expect(timer.periods.current.status).toBe('initial');
      expect(timer.periods.current.remaining).toBe(timer.settings.cycleTime);
    });
  });

  describe('{ cycles: true, breaks: false }', () => {
    let timer;
    beforeAll(() => {
      timer = new Timer();
      timer.init({
        autoStart: { cycles: true, breaks: false },
        cycleTime: 10 * 60000,
        breakTime: 5 * 60000,
        totalPeriods: 7,
      });
      timer.notify = jest.fn();
    });

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.cycleTime);

      expect(timer.periods.current.id).toBe(0);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('initial');
      expect(timer.periods.current.remaining).toBe(timer.settings.breakTime);
    });

    test('Break is started manually, runs for break time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.breakTime);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(2);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(timer.settings.cycleTime);
    });
  });

  describe('{ cycles: true, breaks: true }', () => {
    let timer;
    beforeAll(() => {
      timer = new Timer();
      timer.init({
        autoStart: { cycles: true, breaks: true },
        cycleTime: 10 * 60000,
        breakTime: 5 * 60000,
        totalPeriods: 7,
      });
      timer.notify = jest.fn();
    });

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(timer.settings.cycleTime);

      expect(timer.periods.current.id).toBe(0);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(timer.settings.breakTime);
    });

    test('Break runs for break time', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(timer.settings.breakTime);

      expect(timer.periods.current.id).toBe(1);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.periods.current.id).toBe(2);
      expect(timer.periods.current.status).toBe('running');
      expect(timer.periods.current.remaining).toBe(timer.settings.cycleTime);
    });
  });
});
