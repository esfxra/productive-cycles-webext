import Mediator from './Mediator';
import { Participant } from './background-types';
import { INPUT } from '../shared-constants';

export default class Bridge implements Participant {
  mediator: Mediator;
  open: boolean;
  port: chrome.runtime.Port;

  constructor(mediator: Mediator) {
    this.mediator = mediator;
    this.open = false;
    this.port = null;
  }

  registerPortListeners = (): void => {
    chrome.runtime.onConnect.addListener(this.handlePortConnect);
  };

  handlePortConnect = (port: chrome.runtime.Port): void => {
    port.onDisconnect.addListener(this.handlePortDisconnect);
    port.onMessage.addListener(this.handlePortMessages);

    this.port = port;
    this.open = true;

    /**
     * @todo Consider publishing port open event.
     * @todo Consider removing port connect listener, and adding it back on disconnect.
     */
    // this.mediator.publish('port_open');
    // chrome.runtime.onConnect.removeListener(this.handlePortConnect.bind(this));
  };

  handlePortDisconnect = (): void => {
    // Update port open flag if a disconnect occurs
    this.open = false;

    /**
     * @todo Consider publishing port closed event.
     * @todo Add onConnect listener now that the port is closed.
     * @todo Consider removing port disconnect listener, and adding it back on connect.
     * @todo Consider removing onMessage listener, and adding it back on connect.
     */
    // this.mediator.publish('port_closed');
    // chrome.runtime.onConnect.addListener(this.handlePortConnect.bind(this));
    // this.port.onDisconnect.removeListener(this.handlePortDisconnect.bind(this));
    // this.port.onMessage.removeListener(this.handlePortMessages.bind(this));
  };

  /**
   * Forward incoming messages to mediator.
   */
  handlePortMessages = (message: { command: string }): void => {
    switch (message.command) {
      case INPUT.Start:
        this.mediator.publish(INPUT.Start);
        break;
      case INPUT.Pause:
        this.mediator.publish(INPUT.Pause);
        break;
      case INPUT.Skip:
        this.mediator.publish(INPUT.Skip);
        break;
      case INPUT.ResetCycle:
        this.mediator.publish(INPUT.ResetCycle);
        break;
      case INPUT.ResetAll:
        this.mediator.publish(INPUT.ResetAll);
        break;
      case INPUT.Preload:
        this.mediator.publish(INPUT.Preload);
        break;
    }
  };

  /**
   * Handle publishRequests from mediator.
   */
  handleBridgeOutput = (data: any): void => {
    // Handle requests to post a message to the popup
    // This could be implemented as a single interface for messages aimed at: timer, settings, statistics
    if (this.open) {
      console.log(data);
      this.port.postMessage(data);
    }
  };
}
