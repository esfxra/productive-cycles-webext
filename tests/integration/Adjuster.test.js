"use strict";

import { Adjuster } from "../../src/background/Adjuster.js";
import { Timer } from "../../src/background/Timer.js";

describe("Adjuster", () => {
  let timer;
  const settings = {
    autoStart: { cycles: false, breaks: false },
    cycleTime: 10 * 60000,
    breakTime: 5 * 60000,
    totalPeriods: 7,
  };
  beforeEach(() => {
    timer = new Timer();
    timer.init(settings);
    timer.notify = jest.fn();
  });

  describe("When the current period is adjusted", () => {
    let spy;
    beforeEach(() => {
      jest.useFakeTimers();
      spy = jest.fn();
    });

    test("Determines the correct time adjustment", async () => {
      timer.start();
      const offset = 5000;
      const reference = timer.periods.current.target - offset;

      Adjuster.adjust(timer, reference).then(spy);
      jest.advanceTimersByTime(0);

      await Promise.resolve();

      expect(timer.periods.current.remaining).toBe(5000);
      expect(spy).toHaveBeenCalled();
    });

    test("Handles surplus milliseconds with a timeout", async () => {
      timer.start();
      const offset = 5000;
      const surplus = 500;
      const reference = timer.periods.current.target - offset - surplus;

      Adjuster.adjust(timer, reference).then(spy);
      jest.advanceTimersByTime(surplus);

      await Promise.resolve();

      expect(timer.periods.current.remaining).toBe(5000);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("When the actual period is found and adjusted", () => {
    let spy;
    beforeEach(() => {
      jest.useFakeTimers();
      spy = jest.fn();
    });

    describe("When autoStart is { cycles: false, breaks: false }", () => {
      test("Ends the 1st cycle", async () => {
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.timeline[0].status).toBe("complete");
        expect(timer.periods.timeline[0].remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });

      test("Does not start the 1st break", async () => {
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        jest.advanceTimersByTime(1000);

        expect(timer.periods.timeline[1].status).toBe("initial");
        expect(timer.periods.timeline[1].remaining).toBe(settings.breakTime);
        expect(spy).toHaveBeenCalled();
      });

      test("Ends the timer if the period is the last cycle", async () => {
        timer.periods.index = 6;
        timer.start();
        const offset = 5000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.runAllTimers();

        await Promise.resolve();

        expect(timer.periods.current.status).toBe("complete");
        expect(timer.periods.current.remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe("When autoStart is { cycles: false, breaks: true }", () => {
      beforeEach(() => {
        timer.settings.autoStart = { cycles: false, breaks: true };
      });

      test("Ends the 1st cycle", async () => {
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.timeline[0].status).toBe("complete");
        expect(timer.periods.timeline[0].remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });

      test("Starts the 1st break", async () => {
        timer.start();
        const offset = 1000;
        const delay = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(1000);

        await Promise.resolve();

        expect(timer.periods.timeline[1].status).toBe("running");
        expect(timer.periods.timeline[1].remaining).toBe(
          settings.breakTime - delay
        );
        expect(spy).toHaveBeenCalled();
      });

      test("Ends the timer if the period is the last cycle", async () => {
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.runAllTimers();

        await Promise.resolve();

        expect(timer.periods.current.status).toBe("complete");
        expect(timer.periods.current.remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe("When autoStart is { cycles: true, breaks: false }", () => {
      beforeEach(() => {
        timer.settings.autoStart = { cycles: true, breaks: false };
      });

      test("Ends the 1st cycle", async () => {
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.timeline[0].status).toBe("complete");
        expect(timer.periods.timeline[0].remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });

      test("Does not start the 1st break", async () => {
        timer.start();
        const offset = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(1000);

        await Promise.resolve();

        expect(timer.periods.timeline[1].status).toBe("initial");
        expect(timer.periods.timeline[1].remaining).toBe(settings.breakTime);
        expect(spy).toHaveBeenCalled();
      });

      test("Starts the 2nd cycle if the timer is running a break", async () => {
        timer.periods.index = 1;
        timer.start();
        const offset = 1000;
        const delay = 1000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(1000);

        await Promise.resolve();

        expect(timer.periods.timeline[2].status).toBe("running");
        expect(timer.periods.timeline[2].remaining).toBe(
          settings.cycleTime - delay
        );
        expect(spy).toHaveBeenCalled();
      });

      test("Ends the timer if the period is the last cycle", async () => {
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.runAllTimers();

        await Promise.resolve();

        expect(timer.periods.current.status).toBe("complete");
        expect(timer.periods.current.remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe("When autoStart is { cycles: true, breaks: true }", () => {
      beforeEach(() => {
        timer.settings.autoStart = { cycles: true, breaks: true };
      });

      test("Ends skipped periods", async () => {
        timer.start();
        const offset = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.timeline[0].status).toBe("complete");
        expect(timer.periods.timeline[0].remaining).toBeLessThanOrEqual(0);

        expect(timer.periods.timeline[1].status).toBe("complete");
        expect(timer.periods.timeline[1].remaining).toBeLessThanOrEqual(0);

        expect(timer.periods.timeline[2].status).toBe("complete");
        expect(timer.periods.timeline[2].remaining).toBeLessThanOrEqual(0);

        expect(timer.periods.timeline[3].status).toBe("complete");
        expect(timer.periods.timeline[3].remaining).toBeLessThanOrEqual(0);

        expect(spy).toHaveBeenCalled();
      });

      test("Adjusts the period properly", async () => {
        timer.start();
        const offset = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.current.id).toBe(4);
        expect(spy).toHaveBeenCalled();
      });

      test("Adjusts the status and time of new period properly", async () => {
        timer.start();
        const offset = 5000;
        const delay = 1000;
        const reference = timer.periods.timeline[3].target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.advanceTimersByTime(0);

        await Promise.resolve();

        expect(timer.periods.current.status).toBe("running");
        expect(timer.periods.current.remaining).toBe(
          settings.cycleTime - offset + delay
        );
        expect(spy).toHaveBeenCalled();
      });

      test("Ends the timer if the period is the last cycle", async () => {
        timer.settings.autoStart = { cycles: true, breaks: true };
        timer.periods.index = 6;
        timer.start();
        const offset = 10000;
        const reference = timer.periods.current.target + offset;

        Adjuster.adjust(timer, reference).then(spy);
        jest.runAllTimers();

        await Promise.resolve();

        expect(timer.periods.current.status).toBe("complete");
        expect(timer.periods.current.remaining).toBeLessThanOrEqual(0);
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
