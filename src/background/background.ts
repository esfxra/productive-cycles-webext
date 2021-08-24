import Mediator from './Mediator';
import Timeline from './Timeline';
import Comms from './Comms';
import Storage from './Storage';

background();

function background() {
  registerInstallListeners();

  const mediator = new Mediator();
  const comms = new Comms();
  const timeline = new Timeline();

  comms.registerPortListeners();

  mediator.setup(comms, timeline);
}

function registerInstallListeners() {
  chrome.runtime.onInstalled.addListener((details: { reason: string }) => {
    switch (details.reason) {
      case 'install':
        chrome.storage.local.set(
          { showWelcome: true, showUpdates: false },
          () => {
            Storage.onInstall();
          }
        );
        break;
      case 'update':
        chrome.storage.local.set(
          { showWelcome: false, showUpdates: true },
          () => {
            Storage.onUpdate();
          }
        );
        break;
    }
  });
}
