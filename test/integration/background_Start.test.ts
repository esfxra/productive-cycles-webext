import PubSub from "pubsub-js";
import { DEFAULT_SETTINGS } from "../../src/shared-constants";
import { Status } from "../../src/shared-types";
import { runBackground, simulateStart } from "./test-utils";

const [bridge, manager, timer] = runBackground(DEFAULT_SETTINGS);

describe("On start", () => {
  const TIME_PASSED = 5000;

  beforeAll(() => {
    // Simulate the timer running, and then a 'pause' command to stop it
    jest.useFakeTimers();
    // Publish 'start' command, and advance the timer
    simulateStart(bridge);
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
    expect(manager.state.status).toBe(Status.Running);
    expect(manager.state.index).toBe(0);
  });

  test.skip("Start command is not allowed to be called twice (mutex behavior)", () => {
    // Pending implementation
  });
});
