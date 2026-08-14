/* ============================================================
   learn.js — Rivora Lesson Data
   
   FIXED: Each lesson now has a DIFFERENT demo image
   Using free Unsplash images (small size for fast loading)
   ============================================================ */

const LESSONS = [
  {
    id: 'lesson_brightness',
    emoji: '☀️',
    title: 'Brightness',
    tagline: 'Make it shine or go dark',
    duration: '45 seconds',
    content: `
      <p><strong>Brightness</strong> controls how light or dark your whole image is.</p>
      <p style="margin-top:10px">Turn it up → everything gets brighter, like stepping into sunlight. ☀️</p>
      <p>Turn it down → everything gets darker, like entering a cave. 🕯</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting brightness:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: function(val) { return 'brightness(' + (1 + val / 100) + ')'; },
    demoImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60'
  },
  {
    id: 'lesson_contrast',
    emoji: '⚫',
    title: 'Contrast',
    tagline: 'Make colors pop or blend',
    duration: '45 seconds',
    content: `
      <p><strong>Contrast</strong> is the difference between the lightest and darkest parts of an image.</p>
      <p style="margin-top:10px">High contrast → sharp, dramatic look. Like a graphic novel. 📖</p>
      <p>Low contrast → soft, dreamy look. Like a foggy morning. 🌫</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting contrast:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: function(val) { return 'contrast(' + (1 + val / 100) + ')'; },
    demoImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=60'
  },
  {
    id: 'lesson_saturation',
    emoji: '🎨',
    title: 'Saturation',
    tagline: 'Make colors vivid or grey',
    duration: '40 seconds',
    content: `
      <p><strong>Saturation</strong> controls how colorful your image looks.</p>
      <p style="margin-top:10px">Turn it up → colors become super vivid and intense! 🌈</p>
      <p>Turn it all the way down → black and white photo. 🖤</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adjusting saturation:',
    sliderMin: -100,
    sliderMax: 100,
    sliderDefault: 0,
    cssFilter: function(val) { return 'saturate(' + Math.max(0, 1 + val / 100) + ')'; },
    demoImage: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=60'
  },
  {
    id: 'lesson_blur',
    emoji: '💧',
    title: 'Blur',
    tagline: 'Soften and dream',
    duration: '40 seconds',
    content: `
      <p><strong>Blur</strong> softens your image, like looking through frosted glass. 🪟</p>
      <p style="margin-top:10px">A little blur makes backgrounds look soft and dreamy.</p>
      <p>Photographers use blur to make the subject "pop" by making everything else soft.</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try adding blur:',
    sliderMin: 0,
    sliderMax: 20,
    sliderDefault: 0,
    cssFilter: function(val) { return 'blur(' + val + 'px)'; },
    demoImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=60'
  },
  {
    id: 'lesson_crop',
    emoji: '✂️',
    title: 'Cropping',
    tagline: 'Choose what to include',
    duration: '50 seconds',
    content: `
      <p><strong>Cropping</strong> means cutting away parts of your image to focus on what matters most. ✂️</p>
      <p style="margin-top:10px">A great crop completely changes how an image feels.</p>
      <p>Crop close to a face → intense and personal.</p>
      <p>Crop to show just a tiny detail → it becomes a mystery. 🔍</p>
    `,
    interactiveType: 'info',
    demoImage: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&q=60'
  },
  {
    id: 'lesson_rotate',
    emoji: '🔄',
    title: 'Rotation',
    tagline: 'Change the angle, change the story',
    duration: '35 seconds',
    content: `
      <p><strong>Rotating</strong> tilts your image at an angle. 🔄</p>
      <p style="margin-top:10px">A slight tilt makes something feel dynamic and exciting!</p>
      <p>Rotate 180° and the whole world flips upside down! 🙃</p>
      <p>What story does a tilted image tell?</p>
    `,
    interactiveType: 'slider',
    interactiveLabel: 'Try rotating:',
    sliderMin: -180,
    sliderMax: 180,
    sliderDefault: 0,
    cssFilter: null,
    demoImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60'
  }
];

function getAllLessons() { return LESSONS; }

function getLessonById(id) { return LESSONS.find(function(l) { return l.id === id; }) || null; }

function renderLessonCard(lesson) {
  var card = document.createElement('article');
  card.className = 'card lesson-card';
  card.setAttribute('role', 'listitem');

  card.innerHTML = '<span class="lesson-emoji" aria-hidden="true">' + lesson.emoji + '</span>' +
    '<div class="lesson-info">' +
    '<h3 class="card-title">' + lesson.title + '</h3>' +
    '<p class="lesson-tagline">' + lesson.tagline + '</p>' +
    '<span class="badge">⏱ ' + lesson.duration + '</span>' +
    '</div>' +
    '<a href="./learn.html?lesson=' + lesson.id + '" class="btn btn-secondary btn-sm" aria-label="Start lesson: ' + lesson.title + '">Try it →</a>';

  return card;
}