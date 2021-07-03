import { TOPICS } from './background-constants';

class Alarms {
  static schedule(name: string, when: number): void {
    // TODO: Check if time is less than 2 minutes, and delegate to a timeout if so
    chrome.alarms.create(name, {
      when: when,
    });

    chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
      // TODO: Check if it finished too soon, and reschedule
      // You can use 'alarm.name' and 'alarm.scheduledTime' to handle this
      PubSub.publishSync(TOPICS.Period.PeriodEnd);
    });
  }
}

export default Alarms;
