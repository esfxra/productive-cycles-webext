'use strict';

import { Cycle, Break } from '../../src/background/Period';

describe('Cycles', () => {
  const config = { id: 0, remaining: 1000, target: Date.now() + 10000 };
  let cycle;
  beforeEach(() => {
    cycle = new Cycle(config.id, config.remaining, config.target);
  });

  describe('Instantiation', () => {
    test('New cycle gets instantiated correctly', () => {
      expect(cycle.id).toBe(0);
      expect(cycle.remaining).toBe(1000);
      expect(cycle.target).toBeGreaterThan(Date.now());
    });
  });

  describe('Status setters work correctly', () => {
    test('Can start', () => {
      cycle.start();
      expect(cycle.status).toBe('running');
    });

    test('Can be paused', () => {
      cycle.pause();
      expect(cycle.status).toBe('paused');
    });

    test('Can be reset', () => {
      cycle.reset();
      expect(cycle.status).toBe('initial');
    });

    test('Can end', () => {
      cycle.end();
      expect(cycle.status).toBe('complete');
    });
  });
});

describe('Breaks', () => {
  const config = { id: 0, remaining: 1000, target: Date.now() + 10000 };
  let _break;
  beforeEach(() => {
    _break = new Break(config.id, config.remaining, config.target);
  });

  describe('Instantiation', () => {
    test('New break gets instantiated correctly', () => {
      expect(_break.id).toBe(0);
      expect(_break.remaining).toBe(1000);
      expect(_break.target).toBeGreaterThan(Date.now());
    });
  });

  describe('Status setters work correctly', () => {
    test('Can start', () => {
      _break.start();
      expect(_break.status).toBe('running');
    });

    test('Can be skipped', () => {
      _break.skip();
      expect(_break.status).toBe('complete');
    });

    test('Can be reset', () => {
      _break.reset();
      expect(_break.status).toBe('initial');
    });

    test('Can end', () => {
      _break.end();
      expect(_break.status).toBe('complete');
    });
  });
});
