import { Bridge } from "../../src/background/Bridge";
import { Manager } from "../../src/background/Manager";
import { Timer } from "../../src/background/Timer";
import { DEFAULT_SETTINGS } from "../../src/shared-constants";

let bridge: Bridge;
let manager: Manager;
let timer: Timer;

describe("State Manager and Timeline", () => {
  beforeAll(() => {
    manager = new Manager(DEFAULT_SETTINGS);
  });

  test("Timeline has the right number of periods", () => {
    expect(manager.timeline.periods).toHaveLength(7);
  });

  test("Timeline periods have the right duration", () => {
    const cycleDuration = DEFAULT_SETTINGS.cycleMinutes * 60000;
    const breakDuration = DEFAULT_SETTINGS.breakMinutes * 60000;

    manager.timeline.periods.forEach((period, idx) => {
      const expected = idx % 2 === 0 ? cycleDuration : breakDuration;
      expect(period.remaining).toBe(expected);
    });
  });

  test("Timeline periods are initially disabled", () => {
    manager.timeline.periods.forEach((period) => {
      expect(period.enabled).toBe(false);
    });
  });
});
