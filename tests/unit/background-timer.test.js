import { Timer } from '../../src/background/background-timer.js';
const defaultValues = {
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
  autoStart: true,
};

describe('Timeline', () => {
  let timer;
  let buildTimeline;
  beforeAll(() => {
    timer = new Timer(defaultValues);
    buildTimeline = jest.spyOn(timer, 'buildTimeline');
  });
  beforeEach(() => {
    timer.resetAll();
    buildTimeline.mockClear();
  });

  test('Fills the array', () => {
    expect(timer.timeline.length).toBe(0);

    timer.buildTimeline();

    expect(timer.timeline.length).not.toBe(0);
  });

  test('Fills the array with the proper timestamps', () => {
    const reference = Date.now();

    timer.buildTimeline();

    const testTimeline = [];
    testTimeline[0] = reference + timer.settings.cycleTime;
    testTimeline[1] = testTimeline[0] + timer.settings.breakTime;
    testTimeline[2] = testTimeline[1] + timer.settings.cycleTime;
    testTimeline[3] = testTimeline[2] + timer.settings.breakTime;
    testTimeline[4] = testTimeline[3] + timer.settings.cycleTime;
    testTimeline[5] = testTimeline[4] + timer.settings.breakTime;
    testTimeline[6] = testTimeline[5] + timer.settings.cycleTime;

    expect(timer.timeline).toEqual(testTimeline);
  });

  test('Gets built when ther timer is started for the first time', () => {
    timer.startCycle();

    expect(buildTimeline).toHaveBeenCalledTimes(1);
  });

  test('Gets built when the timer is paused', () => {
    timer.startCycle();
    timer.pauseCycle();
    timer.startCycle();

    expect(buildTimeline).toHaveBeenCalledTimes(2);
  });

  test('Gets built when a break is skipped and auto-start is enabled', () => {
    timer.state.period = 1;
    timer.state.time = 10000;
    timer.state.status = 'break';
    timer.settings.autoStart = true;

    timer.skipBreak();

    expect(buildTimeline).toHaveBeenCalledTimes(1);
  });

  test('Does not get built when a break is skipped and auto-start is enabled', () => {
    timer.state.period = 1;
    timer.state.time = 10000;
    timer.state.status = 'break';
    timer.settings.autoStart = false;

    timer.skipBreak();

    expect(buildTimeline).toHaveBeenCalledTimes(0);
  });
});

describe('Subtractor', () => {
  let timer;
  let runSubtractor;
  let postState;
  beforeAll(() => {
    timer = new Timer(defaultValues);
    runSubtractor = jest.spyOn(timer, 'runSubtractor');
    postState = jest.spyOn(timer, 'postState');
  });
  beforeEach(() => {
    timer.resetAll();
    runSubtractor.mockClear();
    postState.mockClear();
    jest.useFakeTimers();
  });

  test('Subtracts seconds according to time passed', () => {
    const seconds = 10;
    timer.state.time = seconds * 1000;
    timer.runSubtractor();

    jest.advanceTimersByTime(seconds * 1000);
    expect(timer.state.time).toBe(0);
  });

  test('Posts state according to time passed', () => {
    const seconds = 10;
    timer.state.time = seconds * 1000;
    timer.runSubtractor();

    jest.advanceTimersByTime(seconds * 1000);

    expect(postState).toHaveBeenCalledTimes(seconds);
  });

  test('Gets run when a cycle starts', () => {
    timer.startCycle();

    expect(runSubtractor).toHaveBeenCalledTimes(1);
  });

  test('Gets run when a break starts', () => {
    timer.startBreak();

    expect(runSubtractor).toHaveBeenCalledTimes(1);
  });

  test('Gets stopped when the time is less than 0', () => {
    const seconds = 10;
    timer.state.time = seconds * 1000;
    timer.runSubtractor();

    jest.advanceTimersByTime(seconds * 1000);
    expect(clearInterval).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  test('Gets stopped when a cycle is paused', () => {
    timer.pauseCycle();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  test('Gets stopped when a cycle is reset', () => {
    timer.resetCycle();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  test('Gets stopped when a break is skipped', () => {
    timer.skipBreak();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  test('Gets stopped when the timer is reset', () => {
    timer.resetAll();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });
});

describe('State Operations', () => {
  let timer;
  beforeAll(() => (timer = new Timer(defaultValues)));
  beforeEach(() => timer.resetAll());

  test('Can retrieve the current state with getState', () => {
    timer.state.period = 3;
    timer.state.time = 44000;
    timer.state.status = 'break';

    const test = {
      period: 3,
      time: 44000,
      status: 'break',
    };

    const result = timer.getState();

    expect(result).toEqual(test);
  });

  test('Can set the current state with setState', () => {
    const test = {
      period: 5,
      time: 10000,
      status: 'running',
    };

    timer.setState(test);

    expect(timer.state).toEqual(test);
  });

  test('Correctly formats the state before posting', () => {
    timer.state.period = 1;
    timer.state.time = 20000;
    timer.state.status = 'running';

    const result = timer.formatState();

    expect(result.period).toBe(1);
    expect(result.time).toBe('00:20');
    expect(result.status).toBe('running');
    expect(result.totalPeriods).toBe(7);
  });

  test('Posts the state if comms are open', () => {
    timer.comms.portOpen = true;
    timer.comms.port = {};
    timer.comms.port.postMessage = jest.fn();

    timer.postState();

    expect(timer.comms.port.postMessage).toHaveBeenCalledTimes(1);
  });

  test('Does not post the state if comms are open', () => {
    timer.comms.portOpen = false;
    timer.comms.port = {};
    timer.comms.port.postMessage = jest.fn();

    timer.postState();

    expect(timer.comms.port.postMessage).toHaveBeenCalledTimes(0);
  });
});

describe('Comms', () => {
  let timer;
  beforeAll(() => (timer = new Timer(defaultValues)));

  test('Port is initialized as closed', () => {
    expect(timer.comms.portOpen).toBe(false);
  });

  test('Port and portOpen can be updated properly', () => {
    const postMessage = jest.fn();
    const testPort = { postMessage: postMessage };

    timer.updatePort(testPort, true);

    // Using toBe because we want the identity to be the same
    expect(timer.comms.port).toBe(testPort);
    expect(timer.comms.portOpen).toBe(true);
  });
});

describe('Sync', () => {
  const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  let timer;
  beforeAll(() => (timer = new Timer(defaultValues)));
  beforeEach(() => timer.resetAll());

  test.each([['running'], ['break']])('Syncs if status is %s', (status) => {
    timer.state.status = status;
    const result = timer.sync();
    expect(result).toBe(true);
  });

  test.each([['initial'], ['paused'], ['complete']])(
    'Does not sync if status is %s',
    (status) => {
      timer.state.status = status;
      const result = timer.sync();
      expect(result).toBe(false);
    }
  );

  describe('With auto-start', () => {
    test('Corrects the state from an arbitrary period to timer complete', () => {
      timer.state.period = randomInt(0, 6);
      timer.buildTimeline();
      timer.state.status = timer.state.period % 2 === 0 ? 'running' : 'break';

      const reference = timer.timeline[6] + 1000;
      timer.sync(reference);

      expect(timer.state.period).toBe(7);
      expect(timer.state.time).toBe(0);
      expect(timer.state.status).toBe('complete');
    });

    describe('Cycle to Cycle corrections', () => {
      test.each([
        [0, 0],
        [0, 2],
        [0, 4],
        [0, 6],
        [2, 2],
        [2, 4],
        [2, 6],
        [4, 4],
        [4, 6],
        [6, 6],
      ])(
        'Corrects the state from period %i (cycle) to period %i (cycle)',
        (a, b) => {
          timer.state.period = a;
          timer.state.time = timer.settings.cycleTime;
          timer.state.status = 'running';
          timer.buildTimeline();

          const reference = timer.timeline[b] - 1000;
          timer.sync(reference);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe('running');

          expect(timer.state.time).toBeLessThanOrEqual(1000);
          expect(timer.state.time).toBeGreaterThanOrEqual(0);
        }
      );
    });

    describe('Break to Break corrections', () => {
      test.each([
        [1, 1],
        [1, 3],
        [1, 5],
        [3, 3],
        [3, 5],
        [5, 5],
      ])(
        'Corrects the state from period %i (break) to period %i (break)',
        (a, b) => {
          timer.state.period = a;
          timer.state.time = timer.settings.breakTime;
          timer.state.status = 'break';
          timer.buildTimeline();

          const reference = timer.timeline[b] - 1000;
          timer.sync(reference);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe('break');

          expect(timer.state.time).toBeLessThanOrEqual(1000);
          expect(timer.state.time).toBeGreaterThanOrEqual(0);
        }
      );
    });

    describe('Cycle to Break corrections', () => {
      test.each([
        [0, 1],
        [0, 3],
        [0, 5],
        [2, 3],
        [2, 5],
        [4, 5],
      ])(
        'Corrects the state from period %i (cycle) to period %i (break)',
        (a, b) => {
          timer.state.period = a;
          timer.state.time = timer.settings.cycleTime;
          timer.state.status = 'running';
          timer.buildTimeline();

          const reference = timer.timeline[b] - 1000;
          timer.sync(reference);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe('break');

          expect(timer.state.time).toBeLessThanOrEqual(1000);
          expect(timer.state.time).toBeGreaterThanOrEqual(0);
        }
      );
    });

    describe('Break to Cycle corrections', () => {
      test.each([
        [1, 2],
        [1, 4],
        [1, 6],
        [3, 4],
        [3, 6],
        [5, 6],
      ])(
        'Corrects the state from period %i (break) to period %i (cycle)',
        (a, b) => {
          timer.state.period = a;
          timer.state.time = timer.settings.breakTime;
          timer.state.status = 'break';
          timer.buildTimeline();

          const reference = timer.timeline[b] - 1000;
          timer.sync(reference);

          expect(timer.state.period).toBe(b);
          expect(timer.state.status).toBe('running');

          expect(timer.state.time).toBeLessThanOrEqual(1000);
          expect(timer.state.time).toBeGreaterThanOrEqual(0);
        }
      );
    });
  });

  describe('Without auto-start', () => {
    beforeAll(() => (timer.settings.autoStart = false));
    test('Corrects the time when still within the same period', () => {
      timer.state.period = 1;
      timer.state.time = timer.settings.breakTime;
      timer.state.status = 'break';
      timer.buildTimeline();

      const target = timer.timeline[timer.state.period] - 1000;
      timer.sync(target);

      expect(timer.state.period).toBe(1);
      expect(timer.state.time).toBe(1000);
      expect(timer.state.status).toBe('break');
    });

    test('Ends the current period when the corrected time is less than 0', () => {
      timer.state.period = 1;
      timer.state.time = timer.settings.breakTime;
      timer.state.status = 'break';
      timer.buildTimeline();

      const target = timer.timeline[timer.state.period] + 1000;
      timer.sync(target);

      expect(timer.state.period).toBe(2);
      expect(timer.state.time).toBe(timer.settings.cycleTime);
      expect(timer.state.status).toBe('initial');
    });
  });
});
