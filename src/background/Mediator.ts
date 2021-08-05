import { Topics, Subscriptions, TopicCallback } from './background-types';
import Bridge from './Bridge';
import Badge from './Badge';
import Timeline from './Timeline';
import Monitor from './Monitor';

/**
 * @todo Add mutex to prevent conflicts during worksflows
 **/
export default class Mediator {
  subscriptions: Subscriptions;

  constructor() {
    this.subscriptions = {};
  }

  subscribe(topic: Topics, callback: TopicCallback): void {
    // Check if the topic is already subscribed, and create array of subscriptions if not
    // Each topic subscription has an array of callbacks
    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = [];
    }

    // Add the callback to the topic subscription array if it doesn't already exist
    const result = this.subscriptions[topic].indexOf(callback);
    if (result === -1) {
      this.subscriptions[topic].push(callback);
    }
  }

  unsubscribe(topic: Topics, callback: TopicCallback): void {
    // Check if the topic exists in the subscriptions array
    if (!this.subscriptions[topic]) {
      return;
    }

    // Find the callback in the topic's subscriptions array, and remove it if found
    const index = this.subscriptions[topic].indexOf(callback);
    if (index !== -1) {
      this.subscriptions[topic].splice(index, 1);
    }
  }

  unsubscribeAll(topic: Topics): void {
    // Check if the topic exists
    if (!this.subscriptions[topic]) {
      return;
    }

    // Remove all callbacks from the topic's subscription array
    this.subscriptions[topic].splice(0, this.subscriptions[topic].length);
  }

  publish(topic: Topics, data?: unknown): void {
    // Check if the topic exists
    if (!this.subscriptions[topic]) {
      return;
    }

    // Call each callback in the topic's subscription array with the data provided
    this.subscriptions[topic].forEach((callback: TopicCallback) =>
      callback(data)
    );
  }

  setup(
    bridge: Bridge,
    timeline: Timeline,
    monitor: Monitor,
    badge: Badge
  ): void {
    // Mediator install
    bridge.mediator = this;
    timeline.mediator = this;
    monitor.mediator = this;

    // Message Request
    this.subscribe('MessageRequest', bridge.onMessageRequest);

    // Start
    this.subscribe('Start', timeline.onStart);
    this.subscribe('Start', monitor.onStart);

    // Pause
    this.subscribe('Pause', monitor.onPause);
    this.subscribe('Pause', timeline.onPause);

    // Skip
    this.subscribe('Skip', timeline.onSkip);

    // ResetCycle
    this.subscribe('ResetCycle', monitor.onResetCycle);
    this.subscribe('ResetCycle', timeline.onResetCycle);

    // ResetAll
    this.subscribe('ResetAll', monitor.onResetAll);
    this.subscribe('ResetAll', timeline.onResetAll);

    // Preload
    this.subscribe('Preload', timeline.onPreload);

    // PeriodTick
    this.subscribe('PeriodTick', timeline.onPeriodTick);
    this.subscribe('PeriodTick', badge.onPeriodTick);

    // PeriodEnd
    // this.subscribe('PeriodEnd', monitor.onPeriodEnd);
    this.subscribe('PeriodEnd', timeline.onPeriodEnd);

    // MonitorTick
    this.subscribe('MonitorTick', timeline.onMonitorTick);
  }
}
