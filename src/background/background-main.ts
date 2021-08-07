import Mediator from './Mediator';
import Bridge from './Bridge';
import Timeline from './Timeline';
import Monitor from './Monitor';
import Badge from './Badge';
import Notifications from './Notifications';
import Settings from './Settings';
import { registerInstallListeners } from './utils/utils';

main();

function main() {
  const mediator = new Mediator();
  const bridge = new Bridge();
  const timeline = new Timeline();
  const monitor = new Monitor();
  const badge = new Badge();
  const notifications = new Notifications();

  mediator.setup(bridge, timeline, monitor, badge, notifications);

  // Register browser-related listeners for install and storage
  registerInstallListeners();
  bridge.registerPortListeners();

  // Init settings, then timeline
  Settings.init().then((settings) => {
    timeline.init(settings);
    notifications.init(settings);
    badge.init(settings);
  });
}
