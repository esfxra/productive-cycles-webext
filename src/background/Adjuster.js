"use strict";

class Adjuster {
  static adjust(timer, reference) {
    timer.stopSubtractor();
    const remaining = timer.periods.current.actual(reference);

    if (remaining < 0) {
      return this.adjustActual(timer, reference);
    } else {
      return this.adjustCurrent(timer, reference);
    }
  }

  static determinePeriod(current, timeline, reference) {
    let period = current;
    for (let i = period; i < timeline.length - 1; i += 1) {
      const target = timeline[i].target;
      const nextIsEnabled = timeline[i + 1].enabled;

      if (reference > target && nextIsEnabled) {
        period = i + 1;
      } else break;
    }
    return period;
  }

  static endPrevious(range, timeline) {
    for (let i = range.from; i < range.to; i += 1) {
      timeline[i].end();
    }
  }

  static delay(time) {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
  }

  static adjustCurrent(timer, reference) {
    return new Promise((resolve) => {
      const surplus = timer.periods.current.adjust(reference);

      setTimeout(() => {
        timer.postState();
        timer.runSubtractor();
        resolve();
      }, surplus);
    });
  }

  static adjustActual(timer, reference) {
    const adjustedPeriod = this.determinePeriod(
      timer.periods.index,
      timer.periods.timeline,
      reference
    );

    const range = { from: timer.periods.index, to: adjustedPeriod };
    this.endPrevious(range, timer.periods.timeline);

    timer.periods.index = adjustedPeriod;

    return new Promise((resolve) => {
      if (timer.periods.current.actual(reference) < 0) {
        timer.end();
        resolve();
      } else {
        const surplus = timer.periods.current.adjust(reference);
        setTimeout(() => {
          timer.start();
          resolve();
        }, surplus);
      }
    });
  }
}

export { Adjuster };
