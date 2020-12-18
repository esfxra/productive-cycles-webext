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
