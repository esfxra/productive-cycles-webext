import { SETTINGS, STORED_STATE } from '../defaults';
import { StoredState } from '../types';

export default class Storage {
  public static onInstall(): void {
    const defaultData = { ...SETTINGS, ...STORED_STATE };

    chrome.storage.local.set(defaultData, () => {
      console.log('Storage installed.');
    });
  }

  public static onUpdate(): void {
    const defaultData = { ...SETTINGS, ...STORED_STATE };
    const defaultKeys = Object.keys(defaultData);

    chrome.storage.local.get(null, (stored) => {
      const result = defaultKeys.reduce((acc, curr) => {
        // Select default settings if key is not stored. Otherwise, use stored key.
        if (stored[curr] === undefined) {
          console.log(`${curr} is not stored`);
          return { ...acc, [curr]: defaultData[curr] };
        }

        console.log(`${curr} is stored`);
        return { ...acc, [curr]: stored[curr] };
      }, {});

      chrome.storage.local.set(result, () => {
        console.log('Storage updated.');
      });
    });
  }

  public static setState({
    targets,
    period,
    status,
  }: Partial<StoredState>): void {
    chrome.storage.local.get(
      ['targets', 'period', 'status'],
      (stored: StoredState) => {
        let state = { ...stored };

        if (typeof targets !== undefined) {
          state['targets'] = targets;
        }

        if (typeof period !== undefined) {
          state['period'] = period;
        }

        if (typeof status !== undefined) {
          state['status'] = status;
        }

        chrome.storage.local.set(state);
      }
    );
  }
}
