/* ============================================================
   storage.js — Local Storage Helpers
   
   VERSION 2 CHANGES:
   - Added in-memory cache so we don't hit localStorage repeatedly
   - Added proper error handling for private browsing mode
   - Added isStorageAvailable() check used before any operation
   - Cache is invalidated when data changes (save/delete)
   
   HOW THE CACHE WORKS (beginner explanation):
   
   Imagine localStorage is a filing cabinet. Every time you
   want a file, you walk to the cabinet and open it.
   
   A cache is like keeping a photocopy on your desk.
   The second time you need it, you just look at your desk.
   Much faster!
   
   We throw away the photocopy (invalidate cache) when
   something changes, so we always have fresh data.
   ============================================================ */

/* ---------- In-Memory Cache ---------- */
/*
   null means "cache is empty, go read from localStorage"
   An array means "we already have the data, use this"
*/
let _cache = null;

/* ---------- Storage Key ---------- */
const STORAGE_KEY = 'rivora_creations';

/* ---------- Maximum creations to store ---------- */
const MAX_CREATIONS = 50;

/* ============================================================
   isStorageAvailable
   
   Checks if localStorage is accessible.
   
   WHY THIS IS NEEDED:
   In private/incognito browsing mode, some browsers
   throw a SecurityError when you try to use localStorage.
   Without this check, Rivora would crash silently.
   
   @returns {boolean} true if localStorage works, false if not
   ============================================================ */
function isStorageAvailable() {
  try {
    /* Try writing a test value */
    const testKey = '__rivora_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/* ============================================================
   getAllCreations
   
   Returns all saved creations as an array.
   Uses in-memory cache when available.
   
   @returns {Array} array of creation objects (may be empty)
   ============================================================ */
function getAllCreations() {
  /* Return cache if it exists — avoids hitting localStorage */
  if (_cache !== null) {
    return _cache;
  }

  /* Check if storage is available (private browsing check) */
  if (!isStorageAvailable()) {
    showStorageWarning();
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    /* Nothing saved yet */
    if (!raw) {
      _cache = [];
      return _cache;
    }

    /* Parse JSON string → JavaScript array */
    _cache = JSON.parse(raw);
    return _cache;

  } catch (error) {
    /*
       JSON.parse can fail if the data got corrupted somehow.
       We log the error for debugging but don't crash the app.
    */
    console.warn('Rivora: Could not read creations from storage.', error);
    _cache = [];
    return _cache;
  }
}

/* ============================================================
   saveCreation
   
   Saves a new creation and invalidates the cache.
   
   @param {string} name        - Name the child gives their creation
   @param {string} imageData   - Base64 data URL of the image
   @param {string} challengeId - Which challenge this was for (optional)
   
   @returns {object|null} - The saved creation, or null if save failed
   ============================================================ */
function saveCreation(name, imageData, challengeId = '') {
  if (!isStorageAvailable()) {
    showStorageWarning();
    return null;
  }

  /* Get fresh list (uses cache if available) */
  const creations = getAllCreations();

  /* Build the new creation object */
  const creation = {
    id:          generateId(),
    name:        sanitizeName(name),   /* clean the input */
    imageData:   imageData,
    challengeId: challengeId,
    createdAt:   new Date().toISOString()
  };

  /* Add to the front (newest first) */
  creations.unshift(creation);

  /* Trim to max limit */
  const trimmed = creations.slice(0, MAX_CREATIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    /* Invalidate cache so next read is fresh */
    _cache = trimmed;

    return creation;

  } catch (error) {
    /*
       localStorage has a limit (usually ~5MB).
       If we hit it, tell the user kindly.
    */
    if (error.name === 'QuotaExceededError') {
      showToast('Your gallery is full! Delete some old creations to save new ones. 🗑');
    } else {
      console.warn('Rivora: Could not save creation.', error);
      showToast('Oops! Could not save. Try again?');
    }
    return null;
  }
}

/* ============================================================
   deleteCreation
   
   Removes a creation by ID and invalidates cache.
   
   @param {string} id
   ============================================================ */
function deleteCreation(id) {
  if (!isStorageAvailable()) return;

  const creations = getAllCreations();
  const filtered  = creations.filter(c => c.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  /* Update cache instead of clearing it entirely */
  _cache = filtered;
}

/* ============================================================
   getCreationById
   
   @param {string} id
   @returns {object|null}
   ============================================================ */
function getCreationById(id) {
  return getAllCreations().find(c => c.id === id) || null;
}

/* ============================================================
   generateId
   
   Creates a unique ID using timestamp + random characters.
   Example output: "lqvk2a8f3"
   
   @returns {string}
   ============================================================ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ============================================================
   sanitizeName
   
   Cleans a creation name to prevent XSS.
   Strips HTML tags and limits length.
   
   WHY: A child could theoretically type <script>... in the
   name field. This removes any HTML so it's stored as plain text.
   
   @param {string} name
   @returns {string}
   ============================================================ */
function sanitizeName(name) {
  /* Create a temporary element — the browser will parse the HTML */
  const temp = document.createElement('div');
  temp.textContent = name || 'My Creation'; /* textContent never renders HTML */
  const clean = temp.textContent.trim();

  /* Limit to 60 characters */
  return clean.slice(0, 60) || 'My Creation';
}

/* ============================================================
   showStorageWarning
   
   Shown when localStorage is unavailable (private browsing).
   ============================================================ */
function showStorageWarning() {
  showToast(
    'You\'re in private mode — creations won\'t be saved. ' +
    'Switch to a regular browser window to keep your work! 🔒'
  );
}

/* ============================================================
   showToast
   
   Brief notification at the bottom of the screen.
   
   @param {string} message
   @param {number} duration - How long to show it (ms)
   ============================================================ */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');       /* screen readers read this */
    toast.setAttribute('aria-live', 'polite');  /* non-interrupting announcement */
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  /* Clear any existing timer */
  if (toast._timer) clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}