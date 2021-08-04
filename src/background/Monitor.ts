import Mediator from './Mediator';
import { Participant } from './background-types';

export default class Monitor implements Participant {
  mediator: Mediator;
  monitor: ReturnType<typeof setInterval>;

  constructor(mediator: Mediator) {
    this.mediator = mediator;
    this.monitor = null;
  }

  start = (): void => {
    chrome.alarms.create('monitor', { periodInMinutes: 0.15 });
    chrome.alarms.onAlarm.addListener(this.onAlarm);

    console.info('Monitor - Registered alarm.');
  };

  stop = (): void => {
    chrome.alarms.clear('monitor', (wasCleared) => {
      if (!wasCleared) {
        console.error('Monitor - Error occurred when clearing the alarm.');
      }

      console.log('Monitor - Alarm cleared.');
    });
  };

  onAlarm = (alarm: chrome.alarms.Alarm): void => {
    if (alarm.name === 'monitor') {
      /**
       * @todo Consider sending scheduledTime through publish.
       */
      this.mediator.publish('MonitorTick');

      console.log(
        `Monitor - Current time minus Alarm scheduled time: ${
          Date.now() - Math.floor(alarm.scheduledTime)
        } milliseconds`
      );
    }

    console.log(`Monitor - Alarm '${alarm.name}' fired`);
  };
}
