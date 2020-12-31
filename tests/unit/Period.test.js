'use strict';

import { Cycle, Break } from '../../src/background/Period';

describe('Cycles', () => {
  const config = { id: 0, duration: 1000 };
  let cycle;
  beforeEach(() => {
    cycle = new Cycle(config.id, config.duration, config.target);
  });

  describe('Instantiation', () => {
    test('New cycle gets instantiated correctly', () => {
      expect(cycle.id).toBe(0);
      expect(cycle.duration).toBe(1000);
      expect(cycle.remaining).toBe(1000);
    });
  });

  describe('Status setters', () => {
    test('Can start', () => {
      cycle.start();
      expect(cycle.status).toBe('running');
    });

    test('Can be paused', () => {
      cycle.pause();
      expect(cycle.status).toBe('paused');
    });

    test('Can be reset', () => {
      cycle.reset({ cycleTime: 1000 });
      expect(cycle.status).toBe('initial');
    });

    test('Can end', () => {
      cycle.end();
      expect(cycle.status).toBe('complete');
    });
  });

  describe('Autostart setter', () => {
    test('Properly updates enabled with autostart break setting', () => {
      cycle.enabled = false;
      cycle.autoStart({ cycles: true, breaks: false });

      expect(cycle.enabled).toBe(true);
    });
  });

  describe('Getters', () => {
    test('Is this period a cycle?', () => {
      expect(cycle.isCycle).toBe(true);
    });

    test('Actual time is calculated properly', () => {
      const offset = 1000;
      cycle.target = Date.now() + offset;
      expect(cycle.actual).toBe(offset);
    });

    test('Actual time is used to adjust remaining to the nearest whole second (Math.floor)', () => {
      const surplus = 300;
      const offset = 1000 + surplus;

      cycle.target = Date.now() + offset;
      const result = cycle.adjust;

      expect(cycle.remaining).toBe(offset - surplus);
      expect(result).toBe(surplus);
    });
  });
});

describe('Breaks', () => {
  const config = { id: 1, duration: 1000 };
  let _break;
  beforeEach(() => {
    _break = new Break(config.id, config.duration, config.target);
  });

  describe('Instantiation', () => {
    test('New break gets instantiated correctly', () => {
      expect(_break.id).toBe(1);
      expect(_break.duration).toBe(1000);
      expect(_break.remaining).toBe(1000);
    });
  });

  describe('Status setters', () => {
    test('Can start', () => {
      _break.start();
      expect(_break.status).toBe('running');
    });

    test('Can be skipped', () => {
      _break.skip();
      expect(_break.status).toBe('complete');
    });

    test('Can be reset', () => {
      _break.reset({ breakTime: 1000 });
      expect(_break.status).toBe('initial');
    });

    test('Can end', () => {
      _break.end();
      expect(_break.status).toBe('complete');
    });
  });

  describe('Autostart setter', () => {
    test('Properly updates enabled with autostart break setting', () => {
      _break.enabled = false;
      _break.autoStart({ cycles: false, breaks: true });

      expect(_break.enabled).toBe(true);
    });
  });

  describe('Getters', () => {
    test('Is this period not a cycle?', () => {
      expect(_break.isCycle).toBe(false);
    });

    test('Actual time is calculated properly', () => {
      const offset = 1000;
      _break.target = Date.now() + offset;
      expect(_break.actual).toBe(offset);
    });

    test('Actual time is used to adjust remaining to the nearest whole second (Math.floor)', () => {
      const surplus = 300;
      const offset = 1000 + surplus;

      _break.target = Date.now() + offset;
      const result = _break.adjust;

      expect(_break.remaining).toBe(offset - surplus);
      expect(result).toBe(surplus);
    });
  });
});
