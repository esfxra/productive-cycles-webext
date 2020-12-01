// 'use strict';

// let lightTheme = false;
// let darkTheme = false;

// // Restore options, register listeners for user input, and load theme
// window.addEventListener('DOMContentLoaded', () => {
//   // Load stats
//   loadRecentProgress();

//   // Register listeners for menu
//   registerMenu();

//   // Theme operations
//   loadTheme();
// });

// function loadRecentProgress() {
//   chrome.storage.local.get(['recentProgress'], (storage) => {
//     // console.log(storage.recentProgress);

//     const latest_idx = storage.recentProgress.length - 1;

//     // const today = formatDate(new Date());
//     const latest = storage.recentProgress[latest_idx];

//     console.log(latest);

//     // Find last week range
//     // let thisWeek = [];

//     // Find last month range
//     // let thisMonth = [];

//     // Find last year range
//     // let thisYear = [];

//     // Calculate weekly count

//     // Calculate monthly count

//     // Calculate yearly count
//   });
// }

// function loadTheme() {
//   // Check what is the theme saved in storage
//   let stylesheet = document.querySelector('#theme');

//   chrome.storage.local.get({ theme: 'light' }, function (items) {
//     if (items.theme === 'light') {
//       lightTheme = true;
//       darkTheme = false;

//       if (!stylesheet.href.includes('timer-light')) {
//         stylesheet.href = 'light.css';
//       }
//     } else {
//       darkTheme = true;
//       lightTheme = false;

//       if (!stylesheet.href.includes('timer-dark')) {
//         stylesheet.href = 'dark.css';
//       }
//     }
//   });
// }
