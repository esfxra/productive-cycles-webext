import { Duration } from 'luxon';

export function registerInstallListeners(): void {
  // Register install and update listeners
  chrome.runtime.onInstalled.addListener((details: { reason: string }) => {
    switch (details.reason) {
      case 'install':
        chrome.storage.local.set(
          { showWelcome: true, showUpdates: false },
          () => console.log('installed')
        );
        break;
      case 'update':
        chrome.storage.local.set(
          { showWelcome: false, showUpdates: true },
          () => console.log('updated')
        );
        break;
    }
  });
}

export function minutesToMillis(minutes: number): number {
  // Could also implement as 'minutes * 60000', but using Duration for consistency
  return Duration.fromObject({ minutes: minutes }).as('milliseconds');
}

export function millisToMMSS(milliseconds: number): string {
  return Duration.fromMillis(milliseconds).toFormat('mm:ss');
}

export function millisToMM(milliseconds: number): string {
  return Duration.fromMillis(milliseconds).toFormat('mm');
}

export function mapCycle(period: number): number {
  return period / 2 + 1;
}

export function mapBreak(period: number): number {
  return period / 2 + 1 / 2;
}
