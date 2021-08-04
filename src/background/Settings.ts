import { DEFAULT_SETTINGS } from '../shared-constants';
import { ExtensionSettings } from '../shared-types';

export default class Settings {
  static async init(): Promise<ExtensionSettings> {
    const stored = await Settings.getAll();

    return new Promise((resolve) => {
      const defaultKeys = Object.keys(DEFAULT_SETTINGS);
      const settings = defaultKeys.reduce(
        (acc, curr: keyof ExtensionSettings) => {
          // Select default settings if key is not stored. Otherwise, use stored key.
          if (stored[curr] === undefined) {
            console.log(`${curr} is not stored`);
            return { ...acc, [curr]: DEFAULT_SETTINGS[curr] };
          }

          console.log(`${curr} is stored`);
          return { ...acc, [curr]: stored[curr] };
        },
        {} as ExtensionSettings
      );

      resolve(settings);
    });
  }

  static async getAll(): Promise<ExtensionSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (stored: ExtensionSettings) => {
        resolve(stored);
      });
    });
  }
}
