import Mediator from './Mediator';
import { Participant } from './background-types';

export default class Monitor implements Participant {
  mediator: Mediator;
  monitor: ReturnType<typeof setInterval>;

  constructor() {
    this.mediator = null;
    this.monitor = null;
  }

  public onStart = (): void => {
    this.start();
  };

  public onPause = (): void => {
    this.stop();
  };

  public onResetCycle = (): void => {
    this.stop();
  };

  public onResetAll = (): void => {
    this.stop();
  };

  public onPeriodEnd = (): void => {
    this.stop();
  };

  private start = (): void => {
    chrome.alarms.create('monitor', { periodInMinutes: 0.15 });
    chrome.alarms.onAlarm.addListener(this.onAlarm);

    console.info('Monitor - Registered alarm.');
  };

  private stop = (): void => {
    chrome.alarms.clear('monitor', (wasCleared) => {
      if (!wasCleared) {
        console.error('Monitor - Error occurred when clearing the alarm.');
      }

      console.log('Monitor - Alarm cleared.');
    });
  };

  private onAlarm = (alarm: chrome.alarms.Alarm): void => {
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
