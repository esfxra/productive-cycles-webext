import PubSub from "pubsub-js";
import { DEFAULT_SETTINGS } from "../../src/shared-constants";
import { Status } from "../../src/shared-types";
import { runBackground, simulateStart, simulatePause } from "./test-utils";

const [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

describe.skip("On pause", () => {
  const TIME_PASSED = 5000;
  let previousRemaining = 0;
  let previousIndex = 0;

  beforeAll(() => {
    // Simulate the timer running, and then a 'pause' command to stop it
    jest.useFakeTimers();
    // Publish 'start' command, and advance the timer
    simulateStart(bridge);
    jest.advanceTimersByTime(TIME_PASSED);
    // Save the current value of remaining
    previousRemaining = timeline.current.remaining;
    previousIndex = timeline.index;
    // Publish 'stop' command
    simulatePause(bridge);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
  });

  test("Status is updated properly", () => {
    expect(timeline.current.state.status).toBe(Status.Paused);
  });

  test("Period index is not modified", () => {
    expect(timeline.current.state.index).toBe(previousIndex);
  });

  test("Remaining time is not modified even if time passes", () => {
    expect(timeline.current.state.remaining).toBe(previousRemaining);
  });
});
