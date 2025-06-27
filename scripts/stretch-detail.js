// Stretch detail page functionality

let timerInterval = null;
let timeRemaining = 30; // Default 30 seconds

// Load exercise videos module
let exerciseVideos = {};
let getExerciseVideo = null;

// Initialize video functions
function initializeVideos() {
  // Define exercise videos inline since we can't use require in browser
  exerciseVideos = {
    'neck-roll': {
      type: 'gif',
      url: '../images/neck-roll.gif',
      fallbackUrl: '../images/neck-roll.gif',
      description: 'Gentle neck roll demonstration'
    },
    'shoulder-shrug': {
      type: 'gif',
      url: '../images/shoulder-shrugs.gif',
      fallbackUrl: '../images/shoulder-shrugs.gif',
      description: 'Shoulder shrug and roll'
    },
    'wrist-stretch': {
      type: 'gif',
      url: '../images/wrist-flexor-stretch.gif',
      fallbackUrl: '../images/wrist-flexor-stretch.gif',
      description: 'Wrist flexor stretch'
    },
    'seated-spinal-twist': {
      type: 'gif',
      url: '../images/seated-spinal-twist.gif',
      fallbackUrl: '../images/seated-spinal-twist.gif',
      description: 'Seated spinal twist'
    },
    'eye-palming': {
      type: 'gif',
      url: '../images/eye-palming.gif',
      fallbackUrl: '../images/eye-palming.gif',
      description: 'Eye palming technique'
    },
    'cat-cow': {
      type: 'gif',
      url: '../images/cat-cow.gif',
      fallbackUrl: '../images/cat-cow-stretch.gif',
      description: 'Cat-cow stretch for spine mobility'
    },
    'desk-pushups': {
      type: 'gif',
      url: '../images/desk-pushups.gif',
      fallbackUrl: '../images/desk-pushup.gif',
      description: 'Desk push-ups for upper body strength'
    },
    'ankle-circles': {
      type: 'image',
      url: '../images/ankle-circles.webp',
      fallbackUrl: '../images/ankle-circles.webp',
      description: 'Ankle circles for circulation'
    }
  };
  
  getExerciseVideo = function(exerciseId) {
    const video = exerciseVideos[exerciseId];
    
    if (!video) {
      return `
        <div class="video-placeholder">
          <span class="placeholder-icon">🧘‍♀️</span>
          <p class="placeholder-text">Video demonstration coming soon</p>
        </div>
      `;
    }
    
    return `
      <img 
        class="exercise-video" 
        src="${video.url}" 
        alt="${video.description}"
        onerror="this.onerror=null; this.src='${video.fallbackUrl}'"
        loading="lazy"
      />
    `;
  };
}

const stretchData = {
  'neck-roll': {
    title: 'Neck Rolls',
    subtitle: 'Gentle movement to release neck tension',
    duration: 30,
    steps: [
      'Sit up straight and relax your shoulders',
      'Slowly roll your head in a circular motion',
      'Complete 5 rolls in each direction',
      'Move slowly and breathe deeply throughout'
    ],
    tips: [
      'Keep your movements slow and controlled',
      'Don\'t force any movement that causes pain',
      'Focus on your breathing - inhale and exhale deeply',
      'This exercise can be done seated or standing'
    ]
  },
  'shoulder-shrug': {
    title: 'Shoulder Shrugs',
    subtitle: 'Release shoulder tension and stress',
    duration: 45,
    steps: [
      'Lift your shoulders up towards your ears',
      'Hold for 5 seconds',
      'Release and roll shoulders back',
      'Repeat 5-10 times'
    ],
    tips: [
      'Try to touch your shoulders to your ears',
      'Exhale as you release',
      'Roll shoulders backward in a circular motion',
      'Keep your neck relaxed'
    ]
  },
  'wrist-stretch': {
    title: 'Wrist Flexor Stretch',
    subtitle: 'Prevent carpal tunnel and wrist pain',
    duration: 60,
    steps: [
      'Extend your arm in front of you',
      'Bend your wrist, pointing fingers up',
      'Use other hand to gently pull fingers back',
      'Hold for 15-30 seconds each hand'
    ],
    tips: [
      'Keep your arm straight',
      'Feel the stretch in your forearm',
      'Don\'t overstretch - mild tension is enough',
      'Do both hands equally'
    ]
  },
  'seated-spinal-twist': {
    title: 'Seated Spinal Twist',
    subtitle: 'Improve spine mobility and relieve back tension',
    duration: 90,
    steps: [
      'Sit up straight in your chair',
      'Place right hand on left knee',
      'Place left hand behind you',
      'Twist gently to the left, hold for 30 seconds',
      'Repeat on the other side'
    ],
    tips: [
      'Keep your spine tall and straight',
      'Twist from your core, not just your shoulders',
      'Breathe deeply throughout the stretch',
      'Don\'t force the twist - go only as far as comfortable'
    ]
  },
  'eye-palming': {
    title: 'Eye Palming',
    subtitle: 'Relieve eye strain and fatigue',
    duration: 90,
    steps: [
      'Rub your palms together to warm them',
      'Close your eyes and place palms over them',
      'Ensure no light enters',
      'Relax for 30-60 seconds'
    ],
    tips: [
      'Cup your hands slightly over your eyes',
      'Don\'t press on your eyeballs',
      'Take deep, relaxing breaths',
      'Visualize a peaceful, dark scene'
    ]
  },
  'cat-cow': {
    title: 'Seated Cat-Cow',
    subtitle: 'Mobilize the spine and improve posture',
    duration: 120,
    steps: [
      'Sit on edge of chair, feet flat on floor',
      'Place hands on knees',
      'Arch your back and look up (cow)',
      'Round your spine and tuck chin (cat)',
      'Repeat 10 times slowly'
    ],
    tips: [
      'Move slowly and smoothly between positions',
      'Coordinate movement with breathing',
      'Inhale during cow, exhale during cat',
      'Keep movements gentle and controlled'
    ]
  },
  'desk-pushups': {
    title: 'Desk Push-ups',
    subtitle: 'Strengthen arms and improve circulation',
    duration: 120,
    steps: [
      'Stand arm\'s length from your desk',
      'Place hands on desk edge, shoulder-width apart',
      'Step back and lean forward',
      'Do 10-15 push-ups against the desk'
    ],
    tips: [
      'Keep your body in a straight line',
      'Lower chest to desk level',
      'Push through your palms to return',
      'Adjust angle for difficulty'
    ]
  },
  'ankle-circles': {
    title: 'Ankle Circles',
    subtitle: 'Improve circulation in lower legs',
    duration: 60,
    steps: [
      'Lift one foot off the ground',
      'Rotate ankle in circles',
      'Do 10 circles in each direction',
      'Repeat with other foot'
    ],
    tips: [
      'Make large, slow circles',
      'Point and flex your toes',
      'Can be done seated or standing',
      'Great for preventing swelling'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize video functions
  initializeVideos();
  
  // Get stretch ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const stretchId = urlParams.get('id') || 'neck-roll';
  
  // Load stretch data
  loadStretchData(stretchId);
  
  // Event listeners
  document.getElementById('startTimer').addEventListener('click', handleTimerClick);
  document.getElementById('resetTimer').addEventListener('click', resetTimer);
  document.getElementById('nextStretch').addEventListener('click', loadNextStretch);
  document.getElementById('completeBtn').addEventListener('click', completeStretch);
  document.getElementById('skipBtn').addEventListener('click', skipStretch);
});

function loadStretchData(stretchId) {
  const stretch = stretchData[stretchId] || stretchData['neck-roll'];
  
  // Update title and subtitle
  document.getElementById('stretchTitle').textContent = stretch.title;
  document.querySelector('.stretch-subtitle').textContent = stretch.subtitle;
  
  // Update animation/video
  const animationContainer = document.getElementById('animationContainer');
  if (animationContainer && getExerciseVideo) {
    animationContainer.innerHTML = getExerciseVideo(stretchId);
  }
  
  // Update steps
  const stepsList = document.getElementById('stepsList');
  stepsList.innerHTML = stretch.steps.map(step => 
    `<li class="step-item">${step}</li>`
  ).join('');
  
  // Update timer duration
  timeRemaining = stretch.duration;
  updateTimerDisplay();
  
  // Update tips
  const tipsList = document.querySelector('.tips-list');
  tipsList.innerHTML = stretch.tips.map(tip => 
    `<li>${tip}</li>`
  ).join('');
  
  // Reset timer if it's running
  if (timerInterval) {
    resetTimer();
  }
}

async function loadNextStretch() {
  // Get all stretch IDs
  const allStretchIds = Object.keys(stretchData);
  
  // Get current stretch ID
  const currentId = getStretchId();
  const currentIndex = allStretchIds.indexOf(currentId);
  
  // Get next stretch ID (loop back to first if at end)
  const nextIndex = (currentIndex + 1) % allStretchIds.length;
  const nextStretchId = allStretchIds[nextIndex];
  
  // Check if we should get a personalized stretch instead
  const response = await chrome.runtime.sendMessage({ type: 'getNextStretch' });
  
  if (response && response.stretch && response.stretch.id) {
    // Use personalized stretch if available
    window.location.search = `?id=${response.stretch.id}`;
  } else {
    // Fall back to cycling through stretches
    window.location.search = `?id=${nextStretchId}`;
  }
}

function handleTimerClick() {
  const startBtn = document.getElementById('startTimer');
  
  if (!timerInterval) {
    // Timer is not running, start it
    if (startBtn.textContent === 'Start Timer' || startBtn.textContent === 'Resume') {
      startTimer();
    }
  } else {
    // Timer is running, pause it
    pauseTimer();
  }
}

function startTimer() {
  if (timerInterval) return;
  
  const startBtn = document.getElementById('startTimer');
  startBtn.textContent = 'Pause';
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      completeTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  
  const startBtn = document.getElementById('startTimer');
  startBtn.textContent = 'Resume';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  
  // Reset to original duration
  const urlParams = new URLSearchParams(window.location.search);
  const stretchId = urlParams.get('id') || 'neck-roll';
  const stretch = stretchData[stretchId] || stretchData['neck-roll'];
  
  timeRemaining = stretch.duration;
  updateTimerDisplay();
  
  const startBtn = document.getElementById('startTimer');
  startBtn.textContent = 'Start Timer';
  
  // Reset timer display color if it was changed
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.style.color = 'var(--primary-sage)';
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timerDisplay').textContent = display;
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  
  // Play completion sound if enabled
  playCompletionSound();
  
  // Show completion animation
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.textContent = 'Complete!';
  timerDisplay.style.color = 'var(--success)';
  
  // Auto-mark as complete after 2 seconds
  setTimeout(() => {
    completeStretch();
  }, 2000);
}

async function completeStretch() {
  // Update daily stats
  await updateDailyStats('completed');
  
  // Send message to background script
  chrome.runtime.sendMessage({ 
    type: 'stretchCompleted',
    stretchId: getStretchId() 
  });
  
  // Show success message and close
  showSuccessMessage();
}

async function skipStretch() {
  // Update daily stats
  await updateDailyStats('skipped');
  
  // Send message to background script
  chrome.runtime.sendMessage({ 
    type: 'stretchSkipped',
    stretchId: getStretchId() 
  });
  
  // Close the tab
  window.close();
}

function getStretchId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || 'neck-roll';
}

async function updateDailyStats(action) {
  const today = new Date().toDateString();
  const result = await chrome.storage.local.get(['dailyStats']);
  
  let stats = result.dailyStats || {
    date: today,
    completedStretches: 0,
    totalStretches: 8,
    skippedStretches: 0
  };
  
  // Reset stats if it's a new day
  if (stats.date !== today) {
    stats = {
      date: today,
      completedStretches: 0,
      totalStretches: 8,
      skippedStretches: 0
    };
  }
  
  // Update based on action
  if (action === 'completed') {
    stats.completedStretches++;
  } else if (action === 'skipped') {
    stats.skippedStretches++;
  }
  
  // Save updated stats
  await chrome.storage.local.set({ dailyStats: stats });
}

function showSuccessMessage() {
  const container = document.querySelector('.stretch-container');
  container.innerHTML = `
    <div class="success-message fade-in" style="text-align: center;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">✨</div>
      <h1 class="heading-lg">Great job!</h1>
      <p class="subtitle">You've completed your stretch. Your body thanks you!</p>
      <p class="text-sm text-muted" style="margin-top: 2rem;">This window will close automatically...</p>
    </div>
  `;
  
  // Close after 3 seconds
  setTimeout(() => {
    window.close();
  }, 3000);
}

function playCompletionSound() {
  // Check if sound is enabled
  chrome.storage.local.get(['userPreferences'], (result) => {
    if (result.userPreferences && result.userPreferences.soundEnabled !== false) {
      // Create and play a simple chime sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLYiTcIG2m98OScTgwOUant1');
      audio.volume = 0.3;
      audio.play();
    }
  });
}