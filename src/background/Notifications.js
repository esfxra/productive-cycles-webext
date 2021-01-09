'use strict';

const idTemplate = 'notification-for-period';

class Notifications {
  static async send(period, type) {
    const { enabled, sound } = await this.checkSettings();

    if (enabled) {
      if (sound) this.playSound();

      const notification = this.build(period, type);
      this.publish(notification);
    }
  }

  static build(period, type) {
    let id = `${idTemplate}-${period}`;
    let title;
    let message;

    switch (type) {
      case 'cycle':
        title = `Cycle complete!`;
        message = `Great job.`;
        break;
      case 'break':
        title = `Break is over.`;
        message = `Time to grind!`;
        break;
      case 'complete':
        title = `You did it! All cycles are complete.`;
        message = `Take a long break 🧘`;
        break;
    }

    return { id, title, message };
  }

  static checkSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ['notificationsEnabled', 'notificationsSound'],
        (storage) =>
          resolve({
            enabled: storage.notificationsEnabled,
            sound: storage.notificationsSound,
          })
      );
    });
  }

  static playSound() {
    const sound = new Audio();
    sound.src = '../assets/audio/metal-mallet.mp3';

    sound
      .play()
      .then(() => console.log('Played sound.'))
      .catch((e) => console.log(e));
  }

  static publish(notification) {
    chrome.notifications.create(notification.id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: notification.title,
      message: notification.message,
    });
  }
}

export { Notifications };
