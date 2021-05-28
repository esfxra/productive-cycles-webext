import PubSub from "pubsub-js";
import { State, Topic } from "./background-types";

interface Message extends State {
  totalPeriods: number;
}

class Bridge {
  open: boolean;
  port: chrome.runtime.Port;

  requestSubscriptions: string[];

  constructor() {
    this.requestSubscriptions = [];
  }

  registerPortListeners(): void {
    chrome.runtime.onConnect.addListener((port) => {
      port.onDisconnect.addListener(this.handlePortDisconnect.bind(this));
      port.onMessage.addListener(this.handlePortMessages.bind(this));

      this.port = port;
      this.open = true;
    });
  }

  handlePortDisconnect(): void {
    // Update port open flag if a disconnect occurs
    // TODO: Check if an event that signals observers to not attempt to post messages is needed
    this.open = false;
  }

  handlePortMessages(message: { command: string }): void {
    // Forward incoming messages to subscribers
    PubSub.publish(Topic[message.command]);
  }

  registerSubscriptions(): void {
    // Subscribe to requests for posting messages
    this.requestSubscriptions.push(
      PubSub.subscribe(Topic.State, this.handlePublishRequests.bind(this))
    );
  }

  handlePublishRequests(_msg: string, data: Message): void {
    // Handle requests to post a message to the popup
    // This could be implemented as a single interface for messages aimed at: timer, settings, statistics
    if (this.open) {
      console.log(data);
      this.port.postMessage(data);
    }
  }
}

export { Bridge };
