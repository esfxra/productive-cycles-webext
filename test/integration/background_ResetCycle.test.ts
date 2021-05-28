import PubSub from "pubsub-js";
import { DEFAULT_SETTINGS } from "../../src/shared-constants";
import { Status } from "../../src/shared-types";
import { runBackground, simulateResetCycle, simulateStart } from "./test-utils";

describe("On reset (cycle only)", () => {
  describe("When the cycle is the first period, and it has not started", () => {
    let bridge;
    let timeline;

    beforeAll(() => {
      jest.useFakeTimers();
      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);
      simulateResetCycle(bridge);
    });

    afterAll(() => {
      PubSub.clearAllSubscriptions();
      jest.clearAllTimers();
    });

    test("The timeline index remains at 0", () => {
      expect(timeline.index).toBe(0);
    });

    test("The current cycle's status remains as Initial", () => {
      expect(timeline.current.state.status).toBe(Status.Initial);
    });
  });

  describe("When the cycle is after the first period, and it has not started", () => {
    let bridge;
    let timeline;

    let previousIndex = 0;

    beforeAll(() => {
      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

      // Simulate ending the first cycle
      timeline.periods[0].status = Status.Complete;
      timeline.periods[0].remaining = 0;
      // Simulate ending the first break
      timeline.periods[1].status = Status.Complete;
      timeline.periods[1].remaining = 0;
      // Simulate that the current period is the second cycle
      timeline.index = 2;
      timeline.current.status = Status.Initial;

      // Save the current index value
      previousIndex = timeline.index;

      // Publish 'reset cycle' command
      simulateResetCycle(bridge);
    });

    test("The timeline index is changed to the previous cycle (- 2 indexes)", () => {
      expect(timeline.index).toBe(previousIndex - 2);
    });

    test("The previous break's status is reset to Initial", () => {
      expect(timeline.periods[previousIndex - 1].status).toBe(Status.Initial);
    });

    test("The previous breaks's remaining time is reset to the initial duration", () => {
      expect(timeline.periods[previousIndex - 1].remaining).toBe(
        DEFAULT_SETTINGS.breakMinutes * 60000
      );
    });

    test("The new current cycle' status is reset to Initial", () => {
      expect(timeline.current.state.status).toBe(Status.Initial);
    });

    test("The new current cycle' remaining time is reset to the initial duration", () => {
      expect(timeline.current.remaining).toBe(
        DEFAULT_SETTINGS.cycleMinutes * 60000
      );
    });
  });

  describe("When the cycle is running", () => {
    let bridge;
    let timeline;

    beforeEach(() => {
      // Setup
      jest.useFakeTimers();
      const TIME_PASSED = 1000; // Arbitrary value

      [bridge, timeline] = runBackground(DEFAULT_SETTINGS);

      // Simulate running the cycle and timer
      simulateStart(bridge);
      jest.advanceTimersByTime(TIME_PASSED);

      // Publish 'reset cycle' command
      simulateResetCycle(bridge);
    });

    afterEach(() => {
      jest.clearAllTimers();
      PubSub.clearAllSubscriptions();
    });

    test("The current cycle's status is reset to Initial", () => {
      expect(timeline.current.state.status).toBe(Status.Initial);
    });

    test("The timer stopped, and the remaining is reset to the initial duration", () => {
      const TIME_PASSED = 1000; // Arbitrary value

      jest.advanceTimersByTime(TIME_PASSED);

      expect(timeline.current.remaining).toBe(
        DEFAULT_SETTINGS.cycleMinutes * 60000
      );
    });
  });

  describe.skip("When the cycle is paused", () => {
    test("The cycle's status is reset to Initial", () => {
      expect(manager.current.status).toBe(Status.Initial);
    });
    test("The cycle's remaining time is reset to the initial duration", () => {
      expect(manager.current.remaining).toBe(
        DEFAULT_SETTINGS.cycleMinutes * 60000
      );
    });
  });
});
