/* ============================================================
   learn.js — Micro-Lesson Data and Logic
   
   Each lesson:
   - Teaches ONE concept
   - Takes under 60 seconds
   - Is interactive where possible
   - Has a clear, child-friendly explanation
   ============================================================ */

/* ---------- Lesson Data ---------- */
const LESSONS = [
  {
    id: 'lesson_brightness',
    emoji: '☀️',
    title: 'Brightness',
    tagline: 'Make it shine or go dark',
    duration: '45 seconds',
    content: `
      <p>Brightness controls how <strong>light</strong> or <strong>dark</strong> your whole image is.</p>
      <p style="margin-top:12px">Turn it up → everything gets brighter, like stepping into sunlight.</p>
      <p>Turn it down → everything gets darker, like entering a cave.</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting brightness:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: (val) => `brightness(${1 + val / 100})`,
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_contrast',
    emoji: '⚫',
    title: 'Contrast',
    tagline: 'Make colors pop or blend',
    duration: '45 seconds',
    content: `
      <p>Contrast is the <strong>difference</strong> between the lightest and darkest parts of an image.</p>
      <p style="margin-top:12px">High contrast → sharp, dramatic look. Like a graphic novel.</p>
      <p>Low contrast → soft, dreamy look. Like a foggy morning.</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting contrast:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: (val) => `contrast(${1 + val / 100})`,
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_saturation',
    emoji: '🎨',
    title: 'Saturation',
    tagline: 'Make colors vivid or grey',
    duration: '40 seconds',
    content: `
      <p>Saturation controls how <strong>colorful</strong> your image looks.</p>
      <p style="margin-top:12px">Turn it up → colors become super vivid and intense!</p>
      <p>Turn it down → colors fade to grey. All the way down = black and white.</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting saturation:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: (val) => `saturate(${Math.max(0, 1 + val / 100)})`,
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_blur',
    emoji: '💧',
    title: 'Blur',
    tagline: 'Soften and dream',
    duration: '40 seconds',
    content: `
      <p>Blur softens your image, like looking through frosted glass or a rainy window.</p>
      <p style="margin-top:12px">A little blur can make backgrounds look soft and dreamy.</p>
      <p>Photographers use blur to make the subject "pop" by making everything else soft.</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adding blur:',
    sliderMin: 0,
    sliderMax: 20,
    sliderDefault: 0,
    cssFilter: (val) => `blur(${val}px)`,
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_crop',
    emoji: '✂️',
    title: 'Cropping',
    tagline: 'Choose what to include',
    duration: '50 seconds',
    content: `
      <p>Cropping means cutting away parts of your image to focus on what matters most.</p>
      <p style="margin-top:12px">A great crop can completely change how an image feels.</p>
      <p>Try cropping very close to a face — suddenly it feels intense and personal.</p>
      <p>Crop to show just a tiny detail — and it becomes a mystery.</p>
    `,
    interactiveType: 'info',
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_rotate',
    emoji: '🔄',
    title: 'Rotation',
    tagline: 'Change the angle, change the story',
    duration: '35 seconds',
    content: `
      <p>Rotating tilts your image at an angle.</p>
      <p style="margin-top:12px">A slight tilt can make something feel <strong>dynamic</strong> and exciting.</p>
      <p>Rotate 180° and the whole world flips upside down!</p>
      <p>What story does a tilted image tell?</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try rotating:',
    sliderMin: -180,
    sliderMax: 180,
    sliderDefault: 0,
    cssFilter: null, // handled differently — it's a transform, not a filter
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  }
];

/**
 * getAllLessons
 */
function getAllLessons() {
  return LESSONS;
}

/**
 * getLessonById
 */
function getLessonById(id) {
  return LESSONS.find(l => l.id === id) || null;
}

/**
 * renderLessonCard
 * 
 * Creates an HTML card for a lesson in the lesson list.
 * 
 * @param {object} lesson
 * @returns {HTMLElement}
 */
function renderLessonCard(lesson) {
  const card = document.createElement('article');
  card.className = 'card lesson-card';

  card.innerHTML = `
    <span class="lesson-emoji" aria-hidden="true">${lesson.emoji}</span>
    <div class="lesson-info">
      <h3 class="card-title">${lesson.title}</h3>
      <p class="lesson-tagline">${lesson.tagline}</p>
      <span class="badge">⏱ ${lesson.duration}</span>
    </div>
    <a href="learn.html?lesson=${lesson.id}"
       class="btn btn-secondary btn-sm"
       aria-label="Start lesson: ${lesson.title}">
      Try it →
    </a>
  `;

  return card;
}