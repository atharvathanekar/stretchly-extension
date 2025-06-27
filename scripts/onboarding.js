let currentStep = 1;
const totalSteps = 4;
const userPreferences = {
  reasons: [],
  environment: '',
  hours: '',
  painPoints: [],
  frequency: 60,
  breakType: 'quick',
  schedule: 'always'
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateProgressBar();
  
  // Add button event listeners
  setupButtonListeners();
});

function setupEventListeners() {
  // Checkbox change events
  document.querySelectorAll('.checkbox-input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const parent = this.closest('.checkbox-item');
      if (this.checked) {
        parent.classList.add('selected');
      } else {
        parent.classList.remove('selected');
      }
      
      // Handle "none of the above" logic
      if (this.name === 'pain_point' && this.value === 'none' && this.checked) {
        document.querySelectorAll('input[name="pain_point"]:not([value="none"])').forEach(cb => {
          cb.checked = false;
          cb.closest('.checkbox-item').classList.remove('selected');
        });
      } else if (this.name === 'pain_point' && this.value !== 'none' && this.checked) {
        const noneCheckbox = document.querySelector('input[name="pain_point"][value="none"]');
        if (noneCheckbox) {
          noneCheckbox.checked = false;
          noneCheckbox.closest('.checkbox-item').classList.remove('selected');
        }
      }
    });
  });

  // Radio change events
  document.querySelectorAll('.radio-input').forEach(radio => {
    radio.addEventListener('change', function() {
      // Remove selected class from all radio items in the group
      document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
        r.closest('.radio-item').classList.remove('selected');
      });
      
      // Add selected class to current item
      if (this.checked) {
        this.closest('.radio-item').classList.add('selected');
      }
    });
  });
}

function setupButtonListeners() {
  // Continue buttons
  const step1Continue = document.getElementById('step1Continue');
  const step2Continue = document.getElementById('step2Continue');
  const step3Continue = document.getElementById('step3Continue');
  
  // Back buttons
  const step2Back = document.getElementById('step2Back');
  const step3Back = document.getElementById('step3Back');
  const step4Back = document.getElementById('step4Back');
  
  // Complete button
  const step4Complete = document.getElementById('step4Complete');
  
  // Add event listeners
  if (step1Continue) step1Continue.addEventListener('click', nextStep);
  if (step2Continue) step2Continue.addEventListener('click', nextStep);
  if (step3Continue) step3Continue.addEventListener('click', nextStep);
  
  if (step2Back) step2Back.addEventListener('click', previousStep);
  if (step3Back) step3Back.addEventListener('click', previousStep);
  if (step4Back) step4Back.addEventListener('click', previousStep);
  
  if (step4Complete) step4Complete.addEventListener('click', completeOnboarding);
}

function nextStep() {
  console.log('Next step clicked, current step:', currentStep);
  
  if (!validateCurrentStep()) {
    console.log('Validation failed');
    return;
  }
  
  try {
    saveStepData();
  } catch (error) {
    console.error('Error saving step data:', error);
    showError('An error occurred. Please try again.');
    return;
  }
  
  if (currentStep < totalSteps) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgressBar();
    console.log('Moved to step:', currentStep);
  }
}

function previousStep() {
  if (currentStep > 1) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgressBar();
  }
}

function updateProgressBar() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
}

function validateCurrentStep() {
  let isValid = true;
  console.log('Validating step:', currentStep);
  
  switch(currentStep) {
    case 1:
      const reasons = document.querySelectorAll('input[name="reason"]:checked');
      console.log('Checked reasons:', reasons.length);
      if (reasons.length === 0) {
        showError('Please select at least one option');
        isValid = false;
      }
      break;
      
    case 2:
      const environment = document.querySelector('input[name="environment"]:checked');
      const hours = document.querySelector('input[name="hours"]:checked');
      if (!environment || !hours) {
        showError('Please answer all questions');
        isValid = false;
      }
      break;
      
    case 3:
      const painPoints = document.querySelectorAll('input[name="pain_point"]:checked');
      if (painPoints.length === 0) {
        showError('Please select at least one option');
        isValid = false;
      }
      break;
  }
  
  return isValid;
}

function saveStepData() {
  switch(currentStep) {
    case 1:
      userPreferences.reasons = Array.from(document.querySelectorAll('input[name="reason"]:checked'))
        .map(cb => cb.value);
      break;
      
    case 2:
      const envElement = document.querySelector('input[name="environment"]:checked');
      const hoursElement = document.querySelector('input[name="hours"]:checked');
      if (envElement) userPreferences.environment = envElement.value;
      if (hoursElement) userPreferences.hours = hoursElement.value;
      break;
      
    case 3:
      userPreferences.painPoints = Array.from(document.querySelectorAll('input[name="pain_point"]:checked'))
        .map(cb => cb.value);
      break;
      
    case 4:
      userPreferences.frequency = parseInt(document.querySelector('input[name="frequency"]:checked').value);
      userPreferences.breakType = document.querySelector('input[name="break_type"]:checked').value;
      break;
  }
}

function showError(message) {
  // Create a subtle error notification
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: var(--danger-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease-out;
    z-index: 1000;
  `;
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);
}

async function completeOnboarding() {
  if (!validateCurrentStep()) {
    return;
  }
  
  saveStepData();
  
  // Generate personalized stretching plan
  const personalizedPlan = generatePersonalizedPlan(userPreferences);
  
  // Save preferences and plan to Chrome storage
  try {
    await chrome.storage.local.set({
      userPreferences: userPreferences,
      personalizedPlan: personalizedPlan,
      onboardingCompleted: true,
      installDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    // Set up the alarm for notifications with personalized frequency
    await chrome.alarms.create('stretchReminder', {
      periodInMinutes: personalizedPlan.frequency
    });
    
    // Show personalized success message with the plan
    showPersonalizedSuccessMessage(personalizedPlan);
    
    // Send message to background script to update preferences
    chrome.runtime.sendMessage({
      type: 'onboardingCompleted',
      preferences: userPreferences,
      plan: personalizedPlan
    });
    
    // Close the tab after a delay
    setTimeout(() => {
      window.close();
    }, 6000); // Allow time to read the personalized plan
    
  } catch (error) {
    console.error('Error saving preferences:', error);
    showError('Something went wrong. Please try again.');
  }
}

function generatePersonalizedPlan(preferences) {
  // Create a comprehensive personalized stretching plan
  const plan = {
    frequency: calculateOptimalFrequency(preferences),
    focusAreas: determineFocusAreas(preferences),
    stretchCategories: [],
    dailyGoals: {},
    intensity: determineIntensity(preferences),
    sessionDuration: preferences.breakType || 'medium',
    recommendation: '',
    stats: {
      estimatedDailySessions: 0,
      targetAreasCount: 0,
      personalizedExercises: 0
    }
  };
  
  // Calculate daily sessions
  plan.stats.estimatedDailySessions = Math.floor(8 * 60 / plan.frequency);
  
  // Determine stretch categories based on user profile
  plan.stretchCategories = determineStretchCategories(preferences, plan.focusAreas);
  plan.stats.targetAreasCount = plan.focusAreas.length;
  plan.stats.personalizedExercises = plan.stretchCategories.length * 3; // Average 3 exercises per category
  
  // Set daily goals
  plan.dailyGoals = {
    minimumSessions: Math.max(4, Math.floor(plan.stats.estimatedDailySessions * 0.6)),
    targetSessions: plan.stats.estimatedDailySessions,
    focusAreaRotation: true,
    includeBreathing: preferences.painPoints && preferences.painPoints.length > 2
  };
  
  // Generate personalized recommendation
  plan.recommendation = generateRecommendation(preferences, plan);
  
  return plan;
}

function calculateOptimalFrequency(preferences) {
  let baseFrequency = preferences.frequency || 60;
  
  // Adjust based on pain severity
  const painCount = preferences.painPoints?.filter(p => p !== 'none').length || 0;
  if (painCount >= 3) {
    baseFrequency = Math.min(baseFrequency, 45);
  } else if (painCount >= 2) {
    baseFrequency = Math.min(baseFrequency, 50);
  }
  
  // Adjust based on sitting hours
  if (preferences.hours === '8_plus') {
    baseFrequency = Math.min(baseFrequency - 5, 45);
  } else if (preferences.hours === '6_8') {
    baseFrequency = Math.min(baseFrequency, 60);
  }
  
  // Adjust based on work environment
  if (preferences.environment === 'home') {
    // Can take more frequent breaks at home
    baseFrequency = Math.min(baseFrequency, 50);
  }
  
  return baseFrequency;
}

function determineFocusAreas(preferences) {
  const focusMap = {
    'neck_shoulders': { name: 'Neck & Shoulders', priority: 3 },
    'back': { name: 'Back & Spine', priority: 3 },
    'wrist_hand': { name: 'Wrists & Hands', priority: 2 },
    'eyes': { name: 'Eye Strain', priority: 2 },
    'posture': { name: 'Posture Improvement', priority: 3 }
  };
  
  const areas = [];
  
  // Add areas from pain points
  if (preferences.painPoints) {
    preferences.painPoints.forEach(point => {
      if (point !== 'none' && focusMap[point]) {
        areas.push(focusMap[point]);
      }
    });
  }
  
  // Add areas based on reasons
  if (preferences.reasons) {
    if (preferences.reasons.includes('desk_work') && !areas.find(a => a.name === 'Neck & Shoulders')) {
      areas.push({ name: 'Neck & Shoulders', priority: 2 });
    }
    if (preferences.reasons.includes('gaming') && !areas.find(a => a.name === 'Wrists & Hands')) {
      areas.push({ name: 'Wrists & Hands', priority: 3 });
    }
  }
  
  // Sort by priority
  return areas.sort((a, b) => b.priority - a.priority);
}

function determineStretchCategories(preferences, focusAreas) {
  const categories = [];
  
  // Core categories based on focus areas
  focusAreas.forEach(area => {
    switch(area.name) {
      case 'Neck & Shoulders':
        categories.push('neck_stretches', 'shoulder_mobility');
        break;
      case 'Back & Spine':
        categories.push('spinal_mobility', 'back_strengthening');
        break;
      case 'Wrists & Hands':
        categories.push('wrist_stretches', 'finger_exercises');
        break;
      case 'Eye Strain':
        categories.push('eye_exercises', 'focus_breaks');
        break;
      case 'Posture Improvement':
        categories.push('posture_correction', 'core_activation');
        break;
    }
  });
  
  // Always include some general movement
  categories.push('circulation_boosters');
  
  // Add breathing if high stress indicated
  if (preferences.painPoints && preferences.painPoints.length > 2) {
    categories.push('breathing_exercises');
  }
  
  // Remove duplicates
  return [...new Set(categories)];
}

function determineIntensity(preferences) {
  // Base intensity on break type and environment
  if (preferences.breakType === 'quick') return 'light';
  if (preferences.breakType === 'long') return 'moderate';
  if (preferences.environment === 'office') return 'light'; // More discrete
  return 'medium';
}

function generateRecommendation(preferences, plan) {
  const recommendations = [];
  
  // Frequency recommendation
  if (plan.frequency <= 45) {
    recommendations.push('frequent breaks are essential for your condition');
  }
  
  // Pain-based recommendations
  const painCount = preferences.painPoints?.filter(p => p !== 'none').length || 0;
  if (painCount >= 3) {
    recommendations.push('multiple pain areas detected - consistency is key');
  }
  
  // Hours-based recommendations
  if (preferences.hours === '8_plus') {
    recommendations.push('long sitting hours require regular movement');
  }
  
  // Environment-based recommendations
  if (preferences.environment === 'office') {
    recommendations.push('discrete exercises selected for office setting');
  }
  
  // Combine recommendations
  if (recommendations.length > 0) {
    return `Based on your profile: ${recommendations.join(', ')}.`;
  }
  
  return 'Your personalized plan is optimized for your work style and health needs.';
}

function showSuccessMessage() {
  document.querySelector('.onboarding-container').innerHTML = `
    <div class="success-message fade-in">
      <div class="success-icon">✨</div>
      <h1 class="heading-lg">You're all set!</h1>
      <p class="subtitle">Stretchly will start reminding you to stretch based on your preferences.</p>
      <p class="subtitle">You can adjust your settings anytime by clicking the extension icon.</p>
    </div>
  `;
}

function showPersonalizedSuccessMessage(plan) {
  const focusAreasHtml = plan.focusAreas.length > 0 
    ? `<div class="focus-areas">
         <h3 class="heading-md">Your Focus Areas:</h3>
         <ul class="focus-list">
           ${plan.focusAreas.map(area => `<li>${area.name}</li>`).join('')}
         </ul>
       </div>`
    : '';

  const statsHtml = `
    <div class="plan-stats">
      <div class="stat-item">
        <span class="stat-number">${plan.stats.estimatedDailySessions}</span>
        <span class="stat-label">Daily Sessions</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${plan.stats.targetAreasCount}</span>
        <span class="stat-label">Target Areas</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${plan.stats.personalizedExercises}+</span>
        <span class="stat-label">Exercises</span>
      </div>
    </div>
  `;

  document.querySelector('.onboarding-container').innerHTML = `
    <div class="success-message fade-in" style="max-width: 700px; margin: 0 auto; text-align: center;">
      <div class="success-icon">✨</div>
      <h1 class="heading-lg">Your Personalized Stretching Plan is Ready!</h1>
      
      <div class="schedule-card" style="background: var(--primary-sky); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0;">
        <div class="schedule-item" style="margin-bottom: var(--space-lg);">
          <h3 class="heading-md">Optimized Schedule</h3>
          <p class="text-lg" style="color: var(--primary-sage); font-weight: 600;">Reminders every ${plan.frequency} minutes</p>
          <p class="text-sm text-muted">Intensity: ${plan.intensity} | Duration: ${plan.sessionDuration} breaks</p>
        </div>
        
        ${statsHtml}
        ${focusAreasHtml}
        
        <div class="daily-goals" style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid rgba(0,0,0,0.1);">
          <h4 class="text-sm font-medium" style="margin-bottom: var(--space-sm);">Daily Goals</h4>
          <p class="text-sm text-muted">
            Complete at least ${plan.dailyGoals.minimumSessions} of ${plan.dailyGoals.targetSessions} sessions
            ${plan.dailyGoals.includeBreathing ? ' • Include breathing exercises' : ''}
          </p>
        </div>
        
        <p class="recommendation" style="font-style: italic; color: var(--neutral-600); margin-top: var(--space-lg);">
          ${plan.recommendation}
        </p>
      </div>
      
      <p class="subtitle">Your personalized plan has been saved and activated!</p>
      <p class="text-sm text-muted">Stretchly will send your first reminder soon. Click the extension icon anytime to track progress.</p>
    </div>
  `;
  
  // Add custom styles for the success page
  const style = document.createElement('style');
  style.textContent = `
    .focus-list {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      justify-content: center;
      margin-top: var(--space-md);
    }
    
    .focus-list li {
      background: white;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      color: var(--neutral-700);
      border: 1px solid var(--neutral-200);
    }
    
    .plan-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
      margin: var(--space-lg) 0;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary-sage);
      line-height: 1;
    }
    
    .stat-label {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: var(--space-xs);
    }
    
    .schedule-card {
      animation: slideInUp 0.5s ease-out;
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}