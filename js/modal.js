/* ============================================================
   modal.js — Reusable Modal Component
   
   WHAT IS A MODAL?
   A modal is a popup that appears on top of the page.
   The page behind it goes dark and becomes unclickable.
   
   VERSION 2 NEW FEATURES:
   - Focus trap (keyboard accessibility)
   - Escape key to close
   - Proper ARIA attributes
   - Works on any page that includes this script
   
   HOW TO USE:
   
   1. Include this script in your HTML page
   2. Call createModal() once to set up the modal HTML
   3. Call openRivoraModal(config) with your content
   4. Call closeRivoraModal() to close it
   ============================================================ */

/* ---------- State ---------- */
let _modalElement = null;
let _previouslyFocusedElement = null; /* remember where focus was before modal opened */

/* ============================================================
   createModal
   
   Creates the modal HTML and appends it to the page.
   Call this once when the page loads.
   ============================================================ */
function createModal() {
  /* Don't create a second modal if one already exists */
  if (document.getElementById('rivora-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'rivora-modal';
  modal.className = 'rivora-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'rivora-modal-title');
  modal.setAttribute('aria-describedby', 'rivora-modal-desc');
  modal.style.display = 'none';

  modal.innerHTML = `
    <!-- Backdrop: dark overlay behind modal -->
    <div class="rivora-modal__backdrop" id="rivora-modal-backdrop"></div>

    <!-- Modal panel: the visible popup box -->
    <div class="rivora-modal__panel" id="rivora-modal-panel">

      <!-- Close button — always visible in top-right corner -->
      <button
        class="btn btn-icon rivora-modal__close"
        id="rivora-modal-close"
        aria-label="Close this popup"
      >
        ✕
      </button>

      <!-- Content area — filled dynamically by openRivoraModal() -->
      <div id="rivora-modal-content" class="rivora-modal__content">
        <!-- Content injected here -->
      </div>

    </div>
  `;

  document.body.appendChild(modal);
  _modalElement = modal;

  /* Wire up close triggers */
  document.getElementById('rivora-modal-close')
    .addEventListener('click', closeRivoraModal);

  document.getElementById('rivora-modal-backdrop')
    .addEventListener('click', closeRivoraModal);

  /* Escape key closes modal */
  document.addEventListener('keydown', handleModalKeydown);
}

/* ============================================================
   openRivoraModal
   
   Opens the modal with dynamic content.
   
   @param {object} config
   @param {string} config.title       - Modal heading
   @param {string} config.contentHTML - HTML string for modal body
   @param {Function} config.onClose   - Optional callback when modal closes
   ============================================================ */
function openRivoraModal(config) {
  if (!_modalElement) createModal();

  const contentEl = document.getElementById('rivora-modal-content');

  /* Inject content */
  contentEl.innerHTML = `
    <h2 id="rivora-modal-title" class="rivora-modal__title">${config.title || ''}</h2>
    <div id="rivora-modal-desc">${config.contentHTML || ''}</div>
  `;

  /* Store callback */
  _modalElement._onClose = config.onClose || null;

  /* Remember which element was focused before opening */
  _previouslyFocusedElement = document.activeElement;

  /* Show modal */
  _modalElement.style.display = 'flex';
  document.body.style.overflow = 'hidden'; /* prevent background scroll */

  /* Move focus INTO the modal (accessibility requirement) */
  const panel = document.getElementById('rivora-modal-panel');
  const firstFocusable = getFirstFocusable(panel);
  if (firstFocusable) {
    firstFocusable.focus();
  } else {
    panel.focus(); /* fallback */
  }
}

/* ============================================================
   closeRivoraModal
   
   Closes the modal and restores focus.
   ============================================================ */
function closeRivoraModal() {
  if (!_modalElement) return;

  _modalElement.style.display = 'none';
  document.body.style.overflow = ''; /* restore scroll */

  /* Run onClose callback if provided */
  if (typeof _modalElement._onClose === 'function') {
    _modalElement._onClose();
  }

  /*
     Return focus to where it was before the modal opened.
     This is crucial for keyboard users — without it, they
     lose their place on the page.
  */
  if (_previouslyFocusedElement) {
    _previouslyFocusedElement.focus();
  }
}

/* ============================================================
   handleModalKeydown
   
   Handles keyboard events when modal is open.
   
   - Escape → close modal
   - Tab → cycle focus WITHIN modal (focus trap)
   ============================================================ */
function handleModalKeydown(e) {
  /* Only run when modal is visible */
  if (!_modalElement || _modalElement.style.display === 'none') return;

  if (e.key === 'Escape') {
    closeRivoraModal();
    return;
  }

  /* Focus trap — keep Tab key inside the modal */
  if (e.key === 'Tab') {
    const panel       = document.getElementById('rivora-modal-panel');
    const focusables  = getAllFocusable(panel);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey) {
      /* Shift+Tab: going backwards */
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus(); /* wrap to last */
      }
    } else {
      /* Tab: going forwards */
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus(); /* wrap to first */
      }
    }
  }
}

/* ============================================================
   getFirstFocusable
   
   Finds the first keyboard-focusable element inside a container.
   
   @param {HTMLElement} container
   @returns {HTMLElement|null}
   ============================================================ */
function getFirstFocusable(container) {
  return getAllFocusable(container)[0] || null;
}

/* ============================================================
   getAllFocusable
   
   Returns ALL keyboard-focusable elements inside a container.
   
   Focusable elements are: buttons, links, inputs, textareas,
   selects, and anything with tabindex >= 0.
   
   @param {HTMLElement} container
   @returns {HTMLElement[]}
   ============================================================ */
function getAllFocusable(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(selector))
    .filter(el => !el.closest('[hidden]')); /* exclude hidden elements */
}

/* ============================================================
   CSS for the modal — injected dynamically
   
   We inject the CSS from JS so modal.js is truly self-contained.
   This means any page that loads modal.js automatically gets
   the right styles — no separate CSS file to remember.
   ============================================================ */
(function injectModalStyles() {
  /* Don't inject styles twice */
  if (document.getElementById('rivora-modal-styles')) return;

  const style = document.createElement('style');
  style.id = 'rivora-modal-styles';
  style.textContent = `
    /* Modal overlay */
    .rivora-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    /* Dark backdrop */
    .rivora-modal__backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.45);
      z-index: 1000;
    }

    /* The white popup panel */
    .rivora-modal__panel {
      background-color: #ffffff;
      border-radius: 24px;
      max-width: 560px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      z-index: 1001;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      animation: slideUp 250ms ease both;
    }

    /* Close button */
    .rivora-modal__close {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 1;
      background-color: rgba(255,255,255,0.9);
      width: 44px;
      height: 44px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rivora-modal__close:hover {
      background-color: #fef9e7;
    }

    /* Content area */
    .rivora-modal__content {
      padding: 32px;
    }

    /* Modal title */
    .rivora-modal__title {
      font-family: 'Fredoka One', cursive;
      font-size: 1.4rem;
      color: #2c3e50;
      margin-bottom: 16px;
      padding-right: 40px; /* don't overlap close button */
    }

    /* Slide up animation */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

/* Run createModal on DOM ready */
document.addEventListener('DOMContentLoaded', createModal);