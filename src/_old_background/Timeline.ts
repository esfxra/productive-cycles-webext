import Mediator from './Mediator';
import Period from './Period';
import { ExtensionSettings, Status, TimelineSettings } from '../shared-types';
import { Participant } from './background-types';
import { minutesToMillis } from './utils/utils';

export default class Timeline implements Participant {
  mediator: Mediator;
  settings: TimelineSettings;
  periods: Period[];
  index: number;

  constructor() {
    this.mediator = null;
    this.settings = null;
    this.periods = [];
    this.index = 0;
  }

  public onStart = (): void => {
    this.updateTargets();
    this.updateEnabled();
    this.current.start();
  };

  public onPause = (): void => {
    this.current.pause();
  };

  public onSkip = (): void => {
    this.current.skip();
  };

  public onResetCycle = (): void => {
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
        this.publishState();
        return;
      }

      // Go back to previous break, and reset it
      this.index -= 1;
      this.current.reset({
        duration: minutesToMillis(breakMinutes),
        publish: false,
      });

      // Go back to previous cycle, and reset it
      this.index -= 1;
      this.current.reset({
        duration: minutesToMillis(cycleMinutes),
        publish: false,
      });

      this.publishState();
      return;
    }

    // TODO: Eliminate the redundant conditions once all possible Status values are locked in.
    if (
      this.current.status === Status.Running ||
      this.current.status === Status.Paused ||
      this.current.status === Status.Complete
    ) {
      // Reset current cycle back to Initial state
      this.current.reset({
        duration: minutesToMillis(cycleMinutes),
        publish: false,
      });

      this.publishState();
      return;
    }
  };

  public onResetAll = (): void => {
    const { cycleMinutes, breakMinutes } = this.settings;

    // Iterate all periods, and reset these
    this.periods.forEach((period, idx) => {
      const duration = idx % 2 === 0 ? cycleMinutes : breakMinutes;
      period.reset({ duration: minutesToMillis(duration), publish: false });
    });

    // Reset the timeline index back to 0
    this.index = 0;
    this.publishState();
  };

  public onPreload = (): void => {
    this.publishState();
  };

  public onMonitorTick = (): void => {
    // - Pause timer
    this.current.stop();

    const periodID = this.determineCorrectPeriodID();

    if (periodID !== this.index) {
      // - Mark all periods between this.index and periodID as complete
      // - Handle notifications for those periods?
      // - Set index to periodID
      this.index = periodID;
      // - Adjust remaining
      // - End? If remaining is < 1min
      const remaining = this.current.target - Date.now();
      this.current.remaining = remaining;
      this.current.status = Status.Running;
      // - Resume timer
      this.current.run();
      return;
    }

    // The case where the period is indeed the current one
    // - Adjust remaining
    // - End? If remaining is < 1sec
    const remaining = this.current.target - Date.now();
    this.current.remaining = remaining;
    this.current.status = Status.Running;

    // - Resume timer
    this.current.run();
    return;
  };

  public onPeriodTick = (): void => {
    // Consider adding throttling to publishState only once per second
    // Can use a closure for this
    this.publishState();
  };

  public onPeriodEnd = (): void => {
    // this.publishState();
    this.nextPeriod();
  };

  public onNewSettings = (settings: ExtensionSettings): void => {
    this.settings = settings;
    this.updateEnabled();
    this.updateTargets();
  };

  /**
   * Gets the current period in an easy-to-chain format to invoke {@link Period#Period} methods.
   */
  public get current(): Period {
    return this.periods[this.index];
  }

  public init(settings: TimelineSettings): void {
    this.settings = settings;
    this.build();
  }

  /**
   * Builds an array of new instances of the class Period.
   *
   * It uses timeline {@link Timeline#settings} to
   * initialize each period as either a cycle or a break.
   */
  build = (): void => {
    const { totalPeriods, cycleMinutes, breakMinutes } = this.settings;

    // Instantiate new periods, and populate this.periods array
    this.periods = Array.from(Array(totalPeriods)).map((_, idx) => {
      const duration = idx % 2 === 0 ? cycleMinutes : breakMinutes;

      return new Period({
        id: idx,
        duration: minutesToMillis(duration),
        mediator: this.mediator,
      });
    });
  };

  /**
   * Sets new targets to all periods that have not yet been completed.
   *
   * The first period (idx === 0) and the current period use Date.now() to serve
   * as initial reference. All consequent periods use the previous period's target plus
   * the duration of the current period.
   */
  updateTargets = (): void => {
    this.periods = this.periods.map((period, idx, arr) => {
      if (period.status === Status.Complete) {
        return period;
      }

      if (idx === 0 || idx === this.index) {
        period.target = period.remaining + Date.now();
        return period;
      }

      period.target = period.remaining + arr[idx - 1].target;
      return period;
    });
  };

  /**
   * Sets enabled or disabled status with autoStart settings to timeline periods.
   * Considerations:
   * - Period is skipped if already completed
   * - Current period is enabled by default .. @todo Consider moving this to start()
   * - Consequent periods are disabled if previous period is disabled
   */
  updateEnabled = (): void => {
    const { cycleAutoStart, breakAutoStart } = this.settings;

    this.periods = this.periods.map((period, idx, arr) => {
      // Skip completed periods
      if (period.status === Status.Complete) {
        return period;
      }

      // Always enable current period; consider adding this as part of the start() behavior, not here.
      if (idx === this.index) {
        period.enabled = true;
        return period;
      }

      // Only use previous period if this is not the first one.
      if (idx === 0) {
        return period;
      }

      // Disable period if previous is also disabled.
      const previous = arr[idx - 1];
      if (!previous.enabled) {
        period.enabled = false;
        return period;
      }

      // Apply autoStart settings.
      period.enabled = idx % 2 === 0 ? cycleAutoStart : breakAutoStart;
      return period;
    });
  };

  /**
   * Increments the Timeline's index to point to the next period.
   *
   * Note: The increment does not occur if this is called for the last period.
   */
  nextPeriod = (): void => {
    const isLast = this.index === this.settings.totalPeriods - 1;
    if (isLast) {
      this.publishState();
      // this.monitor.stop();
      return;
    }

    this.index += 1;
    if (this.current.enabled) {
      // TODO: Consider holding start() login in a different place since it is used in at least 2 places.
      this.onStart();
    }
  };

  publishState = (): void => {
    const data = {
      ...this.current.state,
      totalPeriods: this.settings.totalPeriods,
    };

    this.mediator.publish('MessageRequest', data);
  };

  determineCorrectPeriodID = (): number => {
    // Identify periods that have not yet been completed
    const pending = this.periods.filter(
      (period) => period.status !== Status.Complete
    );

    console.log('Timeline - Pending periods:');
    console.log(pending);

    // Identify enabled periods
    const subjects = pending.filter((period) => period.enabled);
    console.log('Timeline - Filtered periods:');
    console.log(subjects);

    // Find the period with a target closest to the current time.
    const [result] = subjects.filter((period, idx, arr) => {
      console.log(idx);
      const previous = idx - 1 >= 0 ? arr[idx - 1] : null;

      // Special case for the current period
      if (!previous) {
        if (Date.now() < period.target) {
          return true;
        }

        return false;
      }

      // Consequent periods
      if (Date.now() > previous.target && Date.now() < period.target) {
        return true;
      }

      // This is not the correct period
      return false;
    });

    console.log(`Timeline - Determined period: ${result.id}`);

    return result.id;
  };
}
