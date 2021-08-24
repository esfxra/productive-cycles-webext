import { DEFAULT_SETTINGS } from '../defaults';
import { ExtensionSettings } from '../types';

export default class Settings {
  public static async init(): Promise<ExtensionSettings> {
    const stored = await Settings.getSettings(null);

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

      // Store the settings object to include new settings.
      chrome.storage.local.set(settings);

      // Register a listener to handle changes to the settings.
      // chrome.storage.onChanged.addListener(this.handleChangedSettings);

      // Resolve the promise.
      resolve(settings);
    });
  }

  public static async getSettings(
    settings: string[] | null
  ): Promise<Partial<ExtensionSettings>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(settings, (stored: ExtensionSettings) => {
        resolve(stored);
      });
    });
  }

  // public static handleChangedSettings = (changes: {
  //   [key: string]: { newValue: any };
  // }): void => {
  //   console.log(`handleChangedSettings: ${changes}`);
  // };
}
