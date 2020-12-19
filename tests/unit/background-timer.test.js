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
  const subtractSeconds = (seconds) => {
    let i = 1;
    while (i <= seconds) {
      jest.advanceTimersByTime(1000);
      i += 1;
    }
  };

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

  test('Subtracts 1 second immediately after call', () => {
    timer.state.time = 10000;
    timer.runSubtractor();
    expect(timer.state.time).toBe(9000);
  });

  test('Subtracts seconds according to time passed', () => {
    timer.state.time = 10000;
    timer.runSubtractor();

    expect(timer.state.time).toBe(9000);

    subtractSeconds(4);
    expect(timer.state.time).toBe(5000);

    subtractSeconds(5);
    expect(timer.state.time).toBe(0);
  });

  test('Posts state 1 time after 1st subtraction', () => {
    timer.state.time = 1000;
    timer.runSubtractor();

    // ONLY takes into account the call outside the interval
    expect(postState).toHaveBeenCalledTimes(1);
  });

  test('Posts state according to time passed', () => {
    const seconds = 10;
    timer.state.time = seconds * 1000;
    timer.runSubtractor();

    subtractSeconds(seconds);

    // ALSO takes into account the call outside the interval
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

    subtractSeconds(seconds);
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
  beforeAll(() => {
    timer = new Timer(defaultValues);
  });
  beforeEach(() => {
    timer.resetAll();
  });

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
