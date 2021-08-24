import { ExtensionSettings, Status } from '../shared-types';

export default class Badge {
  enabled: boolean;

  constructor() {
    this.enabled = false;
  }

  /**
   * @todo Find a way to get current period to determine whether break or cycle.
   */
  public onStart = (): void => {
    this.updateBadgeColor(true);
  };

  public onResetCycle = (): void => {
    this.updateBadgeTime(Status.Initial, '');
  };

  public onResetAll = (): void => {
    this.updateBadgeTime(Status.Initial, '');
  };

  public onPeriodTick = ({
    status,
    remaining,
  }: {
    status: Status;
    remaining: string;
  }): void => {
    this.updateBadgeTime(status, remaining);
  };

  public onPeriodEnd({
    status,
    remaining,
  }: {
    status: Status;
    remaining: string;
  }): void {
    this.updateBadgeTime(status, remaining);
  }

  public onNewSettings({ showBadge }: ExtensionSettings): void {
    if (showBadge) {
      this.enabled = showBadge;
    }
  }

  public init({ showBadge }: ExtensionSettings): void {
    this.enabled = showBadge;
  }

  private updateBadgeColor(isCycle: boolean): void {
    const setBadgeColor = (color: string) => {
      chrome.browserAction.setBadgeBackgroundColor({ color: color });
    };

    if (isCycle) {
      setBadgeColor('#3c50fa');
      return;
    }

    setBadgeColor('#484B56');
  }

  /**
   * @todo Refactor into more general function ... updateText()
   */
  private updateBadgeTime(status: Status, time: string): void {
    const setBadgeText = (text: string) => {
      chrome.browserAction.setBadgeText({ text: text });
    };

    if (status === Status.Initial || status === Status.Complete) {
      setBadgeText('...');
      return;
    }

    /**
     * The case for Status.Running and Status.Paused.
     * - Slice seconds if less than a minute, or slice minutes.
     * - The format of the string 'time' is '00:00'.
     */
    let text: string;
    if (time.includes('00:')) {
      text = `${time.slice(3)}s`;
    } else {
      text = `${time.slice(0, 2)}m`;
    }

    // Trim any 0s for single digit numbers
    text = text.charAt(0) === '0' ? text.slice(1) : text;

    // Update badge text
    setBadgeText(text);
  }
}
