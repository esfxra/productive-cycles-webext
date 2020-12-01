// function initTrackerStorage() {
//   chrome.storage.local.get(['recentProgress'], (storage) => {
//     if (storage.recentProgress === undefined) {
//       let recentProgress = [];

//       const today = formatDate(new Date());

//       recentProgress.push({
//         date: today,
//         cycles: 0,
//       });

//       chrome.storage.local.set({ recentProgress });
//     }
//   });
// }

// function countCompletedCycle() {
//   chrome.storage.local.get(['recentProgress'], (storage) => {
//     // Stats map
//     let recentProgress = [...storage.recentProgress];

//     // Retrieve last item
//     const last_idx = recentProgress.length - 1;
//     console.log(`Last index: ${last_idx}`);
//     const latest = recentProgress[last_idx];
//     console.log(`Latest date: ${latest.date}`);
//     const today = formatDate(new Date());

//     // Compare dates
//     if (sameDay(today, latest.date)) {
//       recentProgress[last_idx] = {
//         date: latest.date,
//         cycles: latest.cycles + 1,
//       };
//     } else {
//       recentProgress.push({
//         date: today,
//         cycles: 1,
//       });
//     }

//     chrome.storage.local.set({ recentProgress });
//   });
// }

// // Utility Functions
// function formatDate(date) {
//   return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
// }

// function sameDay(date1, date2) {
//   console.log(`same day: ${date1 === date2}`);
//   return date1 === date2;
// }
