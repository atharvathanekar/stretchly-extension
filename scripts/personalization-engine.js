// Personalization Engine for Stretchly
// Creates customized stretch schedules based on user profile

class PersonalizationEngine {
  constructor(userPreferences) {
    this.preferences = userPreferences;
    this.stretchDatabase = this.getStretchDatabase();
    this.personalizedPlan = null;
  }
  
  // Set personalized plan
  setPlan(plan) {
    this.personalizedPlan = plan;
  }

  // Generate a personalized stretch schedule
  generateSchedule() {
    const schedule = {
      frequency: this.calculateOptimalFrequency(),
      stretches: this.selectPersonalizedStretches(),
      focusAreas: this.determineFocusAreas(),
      intensity: this.determineIntensity(),
      sessionDuration: this.calculateSessionDuration()
    };

    return schedule;
  }

  // Calculate optimal reminder frequency based on user profile
  calculateOptimalFrequency() {
    let baseFrequency = this.preferences.frequency || 60;
    
    // Adjust based on sitting hours
    if (this.preferences.hours === '8_plus') {
      baseFrequency = Math.min(baseFrequency, 45); // More frequent for long sitters
    } else if (this.preferences.hours === 'less_4') {
      baseFrequency = Math.max(baseFrequency, 90); // Less frequent for short sessions
    }

    // Adjust based on pain points
    const painCount = this.preferences.painPoints?.length || 0;
    if (painCount >= 3) {
      baseFrequency = Math.min(baseFrequency, 50); // More frequent for multiple issues
    }

    return baseFrequency;
  }

  // Determine focus areas based on user input
  determineFocusAreas() {
    const focusMap = {
      'neck_shoulders': { area: 'neck', priority: 3 },
      'back': { area: 'back', priority: 3 },
      'wrist_hand': { area: 'wrists', priority: 2 },
      'eyes': { area: 'eyes', priority: 2 },
      'posture': { area: 'posture', priority: 3 }
    };

    const areas = [];
    
    // Map pain points to focus areas
    if (this.preferences.painPoints) {
      this.preferences.painPoints.forEach(point => {
        if (focusMap[point] && point !== 'none') {
          areas.push(focusMap[point]);
        }
      });
    }

    // Add areas based on reasons
    if (this.preferences.reasons) {
      if (this.preferences.reasons.includes('desk_work')) {
        areas.push({ area: 'neck', priority: 2 });
        areas.push({ area: 'back', priority: 2 });
      }
      if (this.preferences.reasons.includes('gaming')) {
        areas.push({ area: 'wrists', priority: 3 });
        areas.push({ area: 'eyes', priority: 3 });
      }
    }

    // Remove duplicates and sort by priority
    const uniqueAreas = Array.from(new Set(areas.map(a => a.area)))
      .map(area => {
        const priorities = areas.filter(a => a.area === area).map(a => a.priority);
        return { area, priority: Math.max(...priorities) };
      })
      .sort((a, b) => b.priority - a.priority);

    return uniqueAreas;
  }

  // Determine intensity based on user profile
  determineIntensity() {
    // Default to medium
    let intensity = 'medium';

    // Adjust based on break type preference
    if (this.preferences.breakType === 'quick') {
      intensity = 'light';
    } else if (this.preferences.breakType === 'long') {
      intensity = 'moderate';
    }

    // Adjust based on environment
    if (this.preferences.environment === 'office') {
      intensity = 'light'; // More discrete for office settings
    }

    return intensity;
  }

  // Calculate session duration
  calculateSessionDuration() {
    const durationMap = {
      'quick': { min: 30, max: 60 },
      'medium': { min: 60, max: 180 },
      'long': { min: 180, max: 600 }
    };

    return durationMap[this.preferences.breakType] || durationMap['medium'];
  }

  // Select personalized stretches based on user profile
  selectPersonalizedStretches() {
    const focusAreas = this.determineFocusAreas();
    const intensity = this.determineIntensity();
    const sessionDuration = this.calculateSessionDuration();
    
    let selectedStretches = [];

    // Priority 1: Target specific pain points
    focusAreas.forEach(({ area, priority }) => {
      const areaStretches = this.stretchDatabase.filter(stretch => 
        stretch.targets.includes(area) &&
        stretch.intensity === intensity &&
        stretch.duration >= sessionDuration.min &&
        stretch.duration <= sessionDuration.max
      );
      
      // Add stretches based on priority
      const count = priority === 3 ? 3 : priority === 2 ? 2 : 1;
      selectedStretches.push(...this.selectRandom(areaStretches, count));
    });

    // Priority 2: Add general wellness stretches
    const generalStretches = this.stretchDatabase.filter(stretch =>
      stretch.targets.includes('general') &&
      stretch.intensity === intensity &&
      stretch.duration >= sessionDuration.min &&
      stretch.duration <= sessionDuration.max
    );
    
    selectedStretches.push(...this.selectRandom(generalStretches, 2));

    // Priority 3: Add breathing exercises if stressed
    if (this.preferences.painPoints?.includes('posture') || 
        this.preferences.reasons?.includes('pain')) {
      const breathingExercises = this.stretchDatabase.filter(stretch =>
        stretch.targets.includes('breathing') &&
        stretch.duration <= sessionDuration.max
      );
      selectedStretches.push(...this.selectRandom(breathingExercises, 1));
    }

    // Remove duplicates
    const uniqueStretches = Array.from(new Set(selectedStretches.map(s => s.id)))
      .map(id => selectedStretches.find(s => s.id === id));

    return uniqueStretches;
  }

  // Helper function to select random items from array
  selectRandom(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Get the complete stretch database
  getStretchDatabase() {
    return [
      // Neck & Shoulder Stretches
      {
        id: 'neck-roll',
        title: 'Gentle Neck Rolls',
        description: 'Release neck tension with slow, controlled movements',
        targets: ['neck'],
        duration: 60,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Sit up straight and relax your shoulders',
          'Slowly roll your head in a circular motion',
          'Complete 5 rolls clockwise, then 5 counter-clockwise',
          'Move slowly and breathe deeply'
        ]
      },
      {
        id: 'shoulder-shrug',
        title: 'Shoulder Shrugs & Rolls',
        description: 'Release shoulder tension and improve circulation',
        targets: ['neck', 'shoulders'],
        duration: 45,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Lift your shoulders up towards your ears',
          'Hold for 5 seconds',
          'Release and roll shoulders backward',
          'Repeat 5-10 times'
        ]
      },
      {
        id: 'neck-stretch-side',
        title: 'Side Neck Stretch',
        description: 'Target the sides of your neck for deeper relief',
        targets: ['neck'],
        duration: 90,
        intensity: 'medium',
        difficulty: 'easy',
        steps: [
          'Tilt your head to the right, bringing ear toward shoulder',
          'Place right hand gently on left side of head',
          'Hold for 30 seconds',
          'Repeat on the other side'
        ]
      },

      // Back & Spine Stretches
      {
        id: 'seated-spinal-twist',
        title: 'Seated Spinal Twist',
        description: 'Improve spine mobility and relieve back tension',
        targets: ['back', 'posture'],
        duration: 90,
        intensity: 'medium',
        difficulty: 'medium',
        steps: [
          'Sit up straight in your chair',
          'Place right hand on left knee',
          'Place left hand behind you on the chair',
          'Twist gently to the left, hold for 30 seconds',
          'Repeat on the other side'
        ]
      },
      {
        id: 'cat-cow-seated',
        title: 'Seated Cat-Cow',
        description: 'Mobilize the spine and improve posture',
        targets: ['back', 'posture'],
        duration: 120,
        intensity: 'light',
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
        id: 'back-extension',
        title: 'Standing Back Extension',
        description: 'Counter the effects of forward hunching',
        targets: ['back', 'posture'],
        duration: 60,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Stand up and place hands on lower back',
          'Gently arch backward, supporting with hands',
          'Hold for 5-10 seconds',
          'Return to neutral, repeat 5 times'
        ]
      },

      // Wrist & Hand Stretches
      {
        id: 'wrist-flexor-stretch',
        title: 'Wrist Flexor Stretch',
        description: 'Prevent carpal tunnel and wrist pain',
        targets: ['wrists'],
        duration: 60,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Extend your arm in front, palm up',
          'With other hand, gently pull fingers back',
          'Feel stretch in forearm',
          'Hold 15-30 seconds each hand'
        ]
      },
      {
        id: 'wrist-circles',
        title: 'Wrist Circles',
        description: 'Improve wrist mobility and circulation',
        targets: ['wrists'],
        duration: 45,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Extend arms in front',
          'Make fists and rotate wrists in circles',
          '10 circles clockwise',
          '10 circles counter-clockwise'
        ]
      },
      {
        id: 'finger-stretches',
        title: 'Finger & Hand Stretches',
        description: 'Relief for typing fatigue',
        targets: ['wrists', 'hands'],
        duration: 90,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Make a fist, then spread fingers wide',
          'Hold for 5 seconds, repeat 5 times',
          'Touch thumb to each fingertip',
          'Shake hands gently to finish'
        ]
      },

      // Eye Exercises
      {
        id: 'eye-palming',
        title: 'Eye Palming',
        description: 'Relieve eye strain and fatigue',
        targets: ['eyes'],
        duration: 90,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Rub palms together to warm them',
          'Close eyes and cup palms over them',
          'Ensure no light enters',
          'Relax for 30-60 seconds'
        ]
      },
      {
        id: '20-20-20',
        title: '20-20-20 Rule',
        description: 'Give your eyes a break from the screen',
        targets: ['eyes'],
        duration: 30,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Look away from your screen',
          'Focus on something 20 feet away',
          'Hold your gaze for 20 seconds',
          'Blink several times before returning to work'
        ]
      },
      {
        id: 'eye-movements',
        title: 'Eye Movement Exercises',
        description: 'Strengthen eye muscles and reduce strain',
        targets: ['eyes'],
        duration: 120,
        intensity: 'light',
        difficulty: 'medium',
        steps: [
          'Without moving your head, look up and down 10 times',
          'Look left and right 10 times',
          'Make large circles with your eyes, 5 each direction',
          'Focus near and far alternately 10 times'
        ]
      },

      // General Movement & Circulation
      {
        id: 'desk-pushups',
        title: 'Desk Push-ups',
        description: 'Strengthen arms and boost energy',
        targets: ['general', 'posture'],
        duration: 120,
        intensity: 'medium',
        difficulty: 'medium',
        steps: [
          'Stand arm\'s length from desk',
          'Place hands on desk edge, shoulder-width',
          'Step back and lean forward',
          'Do 10-15 push-ups against desk'
        ]
      },
      {
        id: 'ankle-pumps',
        title: 'Ankle Pumps & Circles',
        description: 'Improve lower leg circulation',
        targets: ['general', 'circulation'],
        duration: 60,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Sit with feet flat on floor',
          'Lift toes, keeping heels down',
          'Then lift heels, keeping toes down',
          'Repeat 15 times, then do ankle circles'
        ]
      },
      {
        id: 'marching-place',
        title: 'Seated Marching',
        description: 'Get blood flowing without leaving your chair',
        targets: ['general', 'circulation'],
        duration: 60,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Sit up straight in your chair',
          'Lift right knee up, then lower',
          'Lift left knee up, then lower',
          'Continue marching for 30-60 seconds'
        ]
      },

      // Breathing Exercises
      {
        id: 'deep-breathing',
        title: 'Deep Breathing Exercise',
        description: 'Reduce stress and increase oxygen',
        targets: ['breathing', 'general'],
        duration: 120,
        intensity: 'light',
        difficulty: 'easy',
        steps: [
          'Sit comfortably with straight spine',
          'Inhale slowly through nose for 4 counts',
          'Hold breath for 4 counts',
          'Exhale through mouth for 6 counts',
          'Repeat 5-10 times'
        ]
      },
      {
        id: 'box-breathing',
        title: 'Box Breathing',
        description: 'Calm your mind and reduce tension',
        targets: ['breathing', 'stress'],
        duration: 180,
        intensity: 'light',
        difficulty: 'medium',
        steps: [
          'Inhale for 4 counts',
          'Hold for 4 counts',
          'Exhale for 4 counts',
          'Hold empty for 4 counts',
          'Repeat 4-8 cycles'
        ]
      }
    ];
  }

  // Get next stretch based on schedule
  getNextStretch(lastStretchId = null) {
    // Use personalized plan if available
    const schedule = this.personalizedPlan || this.generateSchedule();
    const stretches = this.personalizedPlan ? 
      this.getStretchesForPlan() : 
      schedule.stretches;
    
    const availableStretches = stretches.filter(s => s.id !== lastStretchId);
    
    if (availableStretches.length === 0) {
      // If all stretches have been used, regenerate
      return stretches[0];
    }
    
    // Prioritize stretches for high-priority areas
    const focusAreas = this.personalizedPlan?.focusAreas || this.determineFocusAreas();
    const highPriorityArea = focusAreas[0]?.area || focusAreas[0]?.name;
    
    const prioritizedStretches = availableStretches.filter(s => 
      s.targets.some(target => 
        highPriorityArea && highPriorityArea.toLowerCase().includes(target.toLowerCase())
      )
    );
    
    if (prioritizedStretches.length > 0) {
      return prioritizedStretches[Math.floor(Math.random() * prioritizedStretches.length)];
    }
    
    return availableStretches[Math.floor(Math.random() * availableStretches.length)];
  }
  
  // Get stretches based on personalized plan categories
  getStretchesForPlan() {
    if (!this.personalizedPlan || !this.personalizedPlan.stretchCategories) {
      return this.stretchDatabase;
    }
    
    const relevantStretches = [];
    const categories = this.personalizedPlan.stretchCategories;
    const intensity = this.personalizedPlan.intensity || 'medium';
    
    // Map categories to stretch targets
    const categoryMap = {
      'neck_stretches': ['neck'],
      'shoulder_mobility': ['neck', 'shoulders'],
      'spinal_mobility': ['back', 'posture'],
      'back_strengthening': ['back'],
      'wrist_stretches': ['wrists'],
      'finger_exercises': ['wrists', 'hands'],
      'eye_exercises': ['eyes'],
      'focus_breaks': ['eyes'],
      'posture_correction': ['posture', 'back'],
      'core_activation': ['posture', 'general'],
      'circulation_boosters': ['general', 'circulation'],
      'breathing_exercises': ['breathing', 'stress']
    };
    
    categories.forEach(category => {
      const targets = categoryMap[category] || [];
      const categoryStretches = this.stretchDatabase.filter(stretch => 
        stretch.targets.some(target => targets.includes(target)) &&
        (stretch.intensity === intensity || stretch.intensity === 'light')
      );
      relevantStretches.push(...categoryStretches);
    });
    
    // Remove duplicates
    const uniqueStretches = Array.from(new Set(relevantStretches.map(s => s.id)))
      .map(id => relevantStretches.find(s => s.id === id));
    
    return uniqueStretches.length > 0 ? uniqueStretches : this.stretchDatabase;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PersonalizationEngine;
}