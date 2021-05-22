import PubSub from "pubsub-js";
import { Topics } from "./types";

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
    // Handle incoming messages
    switch (message.command) {
      case "start":
        // Build timeline
        // Start alarm / interval process
        // Run UI timer until port is disconnected
        console.log("Starts the timer");
        break;
      case "pause":
        // Stop alarm / interval process
        // Stop UI timer if running
        console.log("Pauses the timer");
        break;
      case "skip":
        console.log("Skips the current break");
        break;
      case "reset-cycle":
        console.log("Resets the current cycle");
        break;
      case "reset-all":
        console.log("Resets all the cycles");
        break;
      case "preload":
        // Initial state post
        PubSub.publish(Topics.PRELOAD);
        // Run UI timer if needed ... should only run if state is 'running'
        break;
    }
  }

  registerSubscriptions(): void {
    // Subscribe to requests for posting messages
    this.requestSubscriptions.push(
      PubSub.subscribe(
        Topics.PUBLISH_MESSAGE,
        this.handlePublishRequests.bind(this)
      )
    );
  }

  handlePublishRequests(msg, data): void {
    // Handle requests to post a message to the popup
    // This could be implemented as a single interface for messages aimed at: timer, settings, statistics
    if (this.open) {
      this.port.postMessage(data);
    }
  }
}

export { Bridge };
