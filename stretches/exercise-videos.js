// Exercise video URLs and configurations
const exerciseVideos = {
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

// Function to get video element for an exercise
function getExerciseVideo(exerciseId) {
  const video = exerciseVideos[exerciseId];
  
  if (!video) {
    // Return placeholder if no video available
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
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exerciseVideos, getExerciseVideo };
}