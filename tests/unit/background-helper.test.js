import {
  NotificationInterface,
  Utilities,
} from '../../src/background/background-helper.js';

describe.skip('Notification Interface', () => {
  // Important: Improve these tests in the future using pattern matching
  // Add a test for send() that tests the sound check, and whether it is played or not

  let Notifications;
  beforeAll(() => (Notifications = new NotificationInterface()));

  test('Cycle complete notification is built correctly', () => {
    const state = { period: 0, status: 'running' };
    const settings = { breakTime: 120000, autoStart: true };

    const result = Notifications.build(state, settings);

    expect(result.id).toBe(`${Notifications.idTemplate}-${state.period}`);
    expect(result.title).toContain(1);
    expect(result.message).toContain(2);
  });

  test('Break complete notification is built correctly w/o autoStart', () => {
    const state = { period: 3, status: 'break' };
    const settings = { breakTime: 120000, autoStart: false };

    const result = Notifications.build(state, settings);

    expect(result.id).toBe(`${Notifications.idTemplate}-${state.period}`);
    expect(result.title).toContain(2);
    expect(result.message).toContain("Don't forget to start");
  });

  test('Break complete notification is built correctly w/ autoStart', () => {
    const state = { period: 3, status: 'break' };
    const settings = { breakTime: 120000, autoStart: true };

    const result = Notifications.build(state, settings);

    expect(result.id).toBe(`${Notifications.idTemplate}-${state.period}`);
    expect(result.title).toContain(2);
    expect(result.message).toContain('Starting');
  });

  test('Timer complete notification is built correctly', () => {
    const state = { period: 6, status: 'complete' };
    const settings = { breakTime: 120000, autoStart: true };

    const result = Notifications.build(state, settings);

    expect(result.id).toBe(`${Notifications.idTemplate}-${state.period}`);
    expect(result.title).toContain('You did it');
    expect(result.message).toContain('long break');
  });

  test('Clear function calls the chrome API', () => {
    chrome.notifications.clear = jest.fn();

    Notifications.clear(1);

    expect(chrome.notifications.clear).toHaveBeenCalledTimes(1);
  });

  test('ClearAll function is called the right number of times', () => {
    const clear = jest.spyOn(Notifications, 'clear');

    Notifications.clearAll(4);

    expect(clear).toHaveBeenCalledTimes(4);
  });
});

describe.skip('Milliseconds Parser', () => {
  test.each([
    [60000, 1],
    [2100000, 35],
    [3600000, 60],
    [5940000, 99],
  ])('Can correctly take the duration %i and extract %i minutes', (ms, min) => {
    const result = Utilities.msToMin(ms);
    expect(result).toBe(min);
  });

  test.each([
    [55000, 55],
    [75000, 15],
    [3659000, 59],
    [5940000, 0],
  ])('Can correctly take the duration %i and extract %i seconds', (ms, sec) => {
    const result = Utilities.msToSec(ms);
    expect(result).toBe(sec);
  });

  test.each([
    [1000, '00:01'],
    [59000, '00:59'],
    [59999, '00:59'],
    [60000, '01:00'],
    [60999, '01:00'],
    [3599000, '59:59'],
    [3600000, '60:00'],
    [3601000, '60:01'],
    [5999000, '99:59'],
  ])('Can correctly parse %i to the string %s', (ms, mmss) => {
    const result = Utilities.parseMs(ms);
    expect(result).toBe(mmss);
  });
});

describe.skip('Period Maps', () => {
  test.each([
    [0, 1],
    [4, 3],
    [12, 7],
    [22, 12],
  ])('Period %i is mapped correctly to cycle %i', (period, cycle) => {
    const result = Utilities.mapCycle(period);
    expect(result).toBe(cycle);
  });

  test.each([
    [1, 1],
    [5, 3],
    [13, 7],
    [21, 11],
  ])('Period %i is mapped correctly to break %i', (period, breakVal) => {
    const result = Utilities.mapBreak(period);
    expect(result).toBe(breakVal);
  });
});
