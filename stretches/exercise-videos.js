// Exercise video URLs and configurations
const exerciseVideos = {
  'neck-roll': {
    type: 'gif',
    url: '../images/neck-roll.gif',
    fallbackUrl: 'https://media.giphy.com/media/3o7btPOMufN5FziFWg/giphy.gif',
    description: 'Gentle neck roll demonstration'
  },
  'shoulder-shrug': {
    type: 'gif',
    url: 'https://media.giphy.com/media/l0HlMG1EX2H38cZeE/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/3oEjI7d0bQpHeGJecE/giphy.gif',
    description: 'Shoulder shrug and roll'
  },
  'wrist-stretch': {
    type: 'gif',
    url: 'https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif',
    description: 'Wrist flexor stretch'
  },
  'seated-spinal-twist': {
    type: 'gif',
    url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/3oEjI0NwoR0v7GqA5a/giphy.gif',
    description: 'Seated spinal twist'
  },
  'eye-palming': {
    type: 'gif',
    url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    description: 'Eye palming technique'
  },
  'cat-cow': {
    type: 'gif',
    url: 'https://media.giphy.com/media/3o7TKNthed4OG7T5gA/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/xT5LMQouRJWgMeMrNm/giphy.gif',
    description: 'Cat-cow stretch for spine mobility'
  },
  'desk-pushups': {
    type: 'gif',
    url: 'https://media.giphy.com/media/l0HlMWkHJKvyjftKM/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.gif',
    description: 'Desk push-ups for upper body strength'
  },
  'ankle-circles': {
    type: 'gif',
    url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif',
    fallbackUrl: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
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