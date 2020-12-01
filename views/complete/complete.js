'use strict';

import { registerNavigation } from '../common-navigation.js';
import { loadTheme } from '../common-utils.js';

// Register menu and load theme
window.addEventListener('DOMContentLoaded', () => {
  // Register listeners for menu
  registerNavigation('timer');

  // Theme operations
  loadTheme();
});
