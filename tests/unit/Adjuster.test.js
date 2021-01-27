'use strict';

import { Adjuster } from '../../src/background/Adjuster.js';

describe('Determine period', () => {
  test.each([
    [2001, 1],
    [3000, 1],
    [4000, 1],
    [5000, 2],
    [6100, 3],
    [8100, 4],
    [11000, 4],
  ])('When the whole timeline is enabled', (reference, expected) => {
    const timeline = [
      { target: 2000, enabled: true },
      { target: 4000, enabled: true },
      { target: 6000, enabled: true },
      { target: 8000, enabled: true },
      { target: 10000, enabled: true },
    ];

    const current = 0;
    const period = Adjuster.determinePeriod(current, timeline, reference);

    expect(period).toBe(expected);
  });

  test.each([
    [2001, 1],
    [3000, 1],
    [4000, 1],
    [5000, 2],
    [6001, 2],
    [9000, 2],
  ])('When the timeline is partially enabled', (reference, expected) => {
    const timeline = [
      { target: 2000, enabled: false },
      { target: 4000, enabled: true },
      { target: 6000, enabled: true },
      { target: 8000, enabled: false },
      { target: 10000, enabled: false },
    ];

    const current = 1;
    const period = Adjuster.determinePeriod(current, timeline, reference);

    expect(period).toBe(expected);
  });

  test.each([
    [6500, 3],
    [8000, 3],
    [8100, 4],
    [9000, 4],
    [10000, 4],
    [11000, 4],
  ])(
    'When the timeline is partially enabled for the last 2 periods',
    (reference, expected) => {
      const timeline = [
        { target: 2000, enabled: false },
        { target: 4000, enabled: false },
        { target: 6000, enabled: false },
        { target: 8000, enabled: true },
        { target: 10000, enabled: true },
      ];

      const current = 3;
      const period = Adjuster.determinePeriod(current, timeline, reference);

      expect(period).toBe(expected);
    }
  );
});
