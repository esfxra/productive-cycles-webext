import NotificationsBuilder from './NotificationsBuilder';
import Settings from './Settings';
import { NOTIFICATION_ID_TEMPLATE } from './background-constants';
import { Notification } from './background-types';
import { ExtensionSettings } from '../shared-types';

export default class Notifications {
  enabled: boolean;
  sound: boolean;

  constructor() {
    this.enabled = false;
    this.sound = false;
  }

  public onResetAll = async (): Promise<void> => {
    const { totalPeriods } = await Settings.getSettings(['totalPeriods']);
    this.clearAll(totalPeriods);
  };

  public onPeriodEnd = async ({ id }: { id: number }): Promise<void> => {
    const notification = await NotificationsBuilder.build(id);
    this.send(notification);
  };

  public onNewSettings = ({
    notificationsEnabled,
    notificationsSound,
  }: Partial<ExtensionSettings>): void => {
    if (notificationsEnabled) {
      this.enabled = notificationsEnabled;
    }

    if (notificationsSound) {
      this.sound = notificationsSound;
    }
  };

  public init({
    notificationsEnabled,
    notificationsSound,
  }: ExtensionSettings): void {
    this.enabled = notificationsEnabled;
    this.sound = notificationsSound;
  }

  private send({ id, title, message }: Notification): void {
    if (this.enabled) {
      if (this.sound) {
        this.playSound();
      }
    }

    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('./manifest-icons/icon-128.png'),
      title: title,
      message: message,
    });
  }

  private playSound(): void {
    const sound = document.querySelector('#notifications');

    sound
      .play()
      .then(() => {})
      .catch((e) => console.log(e));
  }

  private clear(period: number): void {
    chrome.notifications.clear(`${NOTIFICATION_ID_TEMPLATE}-${period}`);
  }

  private clearAll(total: number): void {
    for (let i = 0; i < total; i += 1) {
      this.clear(i);
    }
  }
}
