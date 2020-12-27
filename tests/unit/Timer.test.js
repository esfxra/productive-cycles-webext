'use strict';

import { Timer } from '../../src/background/Timer';
import { Cycle, Break } from '../../src/background/Period';

describe('Subtractor', () => {
  const config = {
    totalCycles: 4,
    cycleMinutes: 2,
    breakMinutes: 1,
    autoStart: { cycles: false, breaks: false },
  };
  let timer;
  beforeAll(() => (timer = new Timer(config)));

  test('Subtractor ends when time left is < 0', () => {
    jest.useFakeTimers();

    timer.runSubtractor();
    jest.advanceTimersByTime(2 * 60000);

    expect(timer.current).toBe(0);

    jest.advanceTimersByTime(1000);

    expect(timer.current).toBe(1);
  });
});
