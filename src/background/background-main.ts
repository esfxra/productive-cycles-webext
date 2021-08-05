import Mediator from './Mediator';
import Bridge from './Bridge';
import Timeline from './Timeline';
import Monitor from './Monitor';
import Badge from './Badge';
import Settings from './Settings';

main();

function main() {
  const mediator = new Mediator();
  const bridge = new Bridge();
  const timeline = new Timeline();
  const monitor = new Monitor();
  const badge = new Badge();

  mediator.setup(bridge, timeline, monitor, badge);

  // Register browser-related listeners for install and storage
  registerInstallListeners();
  bridge.registerPortListeners();

  // Init settings, then timeline
  Settings.init().then((settings) => {
    timeline.init(settings);
  });
}

function registerInstallListeners() {
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
