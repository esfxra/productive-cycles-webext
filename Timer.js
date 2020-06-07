'use strict';

// Timer object
let Timer = {
  targetCycles: [],
  targetBreaks: [],
  remaining: null,
  cycle: null,
  break: null,
  status: null,
  // reset: function (time) {
  //   this.targetCycles = [];
  //   this.targetBreaks = [];
  //   this.remaining = time;
  //   this.cycle = 1;
  //   this.break = 1;
  //   this.status = 'initial';
  //   console.log('Timer reset - Cycle: 1, Break: 1');
  // },
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
