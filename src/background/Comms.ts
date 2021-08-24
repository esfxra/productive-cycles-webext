import Mediator from './Mediator';
import { Participant, Inputs, StoredState } from '../types';
import { INPUT } from '../defaults';

export default class Comms implements Participant {
  mediator: Mediator;
  open: boolean;
  port: chrome.runtime.Port;

  constructor() {
    this.mediator = null;
    this.open = false;
    this.port = null;
  }

  public registerPortListeners = (): void => {
    chrome.runtime.onConnect.addListener(this.handlePortConnect);
  };

  private handlePortConnect = (port: chrome.runtime.Port): void => {
    port.onDisconnect.addListener(this.handlePortDisconnect);
    port.onMessage.addListener(this.handlePortMessages);

    this.port = port;
    this.open = true;
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

  private handlePortMessages = (message: {
    topic: 'statecheck' | Inputs | 'End';
    data: Partial<StoredState>;
  }): void => {
    switch (message.topic) {
      // case 'statecheck':
      //   this.mediator.publish('StateCheck');
      //   break;
      case INPUT.Start:
        this.mediator.publish('Start', message.data);
        break;
      case INPUT.Pause:
        this.mediator.publish('Pause', message.data);
        break;
      case INPUT.Skip:
        this.mediator.publish('Skip', message.data);
        break;
      case INPUT.ResetCycle:
        this.mediator.publish('ResetCycle', message.data);
        break;
      case INPUT.ResetAll:
        this.mediator.publish('ResetAll', message.data);
        break;
      case 'End':
        this.mediator.publish('End', message.data);
        break;
    }
  };
}
