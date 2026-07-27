/* ============================================================
   pixel.js — Pixel Mascot Utilities
   
   This file provides:
   1. RivoraPixel.showToast(message, duration)
      → Shows a brief notification at the bottom of the screen
   
   2. RivoraPixel.say(message)
      → Updates the pixel-bubble text on the current page
   
   These are simple utility functions that any page can call.
============================================================ */

const RivoraPixel = (function() {

  /* ============================================================
     SHOW TOAST
     
     A "toast" is a non-intrusive notification that appears
     briefly and then disappears. Like a notification.
     
     Usage: RivoraPixel.showToast('Saved! 💾', 2000);
  ============================================================ */
  function showToast(message, duration) {
    duration = duration || 2500;  // Default 2.5 seconds
    
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('visible');
    
    // Clear any existing timer (in case showToast is called rapidly)
    if (toast._timer) clearTimeout(toast._timer);
    
    toast._timer = setTimeout(function() {
      toast.classList.remove('visible');
    }, duration);
  }

  /* ============================================================
     SAY
     
     Updates the first pixel-bubble's text on the page.
     Usage: RivoraPixel.say("Great job making that!");
  ============================================================ */
  function say(message) {
    const bubble = document.querySelector('.pixel-bubble p');
    if (bubble) {
      bubble.textContent = message;
    }
  }

  /* ============================================================
     PUBLIC API
  ============================================================ */
  return {
    showToast: showToast,
    say:       say,
  };

})();