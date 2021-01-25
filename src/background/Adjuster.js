'use strict';

class Adjuster {
  static adjust(timer, reference) {
    timer.stopSubtractor();
    return new Promise(async (resolve) => {
      if (timer.periods.current.actual(reference) < 0) {
        const adjustedPeriod = this.determinePeriod(
          timer.periods.index,
          timer.periods.timeline,
          reference
        );

        this.endPrevious(
          timer.periods.index,
          timer.periods.timeline,
          adjustedPeriod
        );

        timer.periods.index = adjustedPeriod;

        if (timer.periods.current.actual(reference) < 0) {
          timer.end();
          resolve(true);
        } else {
          const surplus = timer.periods.current.adjust(reference);
          // const result = await this.handleSurplus(surplus);
          this.handleSurplus(surplus).then(() => {
            timer.start();
            resolve(true);
          });
        }
      } else {
        const surplus = timer.periods.current.adjust(reference);
        // const result = await this.handleSurplus(surplus);
        this.handleSurplus(surplus).then(() => {
          timer.postState();
          timer.runSubtractor();
          resolve(true);
        });
      }
    });
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

  static endPrevious(current, timeline, adjusted) {
    for (let i = current; i < adjusted; i += 1) {
      timeline[i].end();
    }
  }

  static handleSurplus(surplus) {
    return new Promise((resolve) => setTimeout(() => resolve(true), surplus));
  }
}

export { Adjuster };
