'use strict';

// Timer prototype
let Timer = {
  targetCycle: [],
  targetBreaks: [],
  remaining: null,
  cycle: null,
  break: null,
  status: null,
};

// Timer properties are set to reflect an initial state
Timer.reset = function (time) {
  this.targetCycles = [];
  this.targetBreaks = [];
  this.remaining = time;
  this.cycle = 1;
  this.break = 1;
  this.status = 'initial';
  console.debug('Timer reset.');
};

// Break is skipped by clearing timeout and calling endBreak() ahead of time
Timer.skip = function () {
  clearInterval(uiInterval);
  clearTimeout(breakTimeout);

  // Timeline correction for syncTimer()
  this.targetBreaks[this.break - 1] = Date.now();

  this.endBreak();

  console.debug(`Break skipped.`);
};

Timer.pause = function () {
  clearInterval(uiInterval);
  clearTimeout(cycleTimeout);
  this.status = 'paused';

  console.debug(`Timer paused.`);
};

// Sets Timer.status to 'running', calculates target times, and starts cycleTimeout
Timer.startCycle = function () {
  this.status = 'running';

  const reference = Date.now();

  // Fill targetCycles[] array
  let i = this.cycle - 1;
  let j = 0;
  while (i < Settings.totalCycles) {
    this.targetCycles[i] = new Date(
      reference + this.remaining * (j + 1) + Settings.breakTime * j
    );
    i++;
    j++;
  }

  // Fill targetBreaks[] array
  i = this.break - 1;
  j = 0;
  while (i < Settings.totalBreaks) {
    this.targetBreaks[i] = new Date(
      reference + this.remaining * (j + 1) + Settings.breakTime * (j + 1)
    );
    i++;
    j++;
  }

  // Call endCycle in 'remaining' seconds
  // ... 'remaining' will start as Settings.time
  // ... consider changing the timeout parameter to that
  // The arrow function is used to keep the object's context
  cycleTimeout = setTimeout(() => {
    this.endCycle();
  }, this.remaining);
  if (popUpOpen) {
    uiTime();
  }

  console.debug(`Cycle '${this.cycle}' has started.`);
};

// Sets Timer.status to 'complete' or calls startBreak()
Timer.endCycle = function () {
  // this.compareTargets();

  if (this.cycle === Settings.totalCycles) {
    this.status = 'complete';
    messageUI();
    notify('timer-complete');
  } else {
    notify('cycle-complete');
    this.cycle += 1;
    this.startBreak();
  }

  console.debug(`Cycle has been completed.`);
};

// Sets Timer.status to 'break', sets Timer.remaining to break, and starts breakTimeout
Timer.startBreak = function () {
  this.status = 'break';
  this.remaining = Settings.breakTime;

  messageUI();

  // See notes on cycleTimeout in start() function
  breakTimeout = setTimeout(() => {
    this.endBreak();
  }, this.remaining);
  if (popUpOpen) {
    uiTime();
  }

  console.debug(`Break '${this.break}' has started.`);
};

// Sets Timer.status to 'initial', sets Timer.remaining to cycle, and autostarts (if enabled)
Timer.endBreak = function () {
  // this.compareTargets();

  clearInterval(uiInterval);

  this.status = 'initial';
  this.remaining = Settings.time;
  this.break += 1;

  messageUI();

  if (Settings.autoStart) {
    notify('autostart');
    this.startCycle();
  } else {
    notify('break-complete');
  }

  console.debug(`Break ended.`);
};

// Debug purposes: Compare target times
Timer.compareTargets = function () {
  let targetTime = null;
  if (this.status === 'running') {
    targetTime = this.targetCycles[this.cycle - 1];
  } else if (this.status === 'break') {
    targetTime = this.targetBreaks[this.break - 1];
  }

  const testTime = new Date(Date.now());
  const difference = testTime - targetTime;

  if (Math.abs(difference) > 1000) {
    console.debug(`Expected time: '${testTime}'.`);
    console.debug(`Target time: '${targetTime}'.`);
    console.debug(
      `Potential issue with target time, difference is: '${difference}' ms.`
    );
  } else {
    console.debug(`Expected time: '${testTime}'.`);
    console.debug(`Target time: '${targetTime}'.`);
    console.debug(`Target did great, difference is: '${difference}' ms.`);
  }
};
