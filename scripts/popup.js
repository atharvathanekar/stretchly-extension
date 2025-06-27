// Popup script for Stretchly extension

document.addEventListener('DOMContentLoaded', async () => {
  // Load and display progress
  const stats = await getStats();
  updateProgressDisplay(stats);
  
  // Load next stretch
  const nextStretch = await getNextStretch();
  updateNextStretchDisplay(nextStretch);
  
  // Event listeners
  document.getElementById('startNowBtn').addEventListener('click', startStretchNow);
  document.getElementById('settingsLink').addEventListener('click', openSettings);
  document.getElementById('testNotificationBtn').addEventListener('click', testNotification);
  document.getElementById('checkAlarmsBtn').addEventListener('click', checkAlarms);
});

async function getStats() {
  const result = await chrome.storage.local.get(['dailyStats']);
  const today = new Date().toDateString();
  
  if (result.dailyStats && result.dailyStats.date === today) {
    return result.dailyStats;
  }
  
  // Return default stats if none exist for today
  return {
    date: today,
    completedStretches: 0,
    totalStretches: 8, // Based on 8-hour workday with hourly reminders
    skippedStretches: 0
  };
}

async function getNextStretch() {
  // Get user preferences
  const { userPreferences } = await chrome.storage.local.get(['userPreferences']);
  
  if (!userPreferences) {
    // Return a default stretch if no preferences
    return {
      name: 'Neck Rolls',
      duration: '1 minute',
      category: 'neck'
    };
  }
  
  // Send message to background script to get personalized stretch
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'getNextStretch' }, (response) => {
      if (response && response.stretch) {
        resolve({
          name: response.stretch.title,
          duration: `${Math.ceil(response.stretch.duration / 60)} minute${response.stretch.duration > 60 ? 's' : ''}`,
          category: response.stretch.targets[0]
        });
      } else {
        // Fallback
        resolve({
          name: 'Neck Rolls',
          duration: '1 minute',
          category: 'neck'
        });
      }
    });
  });
}

function updateProgressDisplay(stats) {
  const progressNumber = document.querySelector('.progress-number');
  const progressRingFill = document.querySelector('.progress-ring-fill');
  
  progressNumber.textContent = stats.completedStretches;
  
  // Calculate progress percentage
  const percentage = (stats.completedStretches / stats.totalStretches) * 100;
  const circumference = 2 * Math.PI * 52; // radius = 52
  const offset = circumference - (percentage / 100) * circumference;
  
  progressRingFill.style.strokeDashoffset = offset;
}

function updateNextStretchDisplay(stretch) {
  const nextStretchName = document.querySelector('.next-stretch-name');
  nextStretchName.textContent = stretch.name;
}

async function startStretchNow() {
  // Get personalized stretch from background
  chrome.runtime.sendMessage({ type: 'getNextStretch' }, (response) => {
    if (response && response.stretch) {
      chrome.tabs.create({
        url: `stretches/stretch-detail.html?id=${response.stretch.id}`
      });
    } else {
      // Fallback to neck-roll if no response
      chrome.tabs.create({
        url: `stretches/stretch-detail.html?id=neck-roll`
      });
    }
    window.close();
  });
}

function openSettings() {
  chrome.tabs.create({
    url: 'settings.html'
  });
  
  window.close();
}

async function testNotification() {
  // Send message to background script to show test notification
  chrome.runtime.sendMessage({ type: 'testNotification' }, (response) => {
    if (response && response.success) {
      console.log('Test notification sent');
    }
  });
  
  // Close popup
  window.close();
}

async function checkAlarms() {
  // Check current alarms
  chrome.runtime.sendMessage({ type: 'checkAlarms' }, (response) => {
    if (response && response.alarms) {
      if (response.alarms.length === 0) {
        alert('No alarms are currently set. Please complete onboarding or check settings.');
      } else {
        const alarmInfo = response.alarms.map(alarm => {
          const nextTime = new Date(alarm.scheduledTime);
          return `${alarm.name}: Next at ${nextTime.toLocaleTimeString()} (every ${alarm.periodInMinutes} min)`;
        }).join('\n');
        alert(`Active alarms:\n${alarmInfo}`);
      }
    }
  });
}