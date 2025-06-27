// Background service worker for Stretchly
let userPreferences = null;
let personalizedPlan = null;
let snoozeCount = 0;

// Initialize the extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({
      url: 'onboarding.html'
    });
  }
  
  // Load user preferences and personalized plan
  const data = await chrome.storage.local.get(['userPreferences', 'personalizedPlan', 'onboardingCompleted']);
  if (data.onboardingCompleted && data.userPreferences) {
    userPreferences = data.userPreferences;
    personalizedPlan = data.personalizedPlan;
    setupAlarm();
  }
});

// Also load preferences when service worker starts
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['userPreferences', 'personalizedPlan', 'onboardingCompleted']);
  if (data.onboardingCompleted && data.userPreferences) {
    userPreferences = data.userPreferences;
    personalizedPlan = data.personalizedPlan;
    setupAlarm();
  }
});

// Load preferences immediately when background script runs
(async () => {
  const data = await chrome.storage.local.get(['userPreferences', 'personalizedPlan', 'onboardingCompleted']);
  if (data.onboardingCompleted && data.userPreferences) {
    userPreferences = data.userPreferences;
    personalizedPlan = data.personalizedPlan;
    setupAlarm();
  }
})();

// Setup alarm based on user preferences
async function setupAlarm() {
  if (!userPreferences && !personalizedPlan) {
    console.log('No user preferences found, cannot set alarm');
    return;
  }
  
  // Clear existing alarms
  await chrome.alarms.clearAll();
  
  // Use personalized frequency if available (convert to minutes if needed)
  let frequency = personalizedPlan?.frequency || userPreferences?.frequency || 60;
  
  // Ensure frequency is a number and at least 1 minute
  frequency = Math.max(1, parseInt(frequency));
  
  console.log('Setting up alarm with frequency:', frequency, 'minutes');
  
  // Create new alarm with initial delay and then periodic
  chrome.alarms.create('stretchReminder', {
    delayInMinutes: frequency,
    periodInMinutes: frequency
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating alarm:', chrome.runtime.lastError);
    } else {
      console.log(`Stretch reminder alarm created successfully for every ${frequency} minutes`);
      // Log all alarms to verify
      chrome.alarms.getAll((alarms) => {
        console.log('Current alarms:', alarms);
      });
    }
  });
}

// Handle alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'stretchReminder') {
    console.log('Stretch reminder alarm fired');
    await showStretchNotification();
  } else if (alarm.name === 'snoozeReminder') {
    console.log('Snooze reminder alarm fired');
    await showStretchNotification();
  }
});

// Show stretch notification
async function showStretchNotification() {
  try {
    const stretch = await getPersonalizedStretch();
    
    // Create notification
    const notificationId = `stretch-${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'images/icon-128.png',
      title: 'Time to Stretch!',
      message: stretch.title,
      buttons: [
        { title: 'Start' },
        { title: 'Snooze (5 min)' }
      ],
      requireInteraction: true,
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Notification error:', chrome.runtime.lastError);
      } else {
        console.log('Notification created:', notificationId);
      }
    });
  } catch (error) {
    console.error('Error showing notification:', error);
    
    // Try a simple notification as fallback
    chrome.notifications.create('stretch-fallback', {
      type: 'basic',
      iconUrl: 'images/icon-128.png',
      title: 'Time to Stretch!',
      message: 'Take a break and stretch your body',
      requireInteraction: true,
      priority: 2
    });
  }
}

// Note: Removed importScripts as it can cause issues in service workers
// Will use basic stretch selection instead

// Get personalized stretch based on user preferences
async function getPersonalizedStretch() {
  const stretches = await getStretchDatabase();
  
  // If no preferences, return first stretch
  if (!userPreferences && !personalizedPlan) {
    return stretches[0];
  }
  
  // Filter stretches based on break type preference
  const maxDuration = userPreferences?.breakType === 'quick' ? 60 : 180;
  const relevantStretches = stretches.filter(s => s.duration <= maxDuration);
  
  // Get last stretch to avoid repetition
  const { lastStretchId } = await chrome.storage.local.get(['lastStretchId']);
  
  // Filter out the last stretch if possible
  let availableStretches = relevantStretches;
  if (lastStretchId && relevantStretches.length > 1) {
    availableStretches = relevantStretches.filter(s => s.id !== lastStretchId);
  }
  
  // Select a random stretch
  const selectedStretch = availableStretches[Math.floor(Math.random() * availableStretches.length)];
  
  // Save the stretch ID for next time
  await chrome.storage.local.set({ lastStretchId: selectedStretch.id });
  
  return selectedStretch;
}

// Track which focus areas are being addressed
async function trackStretchForFocusArea(stretch, focusAreas) {
  const today = new Date().toDateString();
  const result = await chrome.storage.local.get(['focusAreaTracking']);
  
  let tracking = result.focusAreaTracking || {};
  if (!tracking[today]) {
    tracking[today] = {};
    focusAreas.forEach(area => {
      tracking[today][area.name] = 0;
    });
  }
  
  // Increment count for relevant focus areas
  stretch.targets.forEach(target => {
    const matchingArea = focusAreas.find(area => 
      area.name.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(area.name.toLowerCase())
    );
    if (matchingArea && tracking[today][matchingArea.name] !== undefined) {
      tracking[today][matchingArea.name]++;
    }
  });
  
  await chrome.storage.local.set({ focusAreaTracking: tracking });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId.startsWith('stretch-')) {
    chrome.notifications.clear(notificationId);
    
    if (buttonIndex === 0) {
      // Start button - open stretch page
      const stretch = await getPersonalizedStretch();
      chrome.tabs.create({
        url: `stretches/stretch-detail.html?id=${stretch.id}`
      });
      
      // Reset snooze count
      snoozeCount = 0;
      
      // Track engagement
      trackUserAction('stretch_started', stretch.id);
      
    } else if (buttonIndex === 1) {
      // Snooze button
      snoozeCount++;
      
      // Create snooze alarm for 5 minutes
      chrome.alarms.create('snoozeReminder', {
        delayInMinutes: 5
      });
      
      // Track snooze
      trackUserAction('stretch_snoozed', { count: snoozeCount });
    }
  }
});

// Note: Snooze alarm handling is already included in the main alarm listener above

// Handle notification close
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  if (notificationId.startsWith('stretch-') && byUser) {
    // User dismissed notification
    trackUserAction('stretch_dismissed');
  }
});

// Track user actions for analytics
async function trackUserAction(action, data = {}) {
  const timestamp = new Date().toISOString();
  
  // Get existing analytics data
  const result = await chrome.storage.local.get('analytics');
  const analytics = result.analytics || { actions: [] };
  
  // Add new action
  analytics.actions.push({
    action,
    data,
    timestamp
  });
  
  // Keep only last 1000 actions
  if (analytics.actions.length > 1000) {
    analytics.actions = analytics.actions.slice(-1000);
  }
  
  // Save back to storage
  await chrome.storage.local.set({ analytics });
}

// Simple test notification function
async function testSimpleNotification() {
  console.log('Testing simple notification...');
  
  return new Promise((resolve) => {
    chrome.notifications.create('test-notification', {
      type: 'basic',
      iconUrl: 'images/icon-128.png',
      title: 'Stretchly Test',
      message: 'This is a test notification. If you see this, notifications are working!',
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Test notification error:', chrome.runtime.lastError);
        resolve(false);
      } else {
        console.log('Test notification created successfully:', notificationId);
        resolve(true);
      }
    });
  });
}

// Update user preferences
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'updatePreferences') {
    userPreferences = request.preferences;
    chrome.storage.local.set({ userPreferences });
    setupAlarm();
    sendResponse({ success: true });
  } else if (request.type === 'onboardingCompleted') {
    // Handle onboarding completion with personalized plan
    userPreferences = request.preferences;
    personalizedPlan = request.plan;
    chrome.storage.local.set({ 
      userPreferences,
      personalizedPlan,
      lastUpdated: new Date().toISOString()
    });
    setupAlarm();
    sendResponse({ success: true });
  } else if (request.type === 'getPreferences') {
    sendResponse({ preferences: userPreferences, plan: personalizedPlan });
  } else if (request.type === 'getNextStretch') {
    // Get the next personalized stretch
    getPersonalizedStretch().then(stretch => {
      sendResponse({ stretch });
    });
    return true; // Keep the message channel open for async response
  } else if (request.type === 'enableExtension') {
    setupAlarm();
    sendResponse({ success: true });
  } else if (request.type === 'disableExtension') {
    chrome.alarms.clearAll();
    sendResponse({ success: true });
  } else if (request.type === 'testNotification') {
    // Test notification for debugging
    testSimpleNotification().then(() => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.type === 'checkAlarms') {
    // Check current alarms
    chrome.alarms.getAll((alarms) => {
      sendResponse({ alarms });
    });
    return true;
  } else if (request.type === 'testAlarm') {
    // Manually trigger the alarm for testing
    console.log('Manually triggering stretch reminder');
    showStretchNotification().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  return true;
});

// Stretch database
async function getStretchDatabase() {
  // This would ideally be loaded from a JSON file or API
  return [
    {
      id: 'neck-roll',
      title: 'Neck Rolls',
      description: 'Gentle neck stretches to relieve tension',
      targets: ['neck_shoulders'],
      duration: 60,
      difficulty: 'easy',
      steps: [
        'Sit up straight and relax your shoulders',
        'Slowly roll your head in a circular motion',
        'Complete 5 rolls in each direction',
        'Move slowly and breathe deeply'
      ]
    },
    {
      id: 'shoulder-shrug',
      title: 'Shoulder Shrugs',
      description: 'Release shoulder tension',
      targets: ['neck_shoulders'],
      duration: 45,
      difficulty: 'easy',
      steps: [
        'Lift your shoulders up towards your ears',
        'Hold for 5 seconds',
        'Release and roll shoulders back',
        'Repeat 5-10 times'
      ]
    },
    {
      id: 'wrist-stretch',
      title: 'Wrist Flexor Stretch',
      description: 'Prevent carpal tunnel and wrist pain',
      targets: ['wrist_hand'],
      duration: 60,
      difficulty: 'easy',
      steps: [
        'Extend your arm in front of you',
        'Bend your wrist, pointing fingers up',
        'Use other hand to gently pull fingers back',
        'Hold for 15-30 seconds each hand'
      ]
    },
    {
      id: 'eye-palming',
      title: 'Eye Palming',
      description: 'Relieve eye strain and fatigue',
      targets: ['eyes'],
      duration: 90,
      difficulty: 'easy',
      steps: [
        'Rub your palms together to warm them',
        'Close your eyes and place palms over them',
        'Ensure no light enters',
        'Relax for 30-60 seconds'
      ]
    },
    {
      id: 'seated-spinal-twist',
      title: 'Seated Spinal Twist',
      description: 'Improve spine mobility and relieve back tension',
      targets: ['back', 'posture'],
      duration: 90,
      difficulty: 'medium',
      steps: [
        'Sit up straight in your chair',
        'Place right hand on left knee',
        'Place left hand behind you',
        'Twist gently to the left, hold for 30 seconds',
        'Repeat on the other side'
      ]
    },
    {
      id: 'cat-cow',
      title: 'Seated Cat-Cow',
      description: 'Mobilize the spine and improve posture',
      targets: ['back', 'posture'],
      duration: 120,
      difficulty: 'easy',
      steps: [
        'Sit on edge of chair, feet flat on floor',
        'Place hands on knees',
        'Arch your back and look up (cow)',
        'Round your spine and tuck chin (cat)',
        'Repeat 10 times slowly'
      ]
    },
    {
      id: 'desk-pushups',
      title: 'Desk Push-ups',
      description: 'Strengthen arms and improve circulation',
      targets: ['general', 'posture'],
      duration: 120,
      difficulty: 'medium',
      steps: [
        'Stand arm\'s length from your desk',
        'Place hands on desk edge, shoulder-width apart',
        'Step back and lean forward',
        'Do 10-15 push-ups against the desk'
      ]
    },
    {
      id: 'ankle-circles',
      title: 'Ankle Circles',
      description: 'Improve circulation in lower legs',
      targets: ['general'],
      duration: 60,
      difficulty: 'easy',
      steps: [
        'Lift one foot off the ground',
        'Rotate ankle in circles',
        'Do 10 circles in each direction',
        'Repeat with other foot'
      ]
    }
  ];
}