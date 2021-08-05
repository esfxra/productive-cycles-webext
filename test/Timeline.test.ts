import Timeline from '../src/background/Timeline';
import Mediator from '../src/background/Mediator';
import { DEFAULT_SETTINGS } from '../src/shared-constants';
import { Status } from '../src/shared-types';

const settings = DEFAULT_SETTINGS;
let timeline: Timeline;
// let mediator: Mediator;

beforeAll(() => jest.mock('../src/background/Mediator'));
afterAll(() => jest.mock('../src/background/Mediator'));

beforeEach(() => {
  jest.useFakeTimers();
  timeline = new Timeline();
  timeline.mediator = new Mediator();
  timeline.init(DEFAULT_SETTINGS);
});

describe('Init', () => {
  test(`Array of ${settings.totalPeriods} periods is created`, () => {
    expect(timeline.periods.length).toBe(settings.totalPeriods);
  });

  test('Timeline index is set to 0', () => {
    expect(timeline.index).toBe(0);
  });

  test('Even periods have cycle minutes as duration', () => {
    timeline.periods.forEach((period, idx) => {
      if (idx % 2 === 0) {
        expect(period.remaining).toBe(settings.cycleMinutes * 60 * 1000);
      }
    });
  });

  test('Odd periods have break minutes as duration', () => {
    timeline.periods.forEach((period, idx) => {
      if (idx % 2 !== 0) {
        expect(period.remaining).toBe(settings.breakMinutes * 60 * 1000);
      }
    });
  });

  test('All period IDs match array position', () => {
    timeline.periods.forEach((period, idx) => {
      expect(period.id).toBe(idx);
    });
  });

  test('All periods have initial state for status, target, and autostart', () => {
    timeline.periods.forEach((period) => {
      expect(period.status).toBe(Status.Initial);
      expect(period.target).toBe(null);
      expect(period.enabled).toBe(false);
    });
  });
});

describe('Updating targets', () => {
  test.each([
    { current: 0 },
    { current: 1 },
    { current: 2 },
    { current: 3 },
    { current: 4 },
    { current: 5 },
    { current: 6 },
  ])(
    'Current period is updated with current time + duration',
    ({ current }) => {
      timeline.index = current;
      const reference = Date.now() + timeline.current.remaining;

      timeline.updateTargets();

      expect(timeline.periods[current].target).toBeGreaterThanOrEqual(
        reference - 300
      );
      expect(timeline.periods[current].target).toBeLessThanOrEqual(
        reference + 300
      );
    }
  );

  test("Consequent periods are updated with the previous period's target + duration", () => {
    timeline.updateTargets();

    timeline.periods.forEach((period, idx, arr) => {
      if (idx !== 0) {
        expect(period.target).toBeGreaterThanOrEqual(
          arr[idx - 1].target + period.remaining - 300
        );
        expect(period.target).toBeLessThanOrEqual(
          arr[idx - 1].target + period.remaining + 300
        );
      }
    });
  });

  test('Completed periods are skipped', () => {
    timeline.current.complete();
    timeline.index += 1;

    timeline.updateTargets();

    // Target should not be updated for completed periods, and default value is null
    expect(timeline.periods[0].status).toBe(Status.Complete);
    expect(timeline.periods[0].target).toBe(null);
  });
});

describe('Updating autostart (enabled or not)', () => {
  test.each([
    { current: 0 },
    { current: 1 },
    { current: 2 },
    { current: 3 },
    { current: 4 },
    { current: 5 },
    { current: 6 },
  ])('Current period is always enabled', ({ current }) => {
    timeline.index = current;
    timeline.updateEnabled();

    expect(timeline.current.enabled).toBe(true);
  });

  test('Completed periods are skipped', () => {
    timeline.current.complete();
    timeline.index += 1;
    timeline.current.complete();
    timeline.index += 1;

    timeline.updateEnabled();

    expect(timeline.periods[0].enabled).toBe(false);
    expect(timeline.periods[1].enabled).toBe(false);
    expect(timeline.periods[2].enabled).toBe(true);
    expect(timeline.periods[3].enabled).toBe(true);
    expect(timeline.periods[4].enabled).toBe(true);
    expect(timeline.periods[5].enabled).toBe(true);
    expect(timeline.periods[6].enabled).toBe(true);
  });

  test.each([
    { cycles: false, breaks: false, expected: [1, 0, 0, 0, 0, 0, 0] },
    { cycles: false, breaks: true, expected: [1, 1, 0, 0, 0, 0, 0] },
    { cycles: true, breaks: false, expected: [1, 0, 0, 0, 0, 0, 0] },
    { cycles: true, breaks: true, expected: [1, 1, 1, 1, 1, 1, 1] },
  ])(
    'Periods are enabled per autoStart settings, and consequent ones get disabled if previous already is disabled',
    ({ cycles, breaks, expected }) => {
      // Set initial autoStart settings
      timeline.settings.cycleAutoStart = cycles;
      timeline.settings.breakAutoStart = breaks;

      // Evaluate expected values to true and false
      const _expected = expected.map((item) => item === 1);

      timeline.updateEnabled();

      expect(timeline.periods.map((period) => period.enabled)).toEqual(
        _expected
      );
    }
  );
});

describe('Transition to next period', () => {
  test.each([
    { current: 0, expected: 1 },
    { current: 1, expected: 2 },
    { current: 2, expected: 3 },
    { current: 3, expected: 4 },
    { current: 4, expected: 5 },
    { current: 5, expected: 6 },
    { current: 6, expected: 6 },
  ])(
    'Increments the index number for all periods except the last one',
    ({ current, expected }) => {
      timeline.index = current;
      timeline.nextPeriod();

      expect(timeline.index).toBe(expected);
    }
  );

  test('Starts the next period if its autostart setting is enabled', () => {
    timeline.periods[0].enabled = true;
    timeline.periods[1].enabled = true;

    timeline.nextPeriod();

    expect(timeline.current.status).toBe(Status.Running);
  });

  test('Does not start the next period if its autostart setting is disabled', () => {
    timeline.periods[0].enabled = true;
    timeline.periods[1].enabled = false;

    timeline.nextPeriod();

    expect(timeline.current.status).toBe(Status.Initial);
  });
});

describe('Reset cycle logic', () => {
  test('Resets period to initial state when running', () => {
    timeline.current.start();
    expect(timeline.current.status).toBe(Status.Running);

    timeline.onResetCycle();

    expect(timeline.current.status).toBe(Status.Initial);
    expect(timeline.current.target).toBe(null);
    expect(timeline.current.enabled).toBe(false);
    expect(timeline.current.remaining).toBe(
      timeline.settings.cycleMinutes * 60 * 1000
    );
  });

  test('Resets to previous period when in initial state', () => {
    timeline.index = 2;
    timeline.current.status = Status.Initial;

    timeline.onResetCycle();

    expect(timeline.index).toBe(0);
    expect(timeline.current.id).toBe(0);
    expect(timeline.current.status).toBe(Status.Initial);
    expect(timeline.current.target).toBe(null);
    expect(timeline.current.enabled).toBe(false);
    expect(timeline.current.remaining).toBe(
      timeline.settings.cycleMinutes * 60 * 1000
    );
  });

  test('No changes are made if it is the first period, and it is in initial state', () => {
    timeline.index = 0;
    timeline.current.status = Status.Initial;

    timeline.onResetCycle();

    expect(timeline.index).toBe(0);
    expect(timeline.current.id).toBe(0);
    expect(timeline.current.status).toBe(Status.Initial);
    expect(timeline.current.target).toBe(null);
    expect(timeline.current.enabled).toBe(false);
    expect(timeline.current.remaining).toBe(
      timeline.settings.cycleMinutes * 60 * 1000
    );
  });
});

describe('Reset all logic', () => {
  test('Resets all periods to initial state', () => {
    timeline.periods[0].complete();
    timeline.periods[1].complete();
    timeline.periods[2].complete();
    timeline.periods[3].complete();
    timeline.periods[4].complete();
    timeline.periods[5].complete();
    timeline.periods[6].complete();

    timeline.onResetAll();

    timeline.periods.forEach((period, idx) => {
      const duration =
        idx % 2 === 0
          ? timeline.settings.cycleMinutes
          : timeline.settings.breakMinutes;

      expect(period.status).toBe(Status.Initial);
      expect(period.target).toBe(null);
      expect(period.enabled).toBe(false);
      expect(period.remaining).toBe(duration * 60 * 1000);
    });
  });
});
