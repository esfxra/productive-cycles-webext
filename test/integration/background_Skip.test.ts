import PubSub from "pubsub-js";
import { DEFAULT_SETTINGS } from "../../src/shared-constants";
import { Status } from "../../src/shared-types";
import { runBackground, simulateStart, simulateSkip } from "./test-utils";

const [bridge, manager, timer] = runBackground(DEFAULT_SETTINGS);

describe.skip("On skip (breaks only)", () => {
  const PERIOD_TIME_OFFSET = 10000;
  let previousIndex: number;

  beforeAll(() => {
    // Simulate the timer running on a break, and then skip it
    jest.useFakeTimers();
    // Publish 'start' command through bridge
    simulateStart(bridge);
    // Advance the timer by the whole duration of a cycle, plus an offset to make it to the next period
    jest.advanceTimersByTime(
      manager.settings.cycleMinutes * 60000 + PERIOD_TIME_OFFSET
    );
    // Assume autoStart is enabled, and that the break will start
    previousIndex = manager.timeline.index;
    // Skip the break
    simulateSkip(bridge);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
  });

  test("Stops the timer", () => {
    // Arbitrary value to advance time by
    const TIME_PASSED = 5000;
    // Save the value of remaining time before advancing timer
    const previous = timer.remaining;

    jest.advanceTimersByTime(TIME_PASSED);

    expect(timer.remaining).toBe(previous);
  });

  test("Ends the break that was skipped", () => {
    const previousPeriod = manager.timeline.periods[previousIndex];
    expect(previousPeriod.status).toBe(Status.Complete);
  });

  test("The current period index was advanced by 1", () => {
    expect(manager.timeline.index).toBe(previousIndex + 1);
  });

  test.skip("Induces a timer run per default settings since the next period is enabled", () => {
    // Pending implementation
  });
});
