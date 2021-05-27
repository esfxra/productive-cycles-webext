import { Bridge } from "../../src/background/Bridge";
import { Timeline } from "../../src/background/Timeline";
import { ExtensionSettings, Input } from "../../src/shared-types";

export function runBackground(settings: ExtensionSettings): [Bridge, Timeline] {
  // Simulate the main runBackground function without the browser listeners
  const bridge = new Bridge();
  const timeline = new Timeline(settings);

  bridge.registerSubscriptions();
  timeline.registerSubscriptions();

  return [bridge, timeline];
}

export function simulateStart(bridge: Bridge): void {
  // Note: Asking jest to run pending timers after Input.Start does not run the app's timer itself
  // ... It is used because it fulfills the asynchronous behavior of PubSub
  // ... Timers will still need to be advanced afterwards
  bridge.handlePortMessages({ command: Input.Start });
  jest.runOnlyPendingTimers();
}

export function simulatePause(bridge: Bridge): void {
  bridge.handlePortMessages({ command: Input.Pause });
  jest.runOnlyPendingTimers();
}

export function simulateSkip(bridge: Bridge): void {
  bridge.handlePortMessages({ command: Input.Skip });
  jest.runOnlyPendingTimers();
}

export function simulateResetCycle(bridge: Bridge): void {
  bridge.handlePortMessages({ command: Input.ResetCycle });
  jest.runOnlyPendingTimers();
}
