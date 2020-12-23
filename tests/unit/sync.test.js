import { Timer } from '../../src/background/background-timer.js';
const defaultValues = {
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
  autoStart: true,
};

describe.only('Sync', () => {
  // Used to generate arbitrary numbers
  const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  // All possible sync transitions
  const totalPeriods = defaultValues.totalCycles * 2 - 1;
  let transitions = [];
  for (let i = 0; i < totalPeriods; i += 1) {
    for (let j = i; j < totalPeriods; j += 1) {
      transitions.push([i, j]);
    }
  }

  let timer = new Timer(defaultValues);
  beforeEach(() => timer.resetAll());

  describe('Determining adjustments', () => {
    describe('With auto-start', () => {
      beforeAll(() => {
        timer.settings.autoStart = true;
      });

      test.each(transitions)(
        'The correct period, status, and time are determined with auto-start',
        (a, b) => {
          timer.buildTimeline();
          timer.state.period = a;

          const min = 0;
          const max = 50000;
          const remaining = randomInt(min, max); // Arbitrary value

          const reference = timer.timeline[b] - remaining;

          const result = timer.determineAdjustments(reference);

          expect(result.period).toBe(b);
          expect(result.status).toBe(b % 2 === 0 ? 'running' : 'break');
          expect(result.time).toBe(remaining);
        }
      );
    });

    describe('Without auto-start', () => {
      beforeAll(() => {
        timer.settings.autoStart = false;
      });

      test('The correct period, status, and time are determined without auto-start with 0 seconds remaining', () => {
        timer.settings.autoStart = false;
        timer.buildTimeline();
        timer.state.period = 0;

        const reference = timer.timeline[0];

        const remaining = 0;
        const result = timer.determineAdjustments(reference - remaining);

        expect(result.period).toBe(0);
        expect(result.status).toBe('running');
        expect(result.time).toBe(0);
      });

      test('The correct period, status, and time are determined without auto-start with less than 0 seconds remaining', () => {
        timer.settings.autoStart = false;
        timer.buildTimeline();
        timer.state.period = 0;

        const reference = timer.timeline[0];

        const remaining = -5000;
        const result = timer.determineAdjustments(reference - remaining);

        expect(result.period).toBe(0);
        expect(result.status).toBe('running');
        expect(result.time).toBe(-5000);
      });

      test('The correct period, status, and time are determined without auto-start with 10 seconds remaining', () => {
        timer.settings.autoStart = false;
        timer.buildTimeline();
        timer.state.period = 0;

        const remaining = 10000;
        const reference = timer.timeline[0] - remaining;

        const result = timer.determineAdjustments(reference);

        expect(result.period).toBe(0);
        expect(result.status).toBe('running');
        expect(result.time).toBe(remaining);
      });
    });
  });

  describe('Corrections', () => {
    describe('With auto-start', () => {
      beforeAll(() => {
        timer.settings.autoStart = true;
      });

      test.each(transitions)(
        'The correct period, status, and time are applied',
        (a, b) => {
          jest.useFakeTimers();

          timer.buildTimeline();
          timer.state.period = a;

          const min = 0;
          const max = 50000;
          const remaining = randomInt(min, max); // Arbitrary value

          const surplus = remaining - Math.floor(remaining / 1000) * 1000;

          const reference = timer.timeline[b] - remaining;

          timer.sync(reference);

          jest.advanceTimersByTime(surplus);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe(b % 2 === 0 ? 'running' : 'break');
          expect(timer.state.time).toBe(remaining - surplus);
        }
      );

      test.each(transitions)(
        'Delays do not occur when a correction leads to a transition and time is 0 <= x <= 999',
        (a, b) => {
          jest.useFakeTimers();

          timer.buildTimeline();
          timer.state.period = a;

          const min = 0;
          const max = 999;
          const remaining = randomInt(min, max);

          const surplus = remaining - Math.floor(remaining / 1000) * 1000;

          const reference = timer.timeline[b] - remaining;

          timer.sync(reference);

          jest.advanceTimersByTime(surplus);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe(b % 2 === 0 ? 'running' : 'break');
          expect(timer.state.time).toBe(remaining - surplus);

          jest.advanceTimersByTime(1000);

          const next = b + 1;
          if (next < 6) {
            expect(timer.state.period).toBe(next);
            expect(timer.state.status).toBe(
              next % 2 === 0 ? 'running' : 'break'
            );
            expect(timer.state.time).toBe(
              next % 2 === 0
                ? timer.settings.cycleTime
                : timer.settings.breakTime
            );
          }
        }
      );

      test.each(transitions)(
        'A correction does not lead to a transition if x is a 1000 or greater',
        (a, b) => {
          jest.useFakeTimers();

          timer.buildTimeline();
          timer.state.period = a;

          const min = 1000;
          const max = 10000;
          const remaining = randomInt(min, max);

          const surplus = remaining - Math.floor(remaining / 1000) * 1000;

          const reference = timer.timeline[b] - remaining;

          timer.sync(reference);

          jest.advanceTimersByTime(surplus);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe(b % 2 === 0 ? 'running' : 'break');
          expect(timer.state.time).toBe(remaining - surplus);

          jest.advanceTimersByTime(1000);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe(b % 2 === 0 ? 'running' : 'break');
          expect(timer.state.time).toBe(remaining - surplus - 1000);
        }
      );
    });

    describe('Without auto-start', () => {
      beforeAll(() => {
        timer.settings.autoStart = false;
      });

      test.each([[0], [500], [999], [1000], [2500], [15000]])(
        'The correct period, status, and time are applied',
        (remaining) => {
          jest.useFakeTimers();

          timer.buildTimeline();
          timer.state.period = 0;

          const surplus = remaining - Math.floor(remaining / 1000) * 1000;
          const reference = timer.timeline[0] - remaining;

          timer.sync(reference);

          jest.advanceTimersByTime(surplus);

          expect(timer.state.period).toBe(0);
          expect(timer.state.status).toBe('running');
          expect(timer.state.time).toBe(remaining - surplus);
        }
      );

      test.each([[0], [500], [999]])(
        'Delays do not occur when a correction leads to a transition and time is 0 <= x < 1000',
        (remaining) => {
          jest.useFakeTimers();

          timer.buildTimeline();
          timer.state.period = 0;

          const surplus = remaining - Math.floor(remaining / 1000) * 1000;
          const reference = timer.timeline[0] - remaining;

          timer.sync(reference);

          jest.advanceTimersByTime(surplus);

          expect(timer.state.period).toBe(0);
          expect(timer.state.status).toBe('running');
          expect(timer.state.time).toBe(0);

          jest.advanceTimersByTime(1000);

          expect(timer.state.period).toBe(1);
          expect(timer.state.status).toBe('break');
          expect(timer.state.time).toBe(timer.settings.breakTime);
        }
      );

      test('A correction does not lead to a transition if x is a 1000 or greater', () => {
        jest.useFakeTimers();

        timer.buildTimeline();
        timer.state.period = 0;

        const surplus = 0;
        const reference = timer.timeline[0] - 1000;

        timer.sync(reference);

        jest.advanceTimersByTime(surplus);

        jest.advanceTimersByTime(1000);

        expect(timer.state.period).toBe(0);
        expect(timer.state.status).toBe('running');
        expect(timer.state.time).toBe(0);
      });
    });
  });
});
