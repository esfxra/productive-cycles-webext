"use strict";

import { Cycle, Break } from "../../src/background/Period";

describe("Cycles", () => {
  const config = { id: 0, duration: 1000 };
  let cycle;
  beforeEach(() => {
    cycle = new Cycle(config.id, config.duration, config.target);
  });

  describe("Instantiation", () => {
    test("Instantiates a new cycle", () => {
      expect(cycle.id).toBe(0);
      expect(cycle.duration).toBe(1000);
      expect(cycle.remaining).toBe(1000);
    });
  });

  describe("Status setters", () => {
    test("Starts", () => {
      cycle.start();
      expect(cycle.status).toBe("running");
    });

    test("Pauses", () => {
      cycle.pause();
      expect(cycle.status).toBe("paused");
    });

    test("Resets", () => {
      cycle.reset({ cycleTime: 1000 });
      expect(cycle.status).toBe("initial");
    });

    test("Ends", () => {
      cycle.end();
      expect(cycle.status).toBe("complete");
    });
  });

  describe("Autostart setter", () => {
    test("Updates enabled with autostart cycle setting", () => {
      cycle.enabled = false;
      cycle.autoStart({ cycles: true, breaks: false });

      expect(cycle.enabled).toBe(true);
    });
  });

  describe("Getters", () => {
    test("Confirms this period is a cycle", () => {
      expect(cycle.isCycle).toBe(true);
    });

    test("Calculates actual time with reference", () => {
      const reference = Date.now();
      const offset = 1000;
      cycle.target = reference + offset;

      expect(cycle.actual(reference)).toBe(offset);
    });

    test("Adjusts remaining by rounding down actual time", () => {
      const reference = Date.now();
      const surplus = 300;
      const offset = 1000 + surplus;
      cycle.target = reference + offset;

      const result = cycle.adjust(reference);

      expect(cycle.remaining).toBe(offset - surplus);
      expect(result).toBe(surplus);
    });
  });
});

describe("Breaks", () => {
  const config = { id: 1, duration: 1000 };
  let _break;
  beforeEach(() => {
    _break = new Break(config.id, config.duration, config.target);
  });

  describe("Instantiation", () => {
    test("Instantiates a new break", () => {
      expect(_break.id).toBe(1);
      expect(_break.duration).toBe(1000);
      expect(_break.remaining).toBe(1000);
    });
  });

  describe("Status setters", () => {
    test("Starts", () => {
      _break.start();
      expect(_break.status).toBe("running");
    });

    test("Skips", () => {
      _break.skip();
      expect(_break.status).toBe("complete");
    });

    test("Resets", () => {
      _break.reset({ breakTime: 1000 });
      expect(_break.status).toBe("initial");
    });

    test("Ends", () => {
      _break.end();
      expect(_break.status).toBe("complete");
    });
  });

  describe("Autostart setter", () => {
    test("Updates enabled with autostart break setting", () => {
      _break.enabled = false;
      _break.autoStart({ cycles: false, breaks: true });

      expect(_break.enabled).toBe(true);
    });
  });

  describe("Getters", () => {
    test("Confirms this period is not a cycle", () => {
      expect(_break.isCycle).toBe(false);
    });

    test("Calculates actual time with reference", () => {
      const reference = Date.now();
      const offset = 1000;
      _break.target = reference + offset;

      expect(_break.actual(reference)).toBe(offset);
    });

    test("Adjusts remaining by rounding down actual time", () => {
      const reference = Date.now();
      const surplus = 300;
      const offset = 1000 + surplus;
      _break.target = reference + offset;

      const result = _break.adjust(reference);

      expect(_break.remaining).toBe(offset - surplus);
      expect(result).toBe(surplus);
    });
  });
});
