'use strict';

import { Timer } from '../../src/background/Timer';

describe('Subtractor', () => {
  let timer;
  beforeAll(() => {
    timer = new Timer();
    timer.init({
      autoStart: { cycles: false, breaks: false },
      cycleTime: 2 * 60000,
      breakTime: 1 * 60000,
      totalPeriods: 7,
    });
  });

  test('Subtractor ends when time left is < 0', () => {
    jest.useFakeTimers();

    timer.runSubtractor();
    jest.advanceTimersByTime(2 * 60000);

    expect(timer.current).toBe(0);

    jest.advanceTimersByTime(1000);

    expect(timer.current).toBe(1);
  });
});
