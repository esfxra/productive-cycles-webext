'use strict';

import { Notifications } from '../../src/background/Notifications';

describe('Notifications API', () => {
  test('Builds a notification for completed cycles', () => {
    const period = 0;

    const notification = Notifications.build(period, 'cycle');

    expect(notification.title).toMatch(/Cycle/);
  });

  test('Builds a notification for completed breaks', () => {
    const period = 1;

    const notification = Notifications.build(period, 'break');

    expect(notification.title).toMatch(/Break/);
  });

  test('Builds a notification for a completed timer', () => {
    const period = 6;

    const notification = Notifications.build(period, 'complete');

    expect(notification.title).toMatch(/complete/);
  });

  test.skip('Builds a notification that reminds the user to check the timer', () => {});
});
