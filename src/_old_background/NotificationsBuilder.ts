import Settings from './Settings';
import { mapBreak, mapCycle } from './utils/utils';
import { NOTIFICATION_ID_TEMPLATE } from './background-constants';
import { Notification } from './background-types';

export default class NotificationsBuilder {
  public static async build(id: number): Promise<Notification> {
    const { breakMinutes, totalPeriods } = await Settings.getSettings([
      'breakMinutes',
      'totalPeriods',
    ]);

    return new Promise((resolve) => {
      const type = this.determineType(id, totalPeriods);
      switch (type) {
        case 'cycle':
          resolve(this.buildForCycle(id, breakMinutes));
          break;
        case 'break':
          resolve(this.buildForBreak(id));
          break;
        case 'complete':
          resolve(this.buildForComplete(id));
          break;
      }
    });
  }

  private static determineType(id: number, totalPeriods: number) {
    if (id === totalPeriods - 1) {
      return 'complete';
    }

    return id % 2 === 0 ? 'cycle' : 'break';
  }

  private static buildForCycle(id: number, breakMinutes: number) {
    return {
      id: `${NOTIFICATION_ID_TEMPLATE}-${id}`,
      title: chrome.i18n.getMessage(
        'notifications_cycle_title',
        mapCycle(id).toString()
      ),
      message: chrome.i18n.getMessage(
        'notifications_cycle_message',
        `${breakMinutes}`
      ),
    };
  }

  private static buildForBreak(id: number) {
    return {
      id: `${NOTIFICATION_ID_TEMPLATE}-${id}`,
      title: chrome.i18n.getMessage(
        'notifications_break_title',
        mapBreak(id).toString()
      ),
      message: chrome.i18n.getMessage('notifications_break_message'),
    };
  }

  private static buildForComplete(id: number) {
    return {
      id: `${NOTIFICATION_ID_TEMPLATE}-${id}`,
      title: chrome.i18n.getMessage('notifications_complete_title'),
      message: chrome.i18n.getMessage('notifications_complete_message'),
    };
  }
}
