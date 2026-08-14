/* ============================================================
   pixel.js — Pixel Mascot Controller
   
   VERSION 2 CHANGES:
   - Different float animation speeds per page context
   - setPixelMessage now uses smooth fade transition
   - Added pixel.js live region for screen readers
   ============================================================ */

/* ---------- Messages by context ---------- */
const PIXEL_MESSAGES = {
  landing: [
    "Hey! I'm Pixel. Ready to make something cool? 🌊",
    "Welcome to Rivora! This is YOUR creative island. 🏝",
    "Hi there! I've been waiting to explore with you. Let's go!"
  ],
  island: [
    "Where do you want to go today?",
    "The whole island is yours to explore!",
    "I wonder what you'll make today... 🤔"
  ],
  learn: [
    "Every great creator starts by learning the basics. Let's try one!",
    "Pick a lesson that sounds interesting. There's no wrong choice!",
    "Learning is just exploring with a goal. Ready?"
  ],
  challenges: [
    "Here's today's mission. Remember — there's no wrong answer!",
    "Your imagination is the only tool you need here. 🚀",
    "What would YOU do with this? Let's find out!"
  ],
  editor: [
    "Take your time. Try things. You can always undo!",
    "Experiment! The best discoveries happen by accident.",
    "This is YOUR creation. There's no right or wrong way. 🎨"
  ],
  completion: [
    "I like your version. 🌟",
    "You made that. And it's uniquely yours.",
    "That's really something. You should feel proud!"
  ],
  creations: [
    "Look at everything you've made!",
    "Every creation here is proof that you're a creator.",
    "Your island of creations! Each one tells a story."
  ]
};

/*
   Float animation durations per context.
   Slightly different speeds make Pixel feel alive, not robotic.
   
   Unit: seconds for one full float cycle
*/
const PIXEL_FLOAT_SPEEDS = {
  landing:    3.0,   /* slow, welcoming */
  island:     3.5,   /* calm, exploring */
  learn:      4.0,   /* thoughtful */
  challenges: 2.8,   /* slightly more energetic — exciting mission! */
  editor:     4.5,   /* very calm — don't distract during creation */
  completion: 2.5,   /* happy, bouncy */
  creations:  3.8
};

/* ============================================================
   initPixel
   
   Call this on page load.
   Sets Pixel's message and float animation speed.
   
   @param {string} context       - One of the keys in PIXEL_MESSAGES
   @param {string} customMessage - Optional override
   ============================================================ */
function initPixel(context, customMessage = null) {
  const bubbleText = document.getElementById('pixel-bubble-text');
  const avatar     = document.querySelector('.pixel-avatar');

  /* Set the float speed based on context */
  if (avatar) {
    const speed = PIXEL_FLOAT_SPEEDS[context] || 3.5;
    /*
       We override the animation-duration inline.
       The animation name 'float' is still defined in animations.css.
       Only the duration changes.
    */
    avatar.style.animationDuration = `${speed}s`;
  }

  if (!bubbleText) return;

  const message = customMessage || getRandomMessage(context);
  typewriterEffect(bubbleText, message, 28);

  /*
     Make the bubble a live region so screen readers
     announce Pixel's message when it changes.
  */
  const bubble = document.querySelector('.pixel-bubble');
  if (bubble) {
    bubble.setAttribute('aria-live', 'polite');
    bubble.setAttribute('aria-atomic', 'true');
  }
}

/* ============================================================
   setPixelMessage
   
   Updates Pixel's speech bubble with a smooth fade.
   
   @param {string} message
   ============================================================ */
function setPixelMessage(message) {
  const bubbleText = document.getElementById('pixel-bubble-text');
  if (!bubbleText) return;

  /* Fade out */
  bubbleText.style.transition = 'opacity 200ms ease';
  bubbleText.style.opacity    = '0';

  setTimeout(() => {
    bubbleText.textContent  = message;
    bubbleText.style.opacity = '1';
  }, 200);
}

/* ============================================================
   getRandomMessage
   
   @param {string} context
   @returns {string}
   ============================================================ */
function getRandomMessage(context) {
  const pool  = PIXEL_MESSAGES[context] || PIXEL_MESSAGES.island;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/* ============================================================
   typewriterEffect
   
   Types text one character at a time.
   Gives Pixel's speech a human, thoughtful quality.
   
   @param {HTMLElement} element
   @param {string}      text
   @param {number}      speed    - ms per character
   ============================================================ */
function typewriterEffect(element, text, speed = 28) {
  element.textContent = '';
  element.setAttribute('aria-label', text); /* screen readers get full text immediately */

  let index = 0;
  let timer = null;

  function typeNext() {
    if (index < text.length) {
      element.textContent += text[index];
      index++;
      timer = setTimeout(typeNext, speed);
    }
  }

  typeNext();

  /* Safety cleanup: stop typing if element is removed */
  return function cancel() {
    clearTimeout(timer);
  };
}