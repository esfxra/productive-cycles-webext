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

Timer.reset = function (time) {
  this.targetCycles = [];
  this.targetBreaks = [];
  this.remaining = time;
  this.cycle = 1;
  this.break = 1;
  this.status = 'initial';
  console.debug('Timer reset.');
};

// Sets Timer.status to 'running', calculates target times, and starts cycleTimeout
Timer.start = function () {
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
  //   compareTargets();

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
  //   compareTargets();

  clearInterval(uiInterval);

  this.status = 'initial';
  this.remaining = Settings.time;
  this.break += 1;

  messageUI();

  if (Settings.autoStart) {
    notify('autostart');
    this.start();
  } else {
    notify('break-complete');
  }

  console.debug(`Break ended.`);
};
