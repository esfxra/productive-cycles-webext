import PubSub from "pubsub-js";
import { Bridge } from "../../src/background/Bridge";
import { Manager } from "../../src/background/Manager";
import { Timer } from "../../src/background/Timer";
import { DEFAULT_SETTINGS } from "../../src/background/utils/constants";

const TIME_PASSED = 5000;

let bridge: Bridge;
let manager: Manager;
let timer: Timer;

describe("On start", () => {
  beforeAll(() => {
    bridge = new Bridge();
    manager = new Manager(DEFAULT_SETTINGS);
    timer = new Timer();

    bridge.registerSubscriptions();
    manager.registerSubscriptions();
    timer.registerSubscriptions();

    jest.useFakeTimers();
    bridge.handlePortMessages({ command: "start" });

    jest.advanceTimersByTime(TIME_PASSED);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
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
    expect(manager.state.status).toBe("running");
    expect(manager.state.periodIndex).toBe(0);
  });
});

describe("On pause", () => {
  let remainingBefore = 0;

  beforeAll(() => {
    bridge = new Bridge();
    manager = new Manager(DEFAULT_SETTINGS);
    timer = new Timer();

    bridge.registerSubscriptions();
    manager.registerSubscriptions();
    timer.registerSubscriptions();

    jest.useFakeTimers();
    bridge.handlePortMessages({ command: "start" });

    jest.advanceTimersByTime(TIME_PASSED);

    remainingBefore = manager.current.remaining;

    bridge.handlePortMessages({ command: "pause" });

    jest.advanceTimersByTime(2000);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
  });
  test("Status is updated properly", () => {
    expect(manager.current.status).toBe("paused");
  });
  test("Period index is not modified", () => {
    expect(manager.periodIndex).toBe(0);
  });
  test("Remaining time is not modified even if time passes", () => {
    expect(manager.current.remaining).toBe(remainingBefore);
  });
});
