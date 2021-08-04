import Mediator from './Mediator';
import Bridge from './Bridge';
import Timeline from './Timeline';
import Settings from './Settings';
import Monitor from './Monitor';

main();

function main() {
  const mediator = new Mediator();
  const bridge = new Bridge(mediator);
  const timeline = new Timeline(mediator);
  const monitor = new Monitor(mediator);

  // Register browser-related listeners for install and storage
  registerInstallListeners();
  bridge.registerPortListeners();

  bridge.mediator.subscribe('MessageRequest', bridge.handleBridgeOutput);

  timeline.mediator.subscribe('Start', timeline.handleStart);
  monitor.mediator.subscribe('Start', monitor.start);

  timeline.mediator.subscribe('Pause', timeline.handlePause);
  monitor.mediator.subscribe('Pause', monitor.stop);

  timeline.mediator.subscribe('Skip', timeline.handleSkip);

  timeline.mediator.subscribe('ResetCycle', timeline.handleResetCycle);
  monitor.mediator.subscribe('ResetCycle', monitor.stop);

  timeline.mediator.subscribe('ResetAll', timeline.handleResetAll);
  monitor.mediator.subscribe('ResetAll', monitor.stop);

  timeline.mediator.subscribe('Preload', timeline.handlePreload);
  timeline.mediator.subscribe('PeriodTick', timeline.handlePeriodTick);

  timeline.mediator.subscribe('PeriodEnd', timeline.handlePeriodEnd);
  monitor.mediator.subscribe('PeriodEnd', monitor.stop);

  timeline.mediator.subscribe('MonitorTick', timeline.handleMonitorTick);

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
