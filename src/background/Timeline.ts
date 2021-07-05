import PubSub from 'pubsub-js';
import Period from './Period';
import { minutesToMillis } from './utils/utils';
import { TOPICS } from './background-constants';
import { Status, TimelineSettings } from '../shared-types';

class Timeline {
  settings: TimelineSettings;
  periods: Period[];
  index: number;

  constructor(settings: TimelineSettings) {
    this.settings = settings;
    this.periods = [];
    this.index = 0;
    this.build();
  }

  /**
   * Gets the current period in an easy-to-chain format to invoke {@link Period#Period} methods.
   */
  get current(): Period {
    return this.periods[this.index];
  }

  /**
   * Builds an array of new instances of the class Period.
   *
   * It uses timeline {@link Timeline#settings} to
   * initialize each period as either a cycle or a break.
   */
  build(): void {
    const { totalPeriods, cycleMinutes, breakMinutes } = this.settings;

    // Instantiate new periods, and populate this.periods array
    this.periods = Array.from(Array(totalPeriods)).map((_, idx) => {
      const duration = idx % 2 === 0 ? cycleMinutes : breakMinutes;

      return new Period({
        id: idx,
        duration: minutesToMillis(duration),
      });
    });
  }

  /**
   * Sets new targets to all periods that have not yet been completed.
   *
   * It sums the previous period's target plus the duration of the current period.
   * Note: The first period (idx === 0) uses the current time as initial reference.
   */
  setTargets(): void {
    this.periods.forEach((period, idx, arr) => {
      if (period.status === Status.Complete) {
        return;
      }

      const reference = idx === 0 ? Date.now() : arr[idx - 1].target;
      period.target = period.remaining + reference;
    });
  }

  /**
   * Increments the Timeline's index to point to the next period.
   *
   * Note: The increment does not occur if this is called for the last period.
   */
  nextPeriod(): void {
    const isLast = this.index === this.settings.totalPeriods - 1;
    if (isLast) {
      this.publishState();
      return;
    }

    this.index += 1;
    if (this.current.enabled) {
      // TODO: Consider holding start() login in a different place since it is used in at least 2 places.
      this.handleStart();
    }
  }

  /**
   * Publishes the state to the Bridge.
   */
  publishState(): void {
    // Prepare state + totalPeriods (UI currently receives totalPeriods from the port messages)
    const data = {
      ...this.current.state,
      totalPeriods: this.settings.totalPeriods,
    };

    // Publish request to post the state through the port.
    PubSub.publishSync(TOPICS.Timeline.TimelineState, data);
  }

  /**
   * Sets new autoStart settings to timeline periods.
   *
   * Note: Always enables current period by default.
   */
  setEnabled(): void {
    const { cycleAutoStart, breakAutoStart } = this.settings;

    this.periods.forEach((period, idx, arr) => {
      // Always enable current period; consider adding this as part of the start() behavior, not here.
      if (idx === this.index) {
        period.enabled = true;
        return;
      }

      // Only use previous period if this is not the first one.
      if (idx === 0) {
        return;
      }

      /**
       * Disable period if previous is also disabled.
       * Note: All the consecutive periods in the iteration will also be disabled.
       */
      const previous = arr[idx - 1];
      if (!previous.enabled) {
        period.enabled = false;
        return;
      }

      // Apply autoStart settings.
      period.enabled = idx % 2 === 0 ? cycleAutoStart : breakAutoStart;
    });
  }

  handleStart(): void {
    this.setTargets();
    this.setEnabled();
    this.current.start();
  }

  handlePause(): void {
    this.current.pause();
  }

  handleSkip(): void {
    this.current.skip();
  }

  handleResetCycle(): void {
    /**
     * ResetCycle is currently only handled for cycles, not breaks.
     * The UI does not show the ResetCycle button for breaks, but this check is here just in case.
     */
    if (this.index % 2 !== 0) {
      return;
    }

    const { cycleMinutes, breakMinutes } = this.settings;

    if (this.current.status === Status.Initial) {
      /**
       * If a cycle's status is Initial, allow the user to go back to the initial state of the previous cycle.
       * Note: The first cycle does not have any previous period to go back to, so we skip it.
       *
       * TODO: Consider eliminating the ResetCycle button from the UI.
       */
      if (this.index === 0) {
        return;
      }

      // Go back to previous break, and reset it
      this.index -= 1;
      this.current.reset(minutesToMillis(breakMinutes));

      // Go back to previous cycle, and reset it
      this.index -= 1;
      this.current.reset(minutesToMillis(cycleMinutes));
      return;
    }

    // TODO: Eliminate the redundant conditions once all possible Status values are locked in.
    if (
      this.current.status === Status.Running ||
      this.current.status === Status.Paused ||
      this.current.status === Status.Complete
    ) {
      // Reset current cycle back to Initial state
      this.current.reset(minutesToMillis(cycleMinutes));
      return;
    }
  }

  handleResetAll(): void {
    const { cycleMinutes, breakMinutes } = this.settings;

    // Iterate all periods, and reset these
    this.periods.forEach((period, idx) => {
      const duration = idx % 2 === 0 ? cycleMinutes : breakMinutes;
      period.reset(minutesToMillis(duration));
    });

    // Reset the timeline index back to 0
    this.index = 0;
  }

  handlePreload(): void {
    this.publishState();
  }

  /**
   * Subscribe to published messages from Bridge.
   * Handlers for user input and PreLoad are registered here.
   */
  registerSubscriptions(): void {
    /**
     * Bridge subscriptions.
     */
    PubSub.subscribe(TOPICS.Bridge.Start, () => {
      this.handleStart();
    });

    PubSub.subscribe(TOPICS.Bridge.Pause, () => {
      this.handlePause();
    });

    PubSub.subscribe(TOPICS.Bridge.Skip, () => {
      this.handleSkip();
    });

    PubSub.subscribe(TOPICS.Bridge.ResetCycle, () => {
      this.handleResetCycle();
    });

    PubSub.subscribe(TOPICS.Bridge.ResetAll, () => {
      this.handleResetAll();
    });

    PubSub.subscribe(TOPICS.Bridge.Preload, () => {
      this.handlePreload();
    });

    /**
     * Period-related subscriptions.
     */
    PubSub.subscribe(TOPICS.Period.PeriodState, () => {
      this.publishState();
    });

    PubSub.subscribe(TOPICS.Period.PeriodEnd, () => {
      /**
       * Actions to take once a period has ended.
       * TODO: Examine whether checking if it is too early or too late is necessary.
       */
      this.current.complete();
      this.nextPeriod();
      // if (Date.now() > this.current.remaining) {
      // }
    });
  }
}

export default Timeline;
