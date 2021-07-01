import Bridge from '../../src/background/Bridge';
import Timeline from '../../src/background/Timeline';
import { DEFAULT_SETTINGS } from '../../src/shared-constants';

let bridge: Bridge;
let timeline: Timeline;

describe('State Manager and Timeline', () => {
  beforeAll(() => {
    timeline = new Timeline(DEFAULT_SETTINGS);
  });

  test('Timeline has the right number of periods', () => {
    expect(timeline.periods).toHaveLength(7);
  });

  test('Timeline periods have the right duration', () => {
    const cycleDuration = DEFAULT_SETTINGS.cycleMinutes * 60000;
    const breakDuration = DEFAULT_SETTINGS.breakMinutes * 60000;

    timeline.periods.forEach((period, idx) => {
      const expected = idx % 2 === 0 ? cycleDuration : breakDuration;
      expect(period.remaining).toBe(expected);
    });
  });

  test('Timeline periods are initially disabled', () => {
    timeline.periods.forEach((period) => {
      expect(period.enabled).toBe(false);
    });
  });
});
