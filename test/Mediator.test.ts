/* eslint-disable @typescript-eslint/no-empty-function */

import Mediator from '../src/background/Mediator';

let mediator: Mediator;

beforeEach(() => {
  mediator = new Mediator();
});

describe('Adding subscriptions', () => {
  test('Topic can be added to the subscriptions object', () => {
    mediator.subscribe('Start', () => {});
    expect(mediator.subscriptions['Start']).toBeDefined();
  });

  test('Multiple topics can be added to the subscriptions object', () => {
    mediator.subscribe('Start', () => {});
    mediator.subscribe('Pause', () => {});
    mediator.subscribe('Skip', () => {});
    expect(mediator.subscriptions['Start']).toBeDefined();
    expect(mediator.subscriptions['Pause']).toBeDefined();
    expect(mediator.subscriptions['Skip']).toBeDefined();
  });

  test('Callback can be added to a topic array in the subscriptions object', () => {
    const callback = () => {};
    mediator.subscribe('Start', callback);
    expect(mediator.subscriptions['Start'].length).toBe(1);
    expect(mediator.subscriptions['Start'][0]).toBe(callback);
  });

  test('A duplicate callback cannot be added to the same topic array in the subscriptions object', () => {
    const callback = () => {};
    mediator.subscribe('Start', callback);
    mediator.subscribe('Start', callback);
    expect(mediator.subscriptions['Start'].length).toBe(1);
    expect(mediator.subscriptions['Start'][0]).toBe(callback);
    expect(mediator.subscriptions['Start'][1]).toBeUndefined();
  });
});

describe('Removing subscriptions', () => {
  test('An existing subscription can be removed from the topic array', () => {
    const callback = () => {};
    mediator.subscribe('Start', callback);
    expect(mediator.subscriptions['Start'].length).toBe(1);
    mediator.unsubscribe('Start', callback);
    expect(mediator.subscriptions['Start'].length).toBe(0);
  });

  test('An existing subscription can be removed by splicing the topic array', () => {
    const callback1 = () => {};
    const callback2 = () => {};
    const callback3 = () => {};
    mediator.subscribe('Start', callback1);
    mediator.subscribe('Start', callback2);
    mediator.subscribe('Start', callback3);
    expect(mediator.subscriptions['Start'].length).toBe(3);
    mediator.unsubscribe('Start', callback2);
    expect(mediator.subscriptions['Start'].length).toBe(2);
    expect(mediator.subscriptions['Start'][0]).toBe(callback1);
    expect(mediator.subscriptions['Start'][1]).toBe(callback3);
  });

  test('All subscriptions can be removed from the topic array', () => {
    const callback1 = () => {};
    const callback2 = () => {};
    mediator.subscribe('Start', callback1);
    mediator.subscribe('Start', callback2);
    expect(mediator.subscriptions['Start'].length).toBe(2);
    mediator.unsubscribeAll('Start');
    expect(mediator.subscriptions['Start'].length).toBe(0);
  });
});

describe('Publishing', () => {
  test('Subscribed callbacks are called in order for a determined topic', () => {
    let subject: string;
    const expected = 'callback1 callback2 callback3';

    const callback1 = () => {
      subject = `callback1`;
    };

    const callback2 = () => {
      subject = `${subject} callback2`;
    };

    const callback3 = () => {
      subject = `${subject} callback3`;
    };

    mediator.subscribe('Start', callback1);
    mediator.subscribe('Start', callback2);
    mediator.subscribe('Start', callback3);
    mediator.publish('Start');

    expect(subject).toBe(expected);
  });
});
