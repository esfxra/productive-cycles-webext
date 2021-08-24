import Mediator from './Mediator';
import { Participant } from './background-types';
import { BridgeInputs } from '../shared-types';

export default class Bridge implements Participant {
  mediator: Mediator;
  open: boolean;
  port: chrome.runtime.Port;

  constructor() {
    this.mediator = null;
    this.open = false;
    this.port = null;
  }

  /**
   * Handle publishRequests through mediator.
   */
  public onMessageRequest = (data: unknown): void => {
    // Handle requests to post a message to the popup
    // This could be implemented as a single interface for messages aimed at: timer, settings, statistics
    if (this.open) {
      this.port.postMessage(data);
    }
  };

  public registerPortListeners = (): void => {
    chrome.runtime.onConnect.addListener(this.handlePortConnect);
  };

  private handlePortConnect = (port: chrome.runtime.Port): void => {
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

  private handlePortDisconnect = (): void => {
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
  private handlePortMessages = (message: { command: BridgeInputs }): void => {
    switch (message.command) {
      case BridgeInputs.Start:
        this.mediator.publish('Start');
        break;
      case BridgeInputs.Pause:
        this.mediator.publish('Pause');
        break;
      case BridgeInputs.Skip:
        this.mediator.publish('Skip');
        break;
      case BridgeInputs.ResetCycle:
        this.mediator.publish('ResetCycle');
        break;
      case BridgeInputs.ResetAll:
        this.mediator.publish('ResetAll');
        break;
    }
  };
}
