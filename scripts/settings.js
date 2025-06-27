// Settings page functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  await loadSettings();
  
  // Event listeners
  document.getElementById('frequencySlider').addEventListener('input', updateFrequencyDisplay);
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('masterToggle').addEventListener('change', toggleExtension);
});

async function loadSettings() {
  const result = await chrome.storage.local.get(['userPreferences', 'extensionEnabled']);
  
  if (result.userPreferences) {
    // Set frequency slider
    const frequency = result.userPreferences.frequency || 60;
    document.getElementById('frequencySlider').value = frequency;
    updateFrequencyDisplay();
    
    // Set active hours
    const activeHours = result.userPreferences.activeHours || 'always';
    document.getElementById('activeHours').value = activeHours;
    
    // Set focus areas
    // First uncheck all
    document.querySelectorAll('input[name="focus"]').forEach(cb => cb.checked = false);
    
    if (result.userPreferences.focusAreas) {
      result.userPreferences.focusAreas.forEach(area => {
        const checkbox = document.querySelector(`input[name="focus"][value="${area}"]`);
        if (checkbox) checkbox.checked = true;
      });
    } else if (result.userPreferences.painPoints) {
      // Fallback for old data format
      result.userPreferences.painPoints.forEach(point => {
        const checkbox = document.querySelector(`input[name="focus"][value="${mapPainPointToFocus(point)}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    // Set sound toggle
    const soundEnabled = result.userPreferences.soundEnabled !== false; // Default to true
    document.getElementById('soundToggle').checked = soundEnabled;
    
    // Set exercise duration
    const exerciseDuration = result.userPreferences.exerciseDuration || 'quick';
    document.getElementById('exerciseDuration').value = exerciseDuration;
  }
  
  // Set master toggle
  const enabled = result.extensionEnabled !== false; // Default to true
  document.getElementById('masterToggle').checked = enabled;
}

function mapPainPointToFocus(painPoint) {
  const mapping = {
    'neck_shoulders': 'neck',
    'back': 'back',
    'wrist_hand': 'wrists',
    'eyes': 'eyes',
    'posture': 'back'
  };
  return mapping[painPoint] || painPoint;
}

function updateFrequencyDisplay() {
  const slider = document.getElementById('frequencySlider');
  const display = document.getElementById('frequencyValue');
  display.textContent = `${slider.value} minutes`;
}

async function saveSettings() {
  // Collect all settings
  const frequency = parseInt(document.getElementById('frequencySlider').value);
  const activeHours = document.getElementById('activeHours').value;
  const focusAreas = Array.from(document.querySelectorAll('input[name="focus"]:checked'))
    .map(cb => cb.value);
  const soundEnabled = document.getElementById('soundToggle').checked;
  const exerciseDuration = document.getElementById('exerciseDuration').value;
  
  // Get existing preferences
  const { userPreferences = {} } = await chrome.storage.local.get(['userPreferences']);
  
  // Update preferences
  userPreferences.frequency = frequency;
  userPreferences.activeHours = activeHours;
  userPreferences.focusAreas = focusAreas;
  userPreferences.soundEnabled = soundEnabled;
  userPreferences.exerciseDuration = exerciseDuration;
  
  // Map exercise duration to breakType for backward compatibility
  userPreferences.breakType = exerciseDuration;
  
  // Mark onboarding as completed if it wasn't already
  await chrome.storage.local.set({ 
    userPreferences,
    onboardingCompleted: true 
  });
  
  console.log('Settings saved:', userPreferences);
  
  // Update alarm
  chrome.runtime.sendMessage({
    type: 'updatePreferences',
    preferences: userPreferences
  });
  
  // Show success message
  showSuccessToast();
}

async function toggleExtension(event) {
  const enabled = event.target.checked;
  
  await chrome.storage.local.set({ extensionEnabled: enabled });
  
  if (enabled) {
    // Re-enable alarms
    chrome.runtime.sendMessage({ type: 'enableExtension' });
  } else {
    // Disable alarms
    chrome.runtime.sendMessage({ type: 'disableExtension' });
  }
}

function showSuccessToast() {
  const toast = document.getElementById('successToast');
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      toast.style.display = 'none';
      toast.style.animation = '';
    }, 300);
  }, 2000);
}