/* ============================================================
   challenges.js — Creative Challenge Data and Logic
   
   Challenges are the heart of Rivora.
   Each challenge is a creative prompt — not a test.
   
   A good challenge:
   - Has no single correct answer
   - Sparks imagination
   - Is possible to interpret in many ways
   - Is exciting to a child
   ============================================================ */

/* ---------- Challenge Data ---------- */
const CHALLENGES = [
  {
    id: 'ch_fly',
    emoji: '🦅',
    title: 'Make Someone Fly',
    description: 'Can you make a person, animal, or even an object take off into the sky? How you do it is completely up to you!',
    tips: [
      'Try adding clouds behind your subject',
      'Rotating your image might help create the feeling of movement',
      'What color is the sky in your version?'
    ],
    difficulty: 'easy'
  },
  {
    id: 'ch_moon',
    emoji: '🌙',
    title: 'Put Something on the Moon',
    description: 'What would you place on the moon? A teddy bear? A pizza? Your pet? Get creative!',
    tips: [
      'Think about what color the moon makes things look',
      'What if your subject is floating or bouncing?',
      'Does your moon have craters?'
    ],
    difficulty: 'easy'
  },
  {
    id: 'ch_underwater',
    emoji: '🐠',
    title: 'Make a Fish Walk on Land',
    description: 'What if a fish decided to go for a walk? Where would it go? What would it see?',
    tips: [
      'Try changing the brightness to make it feel different',
      'What kind of background would a walking fish need?',
      'Does the fish look surprised, happy, or adventurous?'
    ],
    difficulty: 'easy'
  },
  {
    id: 'ch_space',
    emoji: '🚀',
    title: 'Turn Your Room into Space',
    description: 'What if your bedroom was floating in the cosmos? Make something feel out of this world!',
    tips: [
      'Dark backgrounds can feel very spacey',
      'Try adjusting contrast to make things pop',
      'What if there were stars everywhere?'
    ],
    difficulty: 'medium'
  },
  {
    id: 'ch_rainbow',
    emoji: '🌈',
    title: 'Give a Tree Rainbow Leaves',
    description: 'Imagine a tree where every leaf is a different color. What would that tree look like?',
    tips: [
      'Saturation controls color intensity — try turning it way up!',
      'Where does this magical tree grow?',
      'What kind of creatures would live in it?'
    ],
    difficulty: 'easy'
  },
  {
    id: 'ch_tiny',
    emoji: '🔬',
    title: 'Make Something Tiny Look Giant',
    description: 'What if an ant were the size of a building? Or a coin became as big as the sun? Play with scale!',
    tips: [
      'Cropping can change perspective dramatically',
      'Think about shadows — big things cast big shadows',
      'What is the tiny thing towering over?'
    ],
    difficulty: 'medium'
  }
];

/* ---------- Get Today's Challenge ---------- */
/*
   We rotate challenges by day so children get a different
   one each day without us needing a server.
   
   This is a clever trick: we use the day of the year to
   pick a challenge from our array.
*/
function getTodaysChallenge() {
  const now = new Date();
  // Day of year (0–365)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Cycle through challenges
  const index = dayOfYear % CHALLENGES.length;
  return CHALLENGES[index];
}

/**
 * getAllChallenges
 * Returns the full list of challenges.
 */
function getAllChallenges() {
  return CHALLENGES;
}

/**
 * getChallengeById
 * Finds a challenge by its ID.
 * 
 * @param {string} id
 * @returns {object|null}
 */
function getChallengeById(id) {
  return CHALLENGES.find(c => c.id === id) || null;
}

/**
 * renderChallengeCard
 * 
 * Creates an HTML card element for a challenge.
 * This way, we don't have to write the same HTML structure
 * over and over in different places.
 * 
 * @param {object} challenge
 * @param {boolean} isFeatured - Show it larger as "Today's Challenge"
 * @returns {HTMLElement}
 */
function renderChallengeCard(challenge, isFeatured = false) {
  const card = document.createElement('article');
  card.className = `card challenge-card ${isFeatured ? 'challenge-card--featured' : ''}`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Challenge: ${challenge.title}`);

  card.innerHTML = `
    <span class="challenge-emoji" aria-hidden="true">${challenge.emoji}</span>
    <h3 class="card-title">${challenge.title}</h3>
    <p class="challenge-desc">${challenge.description}</p>
    <a href="editor.html?challenge=${challenge.id}"
       class="btn btn-primary"
       style="margin-top: 16px;">
      Start this challenge →
    </a>
  `;

  return card;
}