import PubSub from "pubsub-js";
import { Bridge } from "../../src/background/Bridge";
import { Manager } from "../../src/background/Manager";
import { Timer } from "../../src/background/Timer";
import { DEFAULT_SETTINGS } from "../../src/background/utils/constants";
import { Input, Status } from "../../src/background/utils/types";

let bridge: Bridge;
let manager: Manager;
let timer: Timer;

describe("On start", () => {
  const TIME_PASSED = 5000;

  beforeAll(() => {
    // Simulate the timer running

    jest.useFakeTimers();
    [bridge, manager, timer] = _runBackground();
    // Publish 'start' command through bridge
    bridge.handlePortMessages({ command: Input.Start });
    // Advance Timer interval
    jest.advanceTimersByTime(TIME_PASSED);
  });

  afterAll(() => {
    PubSub.clearAllSubscriptions();
    jest.clearAllTimers();
  });

  test("Remaining time in Timer matches current period", () => {
    const expected = DEFAULT_SETTINGS.cycleMinutes * 60000 - TIME_PASSED;
    expect(timer.remaining).toBe(expected);
    expect(manager.current.remaining).toBe(expected);
  });

  test("Timeline targets are properly calculated", () => {
    const cycleMillis = DEFAULT_SETTINGS.cycleMinutes * 60000;
    const breakMillis = DEFAULT_SETTINGS.breakMinutes * 60000;

    const reference = Date.now();
    const TARGET_THRESHOLD = 50;

    const target1 = reference + cycleMillis;
    const target2 = target1 + breakMillis;
    const target3 = target2 + cycleMillis;
    const target4 = target3 + breakMillis;
    const target5 = target4 + cycleMillis;
    const target6 = target5 + breakMillis;
    const target7 = target6 + cycleMillis;

    const expected = [
      target1,
      target2,
      target3,
      target4,
      target5,
      target6,
      target7,
    ];

    manager.timeline.periods.forEach((period, idx) => {
      const lowerLimit = expected[idx] - TARGET_THRESHOLD;
      const upperLimit = expected[idx] + TARGET_THRESHOLD;

      expect(period.target).toBeGreaterThanOrEqual(lowerLimit);
      expect(period.target).toBeLessThanOrEqual(upperLimit);
    });
  });

  test("Timeline periods are updated per default settings", () => {
    manager.timeline.periods.forEach((period) => {
      expect(period.enabled).toBe(true);
    });
  });

  test("Manager state is updated properly", () => {
    expect(manager.state.remaining).toBe("24:55");
    expect(manager.state.status).toBe(Status.Running);
    expect(manager.state.index).toBe(0);
  });
});

describe("On pause", () => {
  const TIME_PASSED = 5000;
  let remainingBefore = 0;
  let indexBefore = 0;

  beforeAll(() => {
    // Simulate the timer running, and then a 'pause' command to stop it

    jest.useFakeTimers();
    [bridge, manager, timer] = _runBackground();
    // Publish 'start' command through bridge
    bridge.handlePortMessages({ command: Input.Start });
    // Advance Timer interval
    jest.advanceTimersByTime(TIME_PASSED);
    // Save the current value of remaining
    remainingBefore = manager.current.remaining;
    indexBefore = manager.timeline.index;
    // Publish 'stop' command through bridge
    bridge.handlePortMessages({ command: Input.Pause });
    jest.advanceTimersByTime(2000);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
  });

  test("Status is updated properly", () => {
    expect(manager.current.status).toBe(Status.Paused);
  });

  test("Period index is not modified", () => {
    expect(manager.timeline.index).toBe(indexBefore);
  });

  test("Remaining time is not modified even if time passes", () => {
    expect(manager.current.remaining).toBe(remainingBefore);
  });
});

// describe("On skip (breaks only)", () => {
//   let remainingBefore: number;
//   let indexBefore: number;
//   let statusBefore: string;

//   beforeAll(() => {
//     // Simulate the timer running on a break, and then skip it
//     const PERIOD_TIME_OFFSET = 10000;

//     jest.useFakeTimers();
//     [bridge, manager, timer] = _runBackground();
//     // Publish 'start' command through bridge
//     bridge.handlePortMessages({ command: "start" });
//     // Advance the timer by the whole duration of a cycle, plus an offset to make it to the next period
//     // This could be replaced by the current period's 'end' routine ... IF one is implemented
//     jest.advanceTimersByTime(
//       manager.settings.cycleMinutes * 60000 + PERIOD_TIME_OFFSET
//     );
//     // Assume autoStart is enabled, and that the break will start
//     remainingBefore = manager.current.remaining;
//     indexBefore = manager.periodIndex;
//     statusBefore = manager.current.status;
//     // Skip the break
//     bridge.handlePortMessages({ command: "skip" });
//   });

//   test.skip("Stops the timer", () => {
//     const TIME_PASSED = 5000;
//     const before = timer.remaining;
//     jest.advanceTimersByTime(TIME_PASSED);
//     expect(timer.remaining).toBe(before);
//   });

//   test("Ends the current period", () => {
//     const period = manager.timeline.periods[indexBefore];
//     expect(period.status).toBe("complete");
//   });

//   test("Updates the current period index", () => {
//     expect(manager.timeline.index).toBe(indexBefore + 1);
//   });

//   test("Induces a timer run if the next period is enabled", () => {});

//   afterAll(() => {});
// });

// describe("On reset (cycle only)", () => {});

// describe("On reset all", () => {});

function _runBackground(): [Bridge, Manager, Timer] {
  // Simulate the main runBackground function without the browser listeners
  const bridge = new Bridge();
  const manager = new Manager(DEFAULT_SETTINGS);
  const timer = new Timer();

  bridge.registerSubscriptions();
  manager.registerSubscriptions();
  timer.registerSubscriptions();

  return [bridge, manager, timer];
}
