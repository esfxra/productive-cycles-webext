import PubSub from "pubsub-js";
import { Bridge } from "../../../src/background/Bridge";
import { Timeline } from "../../../src/background/Timeline";
import { DEFAULT_SETTINGS } from "../../../src/shared-constants";
import { Status } from "../../../src/shared-types";
import { runBackground, simulateStart } from "../test-utils";

let bridge: Bridge;
let timeline: Timeline;

describe("Cycle end", () => {
  let previousPeriod;

  beforeAll(() => {
    jest.useFakeTimers();
    [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

    // Simulate cycle end conditions
    simulateStart(bridge);
    // previousPeriod = timeline.current;
    jest.advanceTimersByTime(DEFAULT_SETTINGS.cycleMinutes * 60000 + 1000);
  });

  afterAll(() => {
    jest.clearAllTimers();
    PubSub.clearAllSubscriptions();
  });

  test("Cycle is marked as complete", () => {
    expect(timeline.periods[0].status).toBe(Status.Complete);
  });

  test("Index is updated", () => {
    expect(timeline.index).toBe(1);
    expect(timeline.current.id).toBe(1);
  });
});

// describe("Break end", () => {});
