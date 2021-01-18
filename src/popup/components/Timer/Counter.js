'use strict';

import React from 'react';
import './Counter.css';

const Counter = ({ time }) => {
  return (
    <div class="counter">
      <div id="time">{time}</div>
    </div>
  );
};

export default Counter;
