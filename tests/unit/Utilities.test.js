"use strict";

import { Utilities } from "../../src/background/Utilities";

describe("Time Parser", () => {
  test.each([
    [60000, 1],
    [2100000, 35],
    [3600000, 60],
    [5940000, 99],
  ])("Extracts minutes from a duration in milliseconds", (ms, min) => {
    const result = Utilities.msToMin(ms);
    expect(result).toBe(min);
  });

  test.each([
    [55000, 55],
    [75000, 15],
    [3659000, 59],
    [5940000, 0],
  ])("Extracts seconds from a duration in milliseconds", (ms, sec) => {
    const result = Utilities.msToSec(ms);
    expect(result).toBe(sec);
  });

  test.each([
    [1000, "00:01"],
    [59000, "00:59"],
    [59999, "00:59"],
    [60000, "01:00"],
    [60999, "01:00"],
    [3599000, "59:59"],
    [3600000, "60:00"],
    [3601000, "60:01"],
    [5999000, "99:59"],
  ])("Parses a duration in milliseconds to a string MM:SS", (ms, mmss) => {
    const result = Utilities.parseMs(ms);
    expect(result).toBe(mmss);
  });
});

describe("Period Mapper", () => {
  test.each([
    [0, 1],
    [4, 3],
    [12, 7],
    [22, 12],
  ])("Maps period %i to cycle %i", (period, cycle) => {
    const result = Utilities.mapCycle(period);
    expect(result).toBe(cycle);
  });

  test.each([
    [1, 1],
    [5, 3],
    [13, 7],
    [21, 11],
  ])("Maps period %i to break %i", (period, breakVal) => {
    const result = Utilities.mapBreak(period);
    expect(result).toBe(breakVal);
  });
});
