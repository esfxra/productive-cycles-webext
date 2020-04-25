// Saves options to chrome.storage.local
function save_options() {
  var time = parseInt(document.getElementById('minutes').value);
  var cycleNumber = parseInt(document.getElementById('cycles').value);
  chrome.storage.local.set({
    minutes: time,
    totalCycles: cycleNumber
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(["minutes", "totalCycles"], function (items) {
    document.getElementById('minutes').value = items.minutes;
    document.getElementById('cycles').value = items.totalCycles;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);