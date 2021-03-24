"use strict";

import { Notifications } from "../../src/background/Notifications";

describe("Notifications API", () => {
  test("Builds a notification for completed cycles", () => {
    const period = 0;
    const breakTime = 1000;

    const notification = Notifications.build(period, breakTime, "cycle");

    expect(notification.title).toMatch(/Cycle/);
  });

  test("Builds a notification for completed breaks", () => {
    const period = 1;
    const breakTime = 1000;

    const notification = Notifications.build(period, breakTime, "break");

    expect(notification.title).toMatch(/Break/);
  });

  test("Builds a notification for a completed timer", () => {
    const period = 6;
    const breakTime = 1000;

    const notification = Notifications.build(period, breakTime, "complete");

    expect(notification.title).toMatch(/complete/);
  });
});
