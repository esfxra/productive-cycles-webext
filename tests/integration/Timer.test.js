'use strict';

import { Timer } from '../../src/background/Timer';

describe('Autostart behavior', () => {
  describe('{Cycles: false, Breaks: false}', () => {
    const config = {
      totalCycles: 4,
      cycleMinutes: 10,
      breakMinutes: 5,
      autoStart: { cycles: false, breaks: false },
    };
    let timer;
    beforeAll(() => (timer = new Timer(config)));

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.cycleMinutes * 60000);

      expect(timer.period.id).toBe(0);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('initial');
      expect(timer.period.remaining).toBe(config.breakMinutes * 60000);
    });

    test('No changes occur after more time passes since next break is disabled', () => {
      jest.useFakeTimers();

      jest.advanceTimersByTime(5000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('initial');
      expect(timer.period.remaining).toBe(config.breakMinutes * 60000);
    });

    test('Break is started manually, runs for break time, ends after 1 additional second', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.breakMinutes * 60000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);

      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(2);
      expect(timer.period.status).toBe('initial');
      expect(timer.period.remaining).toBe(config.cycleMinutes * 60000);
    });
  });

  describe('{Cycles: false, Breaks: true}', () => {
    const config = {
      totalCycles: 4,
      cycleMinutes: 10,
      breakMinutes: 5,
      autoStart: { cycles: false, breaks: true },
    };
    let timer;
    beforeAll(() => (timer = new Timer(config)));

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.cycleMinutes * 60000);

      expect(timer.period.id).toBe(0);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(config.breakMinutes * 60000);
    });

    test('Break runs for break time', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(config.breakMinutes * 60000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(2);
      expect(timer.period.status).toBe('initial');
      expect(timer.period.remaining).toBe(config.cycleMinutes * 60000);
    });
  });

  describe('{Cycles: true, Breaks: false}', () => {
    const config = {
      totalCycles: 4,
      cycleMinutes: 10,
      breakMinutes: 5,
      autoStart: { cycles: true, breaks: false },
    };
    let timer;
    beforeAll(() => (timer = new Timer(config)));

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.cycleMinutes * 60000);

      expect(timer.period.id).toBe(0);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break does not start', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('initial');
      expect(timer.period.remaining).toBe(config.breakMinutes * 60000);
    });

    test('Break is started manually, runs for break time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.breakMinutes * 60000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(2);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(config.cycleMinutes * 60000);
    });
  });

  describe('{Cycles: true, Breaks: true}', () => {
    const config = {
      totalCycles: 4,
      cycleMinutes: 10,
      breakMinutes: 5,
      autoStart: { cycles: true, breaks: true },
    };
    let timer;
    beforeAll(() => (timer = new Timer(config)));

    test('Cycle is started, runs for cycle time', () => {
      jest.useFakeTimers();
      timer.start();
      jest.advanceTimersByTime(config.cycleMinutes * 60000);

      expect(timer.period.id).toBe(0);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Cycle ends after 1 additional second, and break is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(config.breakMinutes * 60000);
    });

    test('Break runs for break time', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(config.breakMinutes * 60000);

      expect(timer.period.id).toBe(1);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(0);
    });

    test('Break ends after 1 additional second, and cycle is automatically started', () => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      expect(timer.period.id).toBe(2);
      expect(timer.period.status).toBe('running');
      expect(timer.period.remaining).toBe(config.cycleMinutes * 60000);
    });
  });
});
