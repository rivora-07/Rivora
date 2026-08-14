/* ============================================================
   challenges.js — Rivora Challenge Data
   
   UPDATED:
   - Each challenge now has starter images kids can use
   - Using free Unsplash images (small, fast loading)
   - Kids can still use their own photo too
   ============================================================ */

var CHALLENGES = [
  {
    id: 'ch_fly',
    emoji: '🦅',
    title: 'Make Someone Fly',
    description: 'Can you make a person, animal, or object take off into the sky?',
    tips: [
      'Try adding clouds behind your subject',
      'Rotating your image might create the feeling of movement',
      'What color is the sky in your version?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=70', label: 'Person standing' },
      { url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=70', label: 'Cat looking up' },
      { url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=70', label: 'Bird in sky' }
    ]
  },
  {
    id: 'ch_moon',
    emoji: '🌙',
    title: 'Put Something on the Moon',
    description: 'What would you place on the moon? A teddy bear? A pizza? Your pet?',
    tips: [
      'Think about what color the moon makes things look',
      'What if your subject is floating or bouncing?',
      'Does your moon have craters?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&q=70', label: 'Full moon' },
      { url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=70', label: 'Moon surface' },
      { url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=600&q=70', label: 'Night sky' }
    ]
  },
  {
    id: 'ch_fish',
    emoji: '🐠',
    title: 'Make a Fish Walk on Land',
    description: 'What if a fish decided to go for a walk? Where would it go?',
    tips: [
      'Try changing brightness to make it feel different',
      'What background would a walking fish need?',
      'Does the fish look surprised or adventurous?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&q=70', label: 'Colorful fish' },
      { url: 'https://images.unsplash.com/photo-1509391111822-f1267ece83de?w=600&q=70', label: 'Park path' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70', label: 'Beach' }
    ]
  },
  {
    id: 'ch_space',
    emoji: '🚀',
    title: 'Turn Your Room into Space',
    description: 'What if your bedroom was floating in the cosmos?',
    tips: [
      'Dark backgrounds feel very spacey',
      'Try adjusting contrast to make things pop',
      'What if there were stars everywhere?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=70', label: 'Galaxy' },
      { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=70', label: 'Nebula' },
      { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=70', label: 'Stars' }
    ]
  },
  {
    id: 'ch_rainbow',
    emoji: '🌈',
    title: 'Give a Tree Rainbow Leaves',
    description: 'Imagine a tree where every leaf is a different color!',
    tips: [
      'Saturation controls color intensity — try turning it way up!',
      'Where does this magical tree grow?',
      'What creatures would live in it?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=70', label: 'Big tree' },
      { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=70', label: 'Sunlit leaves' },
      { url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&q=70', label: 'Forest' }
    ]
  },
  {
    id: 'ch_tiny',
    emoji: '🔬',
    title: 'Make Something Tiny Look Giant',
    description: 'What if an ant were the size of a building?',
    tips: [
      'Cropping can change perspective dramatically',
      'Big things cast big shadows',
      'What is the tiny thing towering over?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=70', label: 'Tiny flower' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=70', label: 'City skyline' },
      { url: 'https://images.unsplash.com/photo-1534322904425-44354eadb8f2?w=600&q=70', label: 'Miniature toys' }
    ]
  },
  {
    id: 'ch_underwater',
    emoji: '🐳',
    title: 'Create an Underwater World',
    description: 'What lives at the bottom of YOUR ocean?',
    tips: [
      'Blue tones make everything feel underwater',
      'Try increasing blur slightly for a dreamy ocean feel',
      'What strange creatures swim around?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=70', label: 'Ocean waves' },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=70', label: 'Underwater reef' },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=70', label: 'Sea turtle' }
    ]
  },
  {
    id: 'ch_superhero',
    emoji: '🦸',
    title: 'Design a Superhero Poster',
    description: 'You are the superhero! What does your poster look like?',
    tips: [
      'High contrast makes things look dramatic',
      'What colors represent YOUR superpower?',
      'Every superhero needs a cool pose!'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=600&q=70', label: 'Action pose' },
      { url: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=600&q=70', label: 'City at night' },
      { url: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&q=70', label: 'Lightning sky' }
    ]
  },
  {
    id: 'ch_dessert',
    emoji: '🍰',
    title: 'Build a Dessert City',
    description: 'What if buildings were made of cake and roads were chocolate?',
    tips: [
      'Warm saturated colors make food look delicious',
      'What would the tallest building look like?',
      'Do the residents eat their houses?'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=70', label: 'Chocolate cake' },
      { url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=70', label: 'Donuts' },
      { url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=70', label: 'Cupcakes' }
    ]
  },
  {
    id: 'ch_pet',
    emoji: '🐕',
    title: 'Give Your Pet a Job',
    description: 'What if your pet had a real job? A cat chef? A dog pilot?',
    tips: [
      'Think about what outfit they would wear',
      'Where is their workplace?',
      'Are they good at their job? 😄'
    ],
    starterImages: [
      { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=70', label: 'Cute dog' },
      { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=70', label: 'Cat looking' },
      { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=70', label: 'Hamster' }
    ]
  }
];

function getTodaysChallenge() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  var index = dayOfYear % CHALLENGES.length;
  return CHALLENGES[index];
}

function getAllChallenges() { return CHALLENGES; }

function getChallengeById(id) {
  for (var i = 0; i < CHALLENGES.length; i++) {
    if (CHALLENGES[i].id === id) return CHALLENGES[i];
  }
  return null;
}

function renderChallengeCard(challenge) {
  var card = document.createElement('article');
  card.className = 'card challenge-card animate-fade-in';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  card.innerHTML =
    '<span class="challenge-emoji" aria-hidden="true">' + challenge.emoji + '</span>' +
    '<h3 class="card-title">' + challenge.title + '</h3>' +
    '<p style="font-size:0.82rem; color:var(--color-text-soft); margin-top:4px; font-weight:500;">' + challenge.description + '</p>' +
    '<a href="./editor.html?challenge=' + challenge.id + '" class="btn btn-primary btn-sm" style="margin-top:10px;">Start →</a>';

  return card;
}