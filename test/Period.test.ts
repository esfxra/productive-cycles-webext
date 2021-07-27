import Period from '../src/background/Period';
import Mediator from '../src/background/Mediator';
import { Status } from '../src/shared-types';

let period: Period;
let mediator: Mediator;

beforeAll(() => jest.mock('../src/background/Mediator'));
afterAll(() => jest.unmock('../src/background/Mediator'));

describe('State mutations', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mediator = new Mediator();
    period = new Period({ id: 0, duration: 5000, mediator });
  });

  describe('On start', () => {
    test('The status is set to running', () => {
      period.start();
      expect(period.status).toBe(Status.Running);
    });
  });

  describe('On pause', () => {
    test('The status is set to paused', () => {
      period.pause();
      expect(period.status).toBe(Status.Paused);
    });
  });

  describe('On skip', () => {
    test('The status is set to complete', () => {
      period.skip();
      expect(period.status).toBe(Status.Complete);
    });
  });

  describe('On reset', () => {
    beforeEach(() => {
      period.reset({ duration: 2000, publish: false });
    });

    test('The status is set to initial', () => {
      expect(period.status).toBe(Status.Initial);
    });

    test('The time remaining is reset to the new value', () => {
      expect(period.remaining).toBe(2000);
    });

    test('The target is set to null', () => {
      expect(period.target).toBe(null);
    });

    test('The period is disabled', () => {
      expect(period.enabled).toBe(false);
    });
  });

  describe('On complete', () => {
    test('The status is set to running', () => {
      period.complete();
      expect(period.status).toBe(Status.Complete);
    });
  });
});

describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    period = new Period({ id: 0, duration: 5000, mediator });
  });

  test('Counts down when started', () => {
    period.start();
    jest.advanceTimersByTime(1000);
    expect(period.remaining).toBe(4000);
  });

  test('Stops counting down when paused', () => {
    // Simulate start
    period.start();

    // Simulate pause after 1 second
    jest.advanceTimersByTime(1000);
    period.pause();

    // Make sure the remaining time is still the same
    jest.advanceTimersByTime(3000);
    expect(period.remaining).toBe(4000);
  });
});
