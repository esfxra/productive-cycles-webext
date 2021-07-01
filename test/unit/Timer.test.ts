import PubSub from 'pubsub-js';
import Timer from '../../src/background/Timer';
import { Topic } from '../../src/background/background-types';

const TIME = 5000;
const TIME_PASSED = 1000;

let timer: Timer;

describe.skip('Timer commands', () => {
  beforeAll(() => {
    timer = new Timer();
    timer.registerSubscriptions();
  });

  afterAll(() => {
    PubSub.clearAllSubscriptions();
  });

  test('Subtractor runs when command is published', async () => {
    jest.useFakeTimers();

    PubSub.publish(Topic.TimerCommand, {
      command: 'run',
      time: TIME,
    });

    jest.advanceTimersByTime(TIME_PASSED);

    // Confirm subtractor is running by checking remaining time
    expect(timer.remaining).toBe(TIME - TIME_PASSED);
  });

  test('Subtractor stops when command is published', () => {
    jest.useFakeTimers();

    PubSub.publish(Topic.TimerCommand, {
      command: 'stop',
    });

    jest.advanceTimersByTime(2000);

    // Confirm subtractor stopped by making sure remaining time has not changed
    expect(timer.remaining).toBe(TIME - TIME_PASSED);
  });
});
