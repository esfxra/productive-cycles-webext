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
  console.log('Timer reset - Cycle: 1, Break: 1');
};

// Sets Timer.status to 'running', calculates target times, and starts cycleTimeout
Timer.start = function () {
  console.debug(`Timer.start():`);
  console.debug(`Timer.remaining: ${this.remaining}`);

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

  console.log(`Cycle ${this.cycle} starting. New status: ${this.status}`);
  cycleTimeout = setTimeout(() => {
    this.endCycle();
  }, this.remaining);
  if (popUpOpen) {
    uiTime();
  }
};

// Sets Timer.status to 'complete' or calls startBreak()
Timer.endCycle = function () {
  console.debug(`Timer.endCycle():`);
  console.debug(`Cycle ${this.cycle} completed`);
  //   compareTargets();
  // endCycle code
  if (this.cycle === Settings.totalCycles) {
    this.status = 'complete';
    messageUI();
    notify('timer-complete');
    console.log(`Timer complete. New status: ${this.status}`);
  } else {
    notify('cycle-complete');
    this.cycle += 1;
    console.debug(`Timer.cycle incremented: ${this.cycle}`);
    this.startBreak();
  }
};

// Sets Timer.status to 'break', sets Timer.remaining to break, and starts breakTimeout
Timer.startBreak = function () {
  console.debug(`Timer.startBreak()`);
  this.status = 'break';
  this.remaining = Settings.breakTime;
  console.debug(`Timer.remaining: ${this.remaining}`);
  messageUI();
  console.log(`Break ${this.break} starting. New status: ${this.status}`);
  breakTimeout = setTimeout(() => {
    this.endBreak();
  }, this.remaining);
  if (popUpOpen) {
    uiTime();
  }
};

// Sets Timer.status to 'initial', sets Timer.remaining to cycle, and autostarts (if enabled)
Timer.endBreak = function () {
  console.debug('Timer.endBreak()');
  //   compareTargets();
  // endBreak() code
  clearInterval(uiInterval);
  this.status = 'initial';
  this.remaining = Settings.time;
  this.break += 1;
  console.debug(`Timer.break incremented: ${this.break}`);
  messageUI();
  console.log('Break ended. New status:', this.status);
  if (Settings.autoStart) {
    notify('autostart');
    console.log(`Autostart: ${Settings.autoStart}, calling start()`);
    this.start();
  } else {
    notify('break-complete');
    console.log(`Autostart disabled, nothing to see here`);
  }
};
