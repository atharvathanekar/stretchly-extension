// Popup script for Stretchly extension

let currentStretch = null; // Store the current stretch to ensure consistency

document.addEventListener('DOMContentLoaded', async () => {
  // Load and display progress
  const stats = await getStats();
  updateProgressDisplay(stats);
  
  // Load next stretch
  currentStretch = await getNextStretch();
  updateNextStretchDisplay(currentStretch);
  
  // Event listeners
  document.getElementById('startNowBtn').addEventListener('click', startStretchNow);
  document.getElementById('settingsLink').addEventListener('click', openSettings);
  // document.getElementById('testNotificationBtn').addEventListener('click', testNotification);
  document.getElementById('debugBtn').addEventListener('click', showDebugInfo);
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
          id: response.stretch.id,
          name: response.stretch.title,
          duration: `${Math.ceil(response.stretch.duration / 60)} minute${response.stretch.duration > 60 ? 's' : ''}`,
          category: response.stretch.targets[0]
        });
      } else {
        // Fallback
        resolve({
          id: 'neck-roll',
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
  
  if (progressNumber) {
    progressNumber.textContent = stats.completedStretches;
  } else {
    console.error('Progress number element not found');
  }
  
  if (progressRingFill) {
    // Calculate progress percentage
    const percentage = (stats.completedStretches / stats.totalStretches) * 100;
    const circumference = 2 * Math.PI * 52; // radius = 52
    const offset = circumference - (percentage / 100) * circumference;
    
    progressRingFill.style.strokeDashoffset = offset;
  } else {
    console.error('Progress ring fill element not found');
  }
}

function updateNextStretchDisplay(stretch) {
  const nextStretchName = document.querySelector('.next-stretch-name');
  if (nextStretchName) {
    nextStretchName.textContent = stretch.name;
  } else {
    console.error('Next stretch name element not found');
  }
}

async function startStretchNow() {
  // Use the already loaded stretch to ensure consistency
  if (currentStretch && currentStretch.id) {
    chrome.tabs.create({
      url: `stretches/stretch-detail.html?id=${currentStretch.id}`
    });
  } else {
    // Fallback to neck-roll if no current stretch
    chrome.tabs.create({
      url: `stretches/stretch-detail.html?id=neck-roll`
    });
  }
  window.close();
}

function openSettings() {
  chrome.tabs.create({
    url: 'settings.html'
  });
  
  window.close();
}

async function testNotification() {
  // First check if we have notification permission
  chrome.permissions.contains({
    permissions: ['notifications']
  }, (result) => {
    if (result) {
      // We have permission, send test notification
      chrome.runtime.sendMessage({ type: 'testNotification' }, (response) => {
        if (response && response.success) {
          console.log('Test notification sent');
        }
      });
    } else {
      // Request permission
      chrome.permissions.request({
        permissions: ['notifications']
      }, (granted) => {
        if (granted) {
          // Permission granted, send test notification
          chrome.runtime.sendMessage({ type: 'testNotification' }, (response) => {
            if (response && response.success) {
              console.log('Test notification sent');
            }
          });
        } else {
          alert('Notification permission denied. Please enable notifications for this extension.');
        }
      });
    }
  });
  
  // Close popup after a delay
  setTimeout(() => window.close(), 500);
}

async function showDebugInfo() {
  // Get comprehensive debug information
  chrome.runtime.sendMessage({ type: 'diagnostics' }, async (response) => {
    if (response && response.diagnostics) {
      const diag = response.diagnostics;
      
      let message = '🔍 DEBUG INFORMATION\n\n';
      
      // Check key issues
      const issues = [];
      
      if (!diag.permissions.permissions.includes('notifications')) {
        issues.push('❌ Missing notification permission');
      }
      
      if (!diag.userPreferences) {
        issues.push('❌ No user preferences set');
      }
      
      if (!diag.storage.onboardingCompleted) {
        issues.push('❌ Onboarding not completed');
      }
      
      if (!diag.alarms || diag.alarms.length === 0) {
        issues.push('❌ No active alarms');
      }
      
      if (issues.length > 0) {
        message += 'ISSUES:\n' + issues.join('\n') + '\n\n';
      } else {
        message += '✅ All systems operational\n\n';
      }
      
      // Show current settings
      message += 'SETTINGS:\n';
      if (diag.userPreferences) {
        message += `• Frequency: ${diag.userPreferences.frequency || 'Not set'} min\n`;
        message += `• Active Hours: ${diag.userPreferences.activeHours || 'always'}\n`;
        message += `• Sound: ${diag.userPreferences.soundEnabled ? 'On' : 'Off'}\n`;
        message += `• Duration: ${diag.userPreferences.exerciseDuration || 'quick'}\n`;
      } else {
        message += '• No preferences saved\n';
      }
      
      // Show alarm status
      message += '\nALARMS:\n';
      if (diag.alarms && diag.alarms.length > 0) {
        diag.alarms.forEach(alarm => {
          const next = new Date(alarm.scheduledTime);
          const now = new Date();
          const minutesUntilNext = Math.round((next - now) / 60000);
          message += `• Next reminder: ${next.toLocaleTimeString()} (in ${minutesUntilNext} min)\n`;
        });
      } else {
        message += '• No alarms active\n';
      }
      
      // Add quick actions
      message += '\n━━━━━━━━━━━━━━━\n';
      
      if (issues.length > 0) {
        message += '\nWould you like to activate with default settings?';
        
        if (confirm(message)) {
          // Set default preferences and alarm
          chrome.runtime.sendMessage({ type: 'setDefaultAlarm' }, (response) => {
            if (response && response.success) {
              alert('✅ Settings activated!\n\nNotifications will start in 30 seconds.');
            }
          });
        }
      } else {
        message += '\nOptions:\n';
        message += '• Click "Test Notification" to test\n';
        message += '• Go to Settings to adjust preferences\n';
        message += '• Check console for detailed logs';
        
        alert(message);
      }
      
      // Always log full diagnostics to console
      console.log('Full diagnostics:', diag);
    } else {
      // Fallback to simple check
      const prefs = await chrome.storage.local.get(['userPreferences', 'onboardingCompleted']);
      chrome.runtime.sendMessage({ type: 'checkAlarms' }, (response) => {
        let message = '🔍 DEBUG INFO\n\n';
        message += `Onboarding: ${prefs.onboardingCompleted ? 'Complete' : 'Incomplete'}\n`;
        message += `Alarms: ${response?.alarms?.length || 0} active\n\n`;
        message += 'Check browser console for details.';
        alert(message);
      });
    }
  });
}

